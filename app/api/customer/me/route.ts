import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { formatAccessToken } from "@/lib/shopify/auth/token";
import {
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_QUERY,
} from "@/lib/shopify/customer/queries";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";
import {
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!isShopifyCustomerAuthV2Enabled()) {
    const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
      const token = formatAccessToken(accessToken);
      const customer = await shopifyCustomerGraphQL(token, CUSTOMER_QUERY);
      const orders = await shopifyCustomerGraphQL(token, CUSTOMER_ORDERS_QUERY);
      return NextResponse.json({
        customer: customer.customer,
        orders: orders.customer.orders,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Customer API request failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  const refreshToken = request.cookies.get("shopify_customer_refresh_token")?.value;
  const validation = await validateCustomerSession(accessToken, refreshToken);
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && accessToken) {
      return NextResponse.json(
        { error: "Customer API temporarily unavailable. Please retry shortly." },
        { status: 503 },
      );
    }
    const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    clearCustomerAuthCookies(response);
    return response;
  }

  try {
    const customer = await shopifyCustomerGraphQL(validation.accessToken, CUSTOMER_QUERY);
    const orders = await shopifyCustomerGraphQL(
      validation.accessToken,
      CUSTOMER_ORDERS_QUERY,
    );

    const response = NextResponse.json({
      customer: customer.customer,
      orders: orders.customer.orders,
    });
    if (validation.refreshedTokens) {
      applyCustomerAuthCookies(response, validation.refreshedTokens);
    }
    return response;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Customer API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
