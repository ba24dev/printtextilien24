import { generatePKCE, randomState } from "@/lib/shopify/auth/pkce";
import { normalizeScopes, SCOPES, unknownScopes } from "@/lib/shopify/auth/scopes";
import {
  getCheckoutUnavailableRedirect,
  sanitizePostLoginRedirect,
  sanitizeReturnToRedirect,
} from "@/lib/shopify/customer/redirects";
import { getShopifyAuthUrl, getShopifyClientId } from "@/lib/shopify/customer/urls";
import { getCustomerCookieDomain } from "@/lib/shopify/customer/cookies";
import { setCustomerDebugTrace } from "@/lib/shopify/customer/debug-cookie";
import { NextRequest, NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/shopify/customer/session";

const SHOPIFY_CLIENT_ID = getShopifyClientId();
const SHOPIFY_AUTH_URL = getShopifyAuthUrl();
const REDIRECT_URI = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI!;
const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// note: SCOPES is imported from a shared helper. It defaults to
// customer-account-api:full and can be overridden via env.

function getCanonicalOriginFromRedirectUri(): string | null {
  try {
    return new URL(REDIRECT_URI).origin;
  } catch {
    return null;
  }
}

function normalizeComparableHost(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

function shouldRedirectToCanonicalOrigin(
  requestOrigin: string,
  canonicalOrigin: string,
): boolean {
  try {
    const requestUrl = new URL(requestOrigin);
    const canonicalUrl = new URL(canonicalOrigin);
    if (requestUrl.origin === canonicalUrl.origin) {
      return false;
    }
    // avoid redirect loops when hosting forces www<->apex rewrites
    if (
      requestUrl.protocol === canonicalUrl.protocol &&
      normalizeComparableHost(requestUrl.hostname) ===
        normalizeComparableHost(canonicalUrl.hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return requestOrigin !== canonicalOrigin;
  }
}

function getTransientCookieOptions() {
  const domain = getCustomerCookieDomain();
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 300,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export async function GET(request: NextRequest) {
  // Don’t canonicalize the API login URL; old canonicalization can loop under
  // reverse proxies / ngrok if Next’s request origin and callback origin differ.
  // We still use the redirect URI directly when exchanging auth code.

  // warn if the scopes string is blank – this is a common misconfiguration
  if (!SCOPES || SCOPES.trim() === "") {
    console.warn("SHOPIFY_CUSTOMER_API_SCOPES is empty; authorization URL will fail");
  }
  if (SCOPES.includes(",")) {
    console.warn("SHOPIFY_CUSTOMER_API_SCOPES contains commas; they will be converted to spaces");
  }
  const bad = unknownScopes(SCOPES);
  if (bad.length) {
    console.warn("SHOPIFY_CUSTOMER_API_SCOPES contains unknown/unexpected scopes:", bad);
  }

  // Generate PKCE verifier/challenge
  const { verifier, challenge } = await generatePKCE();
  const state = randomState();
  const nonce = randomState();

  // build the authorization URL so we can examine it in logs
  const authUrl =
    `${SHOPIFY_AUTH_URL}?` +
    new URLSearchParams({
      client_id: SHOPIFY_CLIENT_ID,
      // if SCOPES is accidentally empty or contains invalid entries
      // Shopify will immediately render an error page rather than
      // redirecting back; keeping this construction explicit makes it
      // easier to log/inspect during development.
      //
      // note: public Headless clients don’t show `openid` or `email` in
      // the permissions UI, so requesting them here will produce the
      // "invalid scope" error.  Only ask for scopes which you’ve enabled
      // in the Shopify admin.
      scope: normalizeScopes(SCOPES),
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      // shared devices: always force explicit credential entry instead of
      // silently reusing an existing Shopify SSO session.
      prompt: "login",
      // force a fresh authentication event (OIDC); complements prompt=login.
      max_age: "0",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();

  console.info("redirecting user to Shopify auth URL", authUrl);
  if (SCOPES !== normalizeScopes(SCOPES)) {
    console.info("normalized scopes to", normalizeScopes(SCOPES), "from", SCOPES);
  }
  const checkoutUrl = request.nextUrl.searchParams.get("checkout_url");
  const returnTo = request.nextUrl.searchParams.get("return_to");
  const hasCheckoutIntent = Boolean(checkoutUrl && checkoutUrl.trim() !== "");
  const checkoutRedirect = sanitizePostLoginRedirect(checkoutUrl, request.nextUrl);
  const returnToRedirect = sanitizeReturnToRedirect(returnTo, request.nextUrl);
  const redirectToStore = hasCheckoutIntent
    ? checkoutRedirect ?? getCheckoutUnavailableRedirect(request.nextUrl)
    : returnToRedirect;

  const response = NextResponse.redirect(authUrl);
  const transientCookieOptions = getTransientCookieOptions();
  response.cookies.set("shopify_pkce_verifier", verifier, transientCookieOptions);
  response.cookies.set("shopify_oauth_state", state, transientCookieOptions);
  response.cookies.set("shopify_oauth_nonce", nonce, transientCookieOptions);
  if (redirectToStore) {
    response.cookies.set("shopify_post_login_redirect", redirectToStore, transientCookieOptions);
  } else {
    clearCustomerCookie(response, "shopify_post_login_redirect");
  }
  setCustomerDebugTrace(response, "login_oauth_started");
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}

// helpers exported for tests
export function __testConfig() {
  return { SHOPIFY_CLIENT_ID, SHOPIFY_AUTH_URL, REDIRECT_URI } as const;
}

// also export raw constants in case a test needs them
export { REDIRECT_URI, SHOPIFY_AUTH_URL, SHOPIFY_CLIENT_ID };
