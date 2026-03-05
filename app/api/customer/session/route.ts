import { NextRequest, NextResponse } from "next/server";
import {
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";

export async function GET(request: NextRequest) {
  if (!isShopifyCustomerAuthV2Enabled()) {
    const hasToken = Boolean(request.cookies.get("shopify_customer_access_token")?.value);
    return NextResponse.json({ loggedIn: hasToken });
  }

  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  const refreshToken = request.cookies.get("shopify_customer_refresh_token")?.value;

  const validation = await validateCustomerSession(accessToken, refreshToken);
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && accessToken) {
      return NextResponse.json({ loggedIn: true, degraded: true });
    }
    const response = NextResponse.json({ loggedIn: false });
    clearCustomerAuthCookies(response);
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
  return response;
}
