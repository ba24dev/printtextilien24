import { NextRequest, NextResponse } from "next/server";

import {
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
  readCustomerCookie,
  refreshCustomerTokens,
} from "@/lib/shopify/customer/session";

export async function GET(request: NextRequest) {
  const refreshToken = readCustomerCookie(request.cookies, "shopify_customer_refresh_token");
  if (!refreshToken) {
    const response = NextResponse.json({ error: "No refresh token" }, { status: 401 });
    clearCustomerAuthCookies(response);
    return response;
  }

  const tokenData = await refreshCustomerTokens(refreshToken);
  if (!tokenData) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    clearCustomerAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  applyCustomerAuthCookies(response, tokenData);
  return response;
}
