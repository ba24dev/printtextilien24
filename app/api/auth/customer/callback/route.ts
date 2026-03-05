import { SCOPES } from "@/lib/shopify/auth/scopes";
import { applyCustomerAuthCookies, clearCustomerCookie } from "@/lib/shopify/customer/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  getShopifyClientId,
  getShopifyTokenUrl,
} from "@/lib/shopify/customer/urls";
import { resolvePostLoginRedirect } from "@/lib/shopify/customer/redirects";

const SHOPIFY_CLIENT_ID = getShopifyClientId();
const SHOPIFY_TOKEN_URL = getShopifyTokenUrl();
const REDIRECT_URI = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI!;
const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";
// public (web) clients have no secret; it’s optional
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_API_CLIENT_SECRET;

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  scope: z.string().optional(),
  context: z.string().optional(),
});

function clearOAuthTransientCookies(response: NextResponse): void {
  clearCustomerCookie(response, "shopify_pkce_verifier");
  clearCustomerCookie(response, "shopify_oauth_state");
  clearCustomerCookie(response, "shopify_oauth_nonce");
}

function redirectToLogin(requestUrl: string, reason: string): NextResponse {
  const loginUrl = new URL("/login", requestUrl);
  loginUrl.searchParams.set("reason", reason);
  const response = NextResponse.redirect(loginUrl.toString());
  clearOAuthTransientCookies(response);
  clearCustomerCookie(response, "shopify_post_login_redirect");
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}

export async function GET(request: NextRequest) {
  console.debug("callback handler invoked");
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    console.debug("callback params", params);
    const parsed = CallbackSchema.safeParse(params);
    if (!parsed.success) {
      console.warn("callback params failed validation", params);
      return redirectToLogin(request.url, "auth_invalid_callback");
    }
    const { code, state, scope } = parsed.data;
    console.debug("received code,state,scope", { code, state, scope });
    if (scope && scope !== SCOPES) {
      console.warn("Shopify returned a different scope than requested:", scope, "expected", SCOPES);
    }

    // Validate state matches cookie
    const stateCookie = request.cookies.get("shopify_oauth_state")?.value;
    const verifier = request.cookies.get("shopify_pkce_verifier")?.value;
    console.debug("cookies", { stateCookie, verifier });
    if (!stateCookie || stateCookie !== state) {
      console.warn("state cookie mismatch", stateCookie, state);
      return redirectToLogin(request.url, "auth_session_expired");
    }

    // Get PKCE verifier from cookie
    if (!verifier) {
      console.warn("no PKCE verifier cookie present");
      return redirectToLogin(request.url, "auth_session_expired");
    }

    // Exchange code for tokens
    const bodyPayload: Record<string, unknown> = {
      client_id: SHOPIFY_CLIENT_ID,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    };
    if (SHOPIFY_CLIENT_SECRET) {
      bodyPayload.client_secret = SHOPIFY_CLIENT_SECRET;
    }

    // Shopify expects a form‑encoded body rather than JSON
    const urlencoded = new URLSearchParams();
    Object.entries(bodyPayload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) urlencoded.set(k, String(v));
    });

    const tokenRes = await fetch(SHOPIFY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlencoded.toString(),
    });
    if (!tokenRes.ok) {
      const bodyText = await tokenRes.text();
      console.error("Shopify token exchange error", tokenRes.status, bodyText, bodyPayload);
      const response = NextResponse.json(
        { error: "Token exchange failed", details: bodyText },
        { status: 400 },
      );
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const tokenData = await tokenRes.json();
    if (!tokenData?.access_token) {
      const response = NextResponse.json(
        { error: "Missing access token from Shopify" },
        { status: 400 },
      );
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    // tokenData: { access_token, refresh_token, expires_in, id_token, ... }

    // determine where we should send the user after login; default to
    // /account but allow a previously stored destination (e.g. a
    // checkout_url from Shopify) to override.
    const postLogin = request.cookies.get("shopify_post_login_redirect")?.value;
    const redirectTarget = resolvePostLoginRedirect(postLogin, request.url);

    const response = NextResponse.redirect(redirectTarget);
    applyCustomerAuthCookies(response, tokenData);
    if (!tokenData.id_token) {
      clearCustomerCookie(response, "shopify_customer_id_token");
    }
    // Clear PKCE and state cookies
    clearOAuthTransientCookies(response);
    // and clear our custom destination cookie so it won't stick around
    if (postLogin) {
      clearCustomerCookie(response, "shopify_post_login_redirect");
    }
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  } catch (err) {
    console.error("callback handler unexpected error", err);
    const response = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }
}

// exports/helpers for tests
export function __testConfig() {
  return { SHOPIFY_CLIENT_ID, SHOPIFY_TOKEN_URL, REDIRECT_URI } as const;
}
export { REDIRECT_URI, SHOPIFY_CLIENT_ID, SHOPIFY_TOKEN_URL };
