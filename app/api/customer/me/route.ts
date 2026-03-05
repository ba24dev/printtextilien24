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

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (!isShopifyCustomerAuthV2Enabled()) {
    const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
    if (!accessToken) {
      const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }

    try {
      const token = formatAccessToken(accessToken);
      const customer = await shopifyCustomerGraphQL(token, CUSTOMER_QUERY);
      const orders = await shopifyCustomerGraphQL(token, CUSTOMER_ORDERS_QUERY);
      const response = NextResponse.json({
        customer: customer.customer,
        orders: orders.customer.orders,
      });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Customer API request failed";
      const response = NextResponse.json({ error: message }, { status: 502 });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
  }

  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  const refreshToken = request.cookies.get("shopify_customer_refresh_token")?.value;
  const validation = await validateCustomerSession(accessToken, refreshToken);
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && accessToken) {
      const response = NextResponse.json(
        { error: "Customer API temporarily unavailable. Please retry shortly." },
        { status: 503 },
      );
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }
    const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    clearCustomerAuthCookies(response);
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
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
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Customer API request failed";
    const response = NextResponse.json({ error: message }, { status: 502 });
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }
}
