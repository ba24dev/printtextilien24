import { NextRequest, NextResponse } from "next/server";
import {
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (!isShopifyCustomerAuthV2Enabled()) {
    const hasToken = Boolean(request.cookies.get("shopify_customer_access_token")?.value);
    const response = NextResponse.json({ loggedIn: hasToken });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }

  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  const refreshToken = request.cookies.get("shopify_customer_refresh_token")?.value;

  const validation = await validateCustomerSession(accessToken, refreshToken);
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && accessToken) {
      const response = NextResponse.json({ loggedIn: true, degraded: true });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const response = NextResponse.json({ loggedIn: false });
    clearCustomerAuthCookies(response);
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }

  const response = NextResponse.json({
    loggedIn: true,
    customerId: validation.customer.id,
    email: validation.customer.email,
  });
  if (validation.refreshedTokens) {
    applyCustomerAuthCookies(response, validation.refreshedTokens);
  }
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  return response;
}
