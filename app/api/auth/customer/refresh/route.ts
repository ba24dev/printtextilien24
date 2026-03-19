import { NextRequest, NextResponse } from "next/server";

import {
  applyCustomerAuthSession,
  clearCustomerAuthSession,
  isRecentLogoutActive,
  resolveCustomerAuthTokens,
  refreshCustomerTokens,
} from "@/lib/shopify/customer/session";

export async function GET(request: NextRequest) {
  if (isRecentLogoutActive(request.cookies)) {
    const response = NextResponse.json({ error: "Recent logout - reauthentication required" }, { status: 401 });
    await clearCustomerAuthSession(response, request.cookies);
    return response;
  }

  const tokens = await resolveCustomerAuthTokens(request.cookies);
  if (!tokens.refreshToken) {
    const response = NextResponse.json({ error: "No refresh token" }, { status: 401 });
    await clearCustomerAuthSession(response, request.cookies);
    return response;
  }

  const tokenData = await refreshCustomerTokens(tokens.refreshToken);
  if (!tokenData) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    await clearCustomerAuthSession(response, request.cookies);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  await applyCustomerAuthSession(response, tokenData, { existingSessionId: tokens.sessionId });
  return response;
}
