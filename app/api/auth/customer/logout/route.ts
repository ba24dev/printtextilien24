import { NextRequest, NextResponse } from "next/server";

import { getCustomerCookieDomain } from "@/lib/shopify/customer/cookies";
import { getOidcConfiguration } from "@/lib/shopify/customer/discovery";
import { clearCustomerDebugTrace, setCustomerDebugTrace } from "@/lib/shopify/customer/debug-cookie";
import {
  clearCustomerAuthSession,
  resolveCustomerIdToken,
  setRecentLogoutCookies,
} from "@/lib/shopify/customer/session";
import { getShopifyClientId, getShopifyLogoutUrl } from "@/lib/shopify/customer/urls";

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type IdTokenPayload = {
  exp?: number;
  aud?: string | string[];
};

function clearedCookieOptions() {
  const domain = getCustomerCookieDomain();
  return {
    httpOnly: false,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

function clearCookieIfPresent(response: NextResponse, request: NextRequest, name: string): void {
  if (!request.cookies.get(name)) return;
  response.cookies.set(name, "", clearedCookieOptions());
}

function parseJwtPayload(token: string): IdTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload) as IdTokenPayload;
  } catch {
    return null;
  }
}

function safeGetShopifyClientId(): string | undefined {
  try {
    return getShopifyClientId();
  } catch {
    return undefined;
  }
}

function safeGetShopifyLogoutUrl(): string {
  try {
    return getShopifyLogoutUrl();
  } catch {
    return "";
  }
}

function getCanonicalLogoutRedirect(request: NextRequest): string {
  const fallback = new URL("/account/login?logout=1", request.url).toString();
  const configured = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI;
  if (!configured) return fallback;
  try {
    const origin = new URL(configured).origin;
    return new URL("/account/login?logout=1", origin).toString();
  } catch {
    return fallback;
  }
}

export function isUsableIdToken(raw: string | undefined, clientId?: string): raw is string {
  if (!raw) return false;
  const token = raw.trim();
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;

  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return false;
  }

  if (!clientId) return false;

  if (payload.aud) {
    if (typeof payload.aud === "string" && payload.aud !== clientId) {
      return false;
    }
    if (Array.isArray(payload.aud) && !payload.aud.includes(clientId)) {
      return false;
    }
  }
  return true;
}

export async function GET(request: NextRequest) {
  const localRedirect = getCanonicalLogoutRedirect(request);
  
console.info("[customer-logout] start", {
  url: request.url,
  cookieNames: request.cookies.getAll().map((c) => c.name),
  postLoginRedirect: request.cookies.get("shopify_post_login_redirect")?.value ?? null,
  recentLogout: request.cookies.get("shopify_recent_logout")?.value ?? null,
  recentLogoutServer: request.cookies.get("shopify_recent_logout_server")?.value ?? null,
});

  let target = localRedirect;
  let logoutTrace = "logout_completed:local_fallback";
  try {
    const clientId = safeGetShopifyClientId();
    const configuredLogoutUrl = safeGetShopifyLogoutUrl();
    const rawIdToken = await resolveCustomerIdToken(request.cookies);
    let oidcConfig: Awaited<ReturnType<typeof getOidcConfiguration>> = null;
    try {
      oidcConfig = await getOidcConfiguration();
    } catch {
      oidcConfig = null;
    }
    const providerLogoutUrl = oidcConfig?.end_session_endpoint || configuredLogoutUrl;
    if (!providerLogoutUrl) {
      logoutTrace = "logout_completed:local_fallback_no_provider_url";
    } else if (!isUsableIdToken(rawIdToken, clientId)) {
      logoutTrace = clientId
        ? "logout_completed:local_fallback_invalid_id_token"
        : "logout_completed:local_fallback_missing_client_id";
    } else {
      const logoutUrl = new URL(providerLogoutUrl);
      logoutUrl.searchParams.set("id_token_hint", rawIdToken);
      logoutUrl.searchParams.set("post_logout_redirect_uri", localRedirect);
      target = logoutUrl.toString();
      logoutTrace = "logout_completed:provider_redirect";
    }
  } catch {
    target = localRedirect;
    logoutTrace = "logout_completed:local_fallback_error";
  }

  // Clear all customer auth cookies
  const response = NextResponse.redirect(target, { status: 303 });
  await clearCustomerAuthSession(response, request.cookies);
  clearCookieIfPresent(response, request, "shopify_post_login_redirect");
  clearCookieIfPresent(response, request, "shopify_pkce_verifier");
  clearCookieIfPresent(response, request, "shopify_oauth_state");
  clearCookieIfPresent(response, request, "shopify_oauth_nonce");
  setRecentLogoutCookies(response);
  clearCustomerDebugTrace(response);
  setCustomerDebugTrace(response, logoutTrace);
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);

  console.info("[customer-logout] start", {
  url: request.url,
  cookieNames: request.cookies.getAll().map((c) => c.name),
  postLoginRedirect: request.cookies.get("shopify_post_login_redirect")?.value ?? null,
  recentLogout: request.cookies.get("shopify_recent_logout")?.value ?? null,
  recentLogoutServer: request.cookies.get("shopify_recent_logout_server")?.value ?? null,
});
  return response;
}
