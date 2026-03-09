import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { formatAccessToken } from "@/lib/shopify/auth/token";
import {
  CUSTOMER_ORDERS_QUERY_FALLBACK,
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_QUERY_FALLBACK,
  CUSTOMER_QUERY,
} from "@/lib/shopify/customer/queries";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";
import {
  applyCustomerAuthCookies,
  readCustomerCookie,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";
import { NextRequest, NextResponse } from "next/server";

const NO_STORE_CACHE_CONTROL = "no-store, no-cache, max-age=0, must-revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeCustomerEmail(customer?: {
  emailAddress?: { emailAddress?: string | null } | null;
  [key: string]: unknown;
}) {
  if (!customer) return undefined;
  return {
    ...customer,
    email: customer.emailAddress?.emailAddress ?? null,
  };
}

function shouldFallbackForSchemaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("field") && message.includes("doesn't exist on type");
}

async function fetchCustomerBundle(accessToken: string) {
  try {
    const customer = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY);
    const orders = await shopifyCustomerGraphQL(accessToken, CUSTOMER_ORDERS_QUERY);
    return {
      customer: normalizeCustomerEmail(customer.customer),
      orders: orders.customer.orders,
    };
  } catch (error) {
    if (!shouldFallbackForSchemaError(error)) {
      throw error;
    }

    const customer = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY_FALLBACK);
    const orders = await shopifyCustomerGraphQL(accessToken, CUSTOMER_ORDERS_QUERY_FALLBACK);
    return {
      customer: normalizeCustomerEmail(customer.customer),
      orders: orders.customer.orders,
    };
  }
}

export async function GET(request: NextRequest) {
  if (!isShopifyCustomerAuthV2Enabled()) {
    const accessToken = readCustomerCookie(request.cookies, "shopify_customer_access_token");
    if (!accessToken) {
      const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }

    try {
      const token = formatAccessToken(accessToken);
      const data = await fetchCustomerBundle(token);
      const response = NextResponse.json({
        customer: data.customer,
        orders: data.orders,
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

  const accessToken = readCustomerCookie(request.cookies, "shopify_customer_access_token");
  const refreshToken = readCustomerCookie(request.cookies, "shopify_customer_refresh_token");
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
    const response = NextResponse.json(
      { error: "Not authenticated", reason: validation.reason },
      { status: 401 },
    );
    response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
    return response;
  }

  try {
    const data = await fetchCustomerBundle(validation.accessToken);

    const response = NextResponse.json({
      customer: data.customer,
      orders: data.orders,
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
