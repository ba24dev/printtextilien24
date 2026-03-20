import { SCOPES } from "@/lib/shopify/auth/scopes";
import {
  applyCustomerAuthSession,
  clearCustomerCookie,
  clearRecentLogoutCookies,
} from "@/lib/shopify/customer/session";
import { setCustomerDebugTrace } from "@/lib/shopify/customer/debug-cookie";
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
  const loginUrl = new URL("/account/login", requestUrl);
  loginUrl.searchParams.set("reason", reason);
  const response = NextResponse.redirect(loginUrl.toString());
  setCustomerDebugTrace(response, `callback_redirect_${reason}`);
  clearOAuthTransientCookies(response);
  clearCustomerCookie(response, "shopify_post_login_redirect");
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}

function tokenLength(token: unknown): number {
  return typeof token === "string" ? token.length : 0;
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
      console.warn(
        "Shopify returned a different scope than requested:",
        scope,
        "expected",
        SCOPES,
      );
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
      console.error(
        "Shopify token exchange error",
        tokenRes.status,
        bodyText,
        bodyPayload,
      );
      const response = NextResponse.json(
        { error: "Token exchange failed", details: bodyText },
        { status: 400 },
      );
      setCustomerDebugTrace(
        response,
        `callback_token_exchange_failed_${tokenRes.status}`,
      );
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const tokenContentType = tokenRes.headers?.get?.("content-type") ?? "";
    let tokenData: Record<string, unknown>;
    if (typeof tokenRes.text === "function") {
      const tokenBodyText = await tokenRes.text();
      try {
        tokenData = JSON.parse(tokenBodyText) as Record<string, unknown>;
      } catch (error) {
        console.error("Shopify token exchange returned non-JSON body", {
          status: tokenRes.status,
          contentType: tokenContentType,
          bodyPreview: tokenBodyText.slice(0, 400),
          parseError: error instanceof Error ? error.message : String(error),
        });
        const response = NextResponse.json(
          {
            error: "Token exchange returned invalid response",
            details: `Expected JSON but got ${tokenContentType || "unknown content type"}`,
          },
          { status: 400 },
        );
        setCustomerDebugTrace(response, "callback_token_exchange_invalid_json");
        response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
        return response;
      }
    } else if (typeof tokenRes.json === "function") {
      tokenData = (await tokenRes.json()) as Record<string, unknown>;
    } else {
      const response = NextResponse.json(
        {
          error: "Token exchange returned invalid response",
          details: "Token endpoint response body is not readable",
        },
        { status: 400 },
      );
      setCustomerDebugTrace(response, "callback_token_exchange_invalid_body");
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    console.debug("token exchange payload meta", {
      contentType: tokenContentType,
      scope: typeof tokenData.scope === "string" ? tokenData.scope : undefined,
      hasAccessToken: Boolean(tokenData.access_token),
      hasRefreshToken: Boolean(tokenData.refresh_token),
      hasIdToken: Boolean(tokenData.id_token),
    });
    if (!tokenData?.access_token) {
      const response = NextResponse.json(
        { error: "Missing access token from Shopify" },
        { status: 400 },
      );
      setCustomerDebugTrace(response, "callback_missing_access_token");
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const normalizedTokenData = {
      access_token: String(tokenData.access_token),
      refresh_token:
        typeof tokenData.refresh_token === "string"
          ? tokenData.refresh_token
          : undefined,
      expires_in:
        typeof tokenData.expires_in === "number"
          ? tokenData.expires_in
          : undefined,
      id_token:
        typeof tokenData.id_token === "string" ? tokenData.id_token : undefined,
    };
    // tokenData: { access_token, refresh_token, expires_in, id_token, ... }

    // determine where we should send the user after login; default to
    // /account but allow a previously stored destination (e.g. a
    // checkout_url from Shopify) to override.
    const postLogin = request.cookies.get("shopify_post_login_redirect")?.value;
    const recentLogout =
      request.cookies.get("shopify_recent_logout")?.value === "1" ||
      request.cookies.get("shopify_recent_logout_server")?.value === "1";
    const redirectTarget = recentLogout
      ? new URL("/account/login?logout=1", request.url).toString()
      : resolvePostLoginRedirect(postLogin, request.url);

    const response = NextResponse.redirect(redirectTarget);
    try {
      await applyCustomerAuthSession(response, normalizedTokenData, {
        existingSessionId: request.cookies.get("shopify_customer_session_id")
          ?.value,
      });
    } catch (error) {
      console.error("Failed to persist customer auth cookies", {
        error: error instanceof Error ? error.message : String(error),
        accessTokenLength: tokenLength(normalizedTokenData.access_token),
        refreshTokenLength: tokenLength(normalizedTokenData.refresh_token),
        idTokenLength: tokenLength(normalizedTokenData.id_token),
      });
      return redirectToLogin(request.url, "auth_cookie_write_failed");
    }
    if (!normalizedTokenData.id_token) {
      clearCustomerCookie(response, "shopify_customer_id_token");
    }
    clearRecentLogoutCookies(response);
    // Clear PKCE and state cookies
    clearOAuthTransientCookies(response);
    // and clear our custom destination cookie so it won't stick around
    if (postLogin) {
      clearCustomerCookie(response, "shopify_post_login_redirect");
    }
    setCustomerDebugTrace(response, "callback_success_cookies_set");
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  } catch (err) {
    console.error("callback handler unexpected error", err);
    const response = NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
    setCustomerDebugTrace(response, "callback_unexpected_error");
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }
}

// exports/helpers for tests
export function __testConfig() {
  return { SHOPIFY_CLIENT_ID, SHOPIFY_TOKEN_URL, REDIRECT_URI } as const;
}
export { REDIRECT_URI, SHOPIFY_CLIENT_ID, SHOPIFY_TOKEN_URL };
