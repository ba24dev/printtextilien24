import { NextRequest, NextResponse } from "next/server";
import {
  applyCustomerAuthSession,
  fetchCustomerTags,
  isRecentLogoutActive,
  resolveCustomerAuthTokens,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const tokens = await resolveCustomerAuthTokens(request.cookies);
  const allowRefresh = !isRecentLogoutActive(request.cookies);

  if (!isShopifyCustomerAuthV2Enabled()) {
    const hasToken = Boolean(tokens.accessToken);
    const response = NextResponse.json({ loggedIn: hasToken });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }

  const validation = await validateCustomerSession(tokens.accessToken, tokens.refreshToken, {
    allowRefresh,
  });
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && tokens.accessToken) {
      const response = NextResponse.json({ loggedIn: true, degraded: true });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const response = NextResponse.json({
      loggedIn: false,
      reason: validation.reason,
    });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }

  const tags = await fetchCustomerTags(validation.accessToken).catch(() => [] as string[]);

  const response = NextResponse.json({
    loggedIn: true,
    customerId: validation.customer.id,
    email: validation.customer.email,
    tags,
  });
  if (validation.refreshedTokens) {
    await applyCustomerAuthSession(response, validation.refreshedTokens, {
      existingSessionId: tokens.sessionId,
    });
  }
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}
