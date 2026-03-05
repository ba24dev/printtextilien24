import { NextRequest, NextResponse } from "next/server";

import { getOidcConfiguration } from "@/lib/shopify/customer/discovery";
import { clearCustomerCookie } from "@/lib/shopify/customer/session";
import { getShopifyClientId, getShopifyLogoutUrl } from "@/lib/shopify/customer/urls";

const SHOPIFY_LOGOUT_URL = getShopifyLogoutUrl();
const SHOPIFY_CLIENT_ID = getShopifyClientId();

type IdTokenPayload = {
  exp?: number;
  aud?: string | string[];
};

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

export function isUsableIdToken(raw: string | undefined): raw is string {
  if (!raw) return false;
  const token = raw.trim();
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;

  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return false;
  }

  if (payload.aud) {
    if (typeof payload.aud === "string" && payload.aud !== SHOPIFY_CLIENT_ID) {
      return false;
    }
    if (Array.isArray(payload.aud) && !payload.aud.includes(SHOPIFY_CLIENT_ID)) {
      return false;
    }
  }
  return true;
}

export async function GET(request: NextRequest) {
  const localRedirect = new URL("/login?logout=1", request.url).toString();
  const rawIdToken = request.cookies.get("shopify_customer_id_token")?.value;
  let oidcConfig: Awaited<ReturnType<typeof getOidcConfiguration>> = null;
  try {
    oidcConfig = await getOidcConfiguration();
  } catch {
    oidcConfig = null;
  }
  const providerLogoutUrl = oidcConfig?.end_session_endpoint || SHOPIFY_LOGOUT_URL;

  let target = localRedirect;
  if (providerLogoutUrl && isUsableIdToken(rawIdToken)) {
    const logoutUrl = new URL(providerLogoutUrl);
    logoutUrl.searchParams.set("id_token_hint", rawIdToken);
    logoutUrl.searchParams.set("post_logout_redirect_uri", localRedirect);
    target = logoutUrl.toString();
  }

  // Clear all customer auth cookies
  const response = NextResponse.redirect(target);
  clearCustomerCookie(response, "shopify_customer_access_token");
  clearCustomerCookie(response, "shopify_customer_refresh_token");
  clearCustomerCookie(response, "shopify_customer_id_token");
  clearCustomerCookie(response, "shopify_post_login_redirect");
  clearCustomerCookie(response, "shopify_pkce_verifier");
  clearCustomerCookie(response, "shopify_oauth_state");
  clearCustomerCookie(response, "shopify_oauth_nonce");
  return response;
}
