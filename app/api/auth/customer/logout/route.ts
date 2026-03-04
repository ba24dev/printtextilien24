import { NextRequest, NextResponse } from "next/server";

import { getShopifyClientId, getShopifyLogoutUrl } from "@/lib/shopify/customer/urls";

const SHOPIFY_LOGOUT_URL = getShopifyLogoutUrl();
const SHOPIFY_CLIENT_ID = getShopifyClientId();

type IdTokenPayload = {
  aud?: string | string[];
  exp?: number;
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

  const audList = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  if (!audList.includes(SHOPIFY_CLIENT_ID)) {
    return false;
  }
  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  const localRedirect = new URL("/", request.url).toString();
  const rawIdToken = request.cookies.get("shopify_customer_id_token")?.value;

  let target = localRedirect;
  if (SHOPIFY_LOGOUT_URL && isUsableIdToken(rawIdToken)) {
    const logoutUrl = new URL(SHOPIFY_LOGOUT_URL);
    logoutUrl.searchParams.set("id_token_hint", rawIdToken);
    logoutUrl.searchParams.set("post_logout_redirect_uri", localRedirect);
    target = logoutUrl.toString();
  }

  // Clear all customer auth cookies
  const response = NextResponse.redirect(target);
  response.cookies.set("shopify_customer_access_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_customer_refresh_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_customer_id_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_post_login_redirect", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_pkce_verifier", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_oauth_state", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_oauth_nonce", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
