import { generatePKCE, randomState } from "@/lib/shopify/auth/pkce";
import {
  normalizeScopes,
  SCOPES,
  unknownScopes,
} from "@/lib/shopify/auth/scopes";
import {
  getCheckoutUnavailableRedirect,
  sanitizePostLoginRedirect,
  sanitizeReturnToRedirect,
} from "@/lib/shopify/customer/redirects";
import {
  getShopifyAuthUrl,
  getShopifyClientId,
} from "@/lib/shopify/customer/urls";
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
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES is empty; authorization URL will fail",
    );
  }
  if (SCOPES.includes(",")) {
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES contains commas; they will be converted to spaces",
    );
  }
  const bad = unknownScopes(SCOPES);
  if (bad.length) {
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES contains unknown/unexpected scopes:",
      bad,
    );
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
      scope: normalizeScopes(SCOPES),
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      prompt: "login",
      max_age: "0",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();

  console.info("redirecting user to Shopify auth URL", authUrl);
  if (SCOPES !== normalizeScopes(SCOPES)) {
    console.info(
      "normalized scopes to",
      normalizeScopes(SCOPES),
      "from",
      SCOPES,
    );
  }

  const checkoutUrl = request.nextUrl.searchParams.get("checkout_url");
  const returnTo = request.nextUrl.searchParams.get("return_to");
  const logoutParam = request.nextUrl.searchParams.get("logout") === "1";

  const hasRecentLogout =
    request.cookies.get("shopify_recent_logout")?.value === "1" ||
    request.cookies.get("shopify_recent_logout_server")?.value === "1";

  // Use the actual cookie that proves your local customer session still exists.
  // Based on your description, this is likely "session_id".
  const hasLocalSession = Boolean(request.cookies.get("session_id")?.value);

  // Suspicious case:
  // Shopify sends us back to /account/login?checkout_url=...
  // but we still have a local session cookie.
  // That should not be treated like a normal checkout-login start.
  const suspiciousCheckoutLogoutReturn =
    Boolean(checkoutUrl && checkoutUrl.trim() !== "") &&
    hasLocalSession &&
    !logoutParam &&
    !hasRecentLogout;

  const isLogoutContext =
    logoutParam || hasRecentLogout || suspiciousCheckoutLogoutReturn;

  const hasCheckoutIntent = Boolean(checkoutUrl && checkoutUrl.trim() !== "");

  // Only keep checkout / return targets for true login flows.
  // If the user just logged out from checkout, Shopify may still send
  // checkout_url back to us. Re-storing it here recreates the redirect loop.
  const checkoutRedirect =
    !isLogoutContext && hasCheckoutIntent
      ? sanitizePostLoginRedirect(checkoutUrl, request.nextUrl)
      : null;

  const returnToRedirect = !isLogoutContext
    ? sanitizeReturnToRedirect(returnTo, request.nextUrl)
    : null;

  const redirectToStore = hasCheckoutIntent
    ? (checkoutRedirect ??
      (!isLogoutContext
        ? getCheckoutUnavailableRedirect(request.nextUrl)
        : null))
    : returnToRedirect;

  const response = NextResponse.redirect(authUrl);
  const transientCookieOptions = getTransientCookieOptions();

  response.cookies.set(
    "shopify_pkce_verifier",
    verifier,
    transientCookieOptions,
  );
  response.cookies.set("shopify_oauth_state", state, transientCookieOptions);
  response.cookies.set("shopify_oauth_nonce", nonce, transientCookieOptions);

  if (!isLogoutContext && redirectToStore) {
    response.cookies.set(
      "shopify_post_login_redirect",
      redirectToStore,
      transientCookieOptions,
    );
  } else {
    clearCustomerCookie(response, "shopify_post_login_redirect");
  }

  setCustomerDebugTrace(
    response,
    isLogoutContext
      ? "login_oauth_started_after_logout"
      : "login_oauth_started",
  );
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}

// helpers exported for tests
export function __testConfig() {
  return { SHOPIFY_CLIENT_ID, SHOPIFY_AUTH_URL, REDIRECT_URI } as const;
}

// also export raw constants in case a test needs them
export { REDIRECT_URI, SHOPIFY_AUTH_URL, SHOPIFY_CLIENT_ID };
