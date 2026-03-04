import { NextRequest, NextResponse } from "next/server";

import { getShopifyLogoutUrl } from "@/lib/shopify/customer/urls";

const SHOPIFY_LOGOUT_URL = getShopifyLogoutUrl();

export async function GET(request: NextRequest) {
  // Clear all customer auth cookies
  const response = NextResponse.redirect(SHOPIFY_LOGOUT_URL || "/");
  response.cookies.set("shopify_customer_access_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("shopify_customer_refresh_token", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
