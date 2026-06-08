import {
  applyCustomerAuthSession,
  isRecentLogoutActive,
  resolveCustomerAuthTokens,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { NextRequest, NextResponse } from "next/server";

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export async function requireCustomerAccessToken(request: NextRequest): Promise<
  | {
      ok: true;
      accessToken: string;
      withAuthCookies: (response: NextResponse) => Promise<void>;
    }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const tokens = await resolveCustomerAuthTokens(request.cookies);
  const allowRefresh = !isRecentLogoutActive(request.cookies);
  const validation = await validateCustomerSession(tokens.accessToken, tokens.refreshToken, {
    allowRefresh,
  });
  if (!validation.authenticated) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("reason", "auth_session_expired");
    const response = NextResponse.redirect(loginUrl, { status: 303 });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return { ok: false, response };
  }

  return {
    ok: true,
    accessToken: validation.accessToken,
    withAuthCookies: async (response: NextResponse) => {
      if (validation.refreshedTokens) {
        await applyCustomerAuthSession(response, validation.refreshedTokens, {
          existingSessionId: tokens.sessionId,
        });
      }
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    },
  };
}

export function redirectToAccount(request: NextRequest, params?: Record<string, string>): NextResponse {
  const url = new URL("/account", request.url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  const response = NextResponse.redirect(url, { status: 303 });
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}
