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
  applyCustomerAuthSession,
  isRecentLogoutActive,
  resolveCustomerAuthTokens,
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
  let customerData: any;
  try {
    customerData = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY);
  } catch (error) {
    if (!shouldFallbackForSchemaError(error)) {
      throw error;
    }
    customerData = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY_FALLBACK);
  }

  let ordersData: any;
  try {
    ordersData = await shopifyCustomerGraphQL(accessToken, CUSTOMER_ORDERS_QUERY);
  } catch (error) {
    if (!shouldFallbackForSchemaError(error)) {
      throw error;
    }
    ordersData = await shopifyCustomerGraphQL(accessToken, CUSTOMER_ORDERS_QUERY_FALLBACK);
  }

  return {
    customer: normalizeCustomerEmail(customerData.customer),
    orders: ordersData.customer.orders,
  };
}

export async function GET(request: NextRequest) {
  const tokens = await resolveCustomerAuthTokens(request.cookies);
  const allowRefresh = !isRecentLogoutActive(request.cookies);

  if (!isShopifyCustomerAuthV2Enabled()) {
    if (!tokens.accessToken) {
      const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
      return response;
    }

    try {
      const token = formatAccessToken(tokens.accessToken);
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

  const validation = await validateCustomerSession(tokens.accessToken, tokens.refreshToken, {
    allowRefresh,
  });
  if (!validation.authenticated) {
    if (validation.reason === "provider_unavailable" && tokens.accessToken) {
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
      await applyCustomerAuthSession(response, validation.refreshedTokens, {
        existingSessionId: tokens.sessionId,
      });
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
