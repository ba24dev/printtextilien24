import { formatAccessToken } from "@/lib/shopify/auth/token";
import { CUSTOMER_QUERY } from "@/lib/shopify/customer/queries";
import { getShopifyClientId, getShopifyTokenUrl } from "@/lib/shopify/customer/urls";
import { NextResponse } from "next/server";

import { shopifyCustomerGraphQL } from "./graphql";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
};

function getCustomerCookieDomain(): string | undefined {
  const raw = process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN?.trim();
  return raw ? raw : undefined;
}

type CustomerCookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
};

function customerCookieOptions(options?: CustomerCookieOptions) {
  const domain = getCustomerCookieDomain();
  return {
    httpOnly: options?.httpOnly ?? true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: options?.maxAge,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function clearCustomerCookie(response: NextResponse, name: string): void {
  response.cookies.set(name, "", customerCookieOptions({ httpOnly: false, maxAge: 0 }));
}

export type CustomerIdentity = {
  id: string;
  email: string | null;
};

type SessionValidationResult =
  | {
      authenticated: true;
      accessToken: string;
      customer: CustomerIdentity;
      refreshedTokens?: TokenResponse;
    }
  | {
      authenticated: false;
      reason: "missing_access" | "invalid_access" | "refresh_failed";
    };

function tokenMaxAge(expiresIn?: number): number {
  if (!expiresIn || Number.isNaN(expiresIn)) return 60 * 60;
  return Math.max(60, expiresIn);
}

export function clearCustomerAuthCookies(response: NextResponse): void {
  clearCustomerCookie(response, "shopify_customer_access_token");
  clearCustomerCookie(response, "shopify_customer_refresh_token");
  clearCustomerCookie(response, "shopify_customer_id_token");
  clearCustomerCookie(response, "shopify_post_login_redirect");
}

export function applyCustomerAuthCookies(response: NextResponse, tokenData: TokenResponse): void {
  response.cookies.set(
    "shopify_customer_access_token",
    tokenData.access_token,
    customerCookieOptions({ maxAge: tokenMaxAge(tokenData.expires_in) }),
  );
  if (tokenData.refresh_token) {
    response.cookies.set(
      "shopify_customer_refresh_token",
      tokenData.refresh_token,
      customerCookieOptions({ maxAge: 60 * 60 * 24 * 30 }),
    );
  }
  if (tokenData.id_token) {
    response.cookies.set(
      "shopify_customer_id_token",
      tokenData.id_token,
      customerCookieOptions({ maxAge: tokenMaxAge(tokenData.expires_in) }),
    );
  }
}

async function fetchCustomerIdentity(accessToken: string): Promise<CustomerIdentity> {
  const data = await shopifyCustomerGraphQL<{
    customer?: { id?: string; email?: string | null };
  }>(
    accessToken,
    `
      query CustomerIdentity {
        customer {
          id
          email
        }
      }
    `,
  );
  if (!data.customer?.id) {
    throw new Error("Missing customer identity");
  }
  return {
    id: data.customer.id,
    email: data.customer.email ?? null,
  };
}

export async function refreshCustomerTokens(refreshToken: string): Promise<TokenResponse | null> {
  try {
    const bodyPayload: Record<string, string> = {
      client_id: getShopifyClientId(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
    const secret = process.env.SHOPIFY_CUSTOMER_API_CLIENT_SECRET;
    if (secret) {
      bodyPayload.client_secret = secret;
    }

    const tokenRes = await fetch(getShopifyTokenUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(bodyPayload).toString(),
    });
    if (!tokenRes.ok) {
      return null;
    }

    const tokenData = (await tokenRes.json()) as TokenResponse;
    if (!tokenData.access_token) return null;
    tokenData.access_token = formatAccessToken(tokenData.access_token);
    return tokenData;
  } catch {
    return null;
  }
}

export async function validateCustomerSession(
  accessToken?: string,
  refreshToken?: string,
): Promise<SessionValidationResult> {
  if (!accessToken && !refreshToken) {
    return { authenticated: false, reason: "missing_access" };
  }

  if (accessToken) {
    try {
      const normalized = formatAccessToken(accessToken);
      const customer = await fetchCustomerIdentity(normalized);
      return { authenticated: true, accessToken: normalized, customer };
    } catch {
      // continue with refresh fallback
    }
  }

  if (!refreshToken) {
    return { authenticated: false, reason: "invalid_access" };
  }

  const refreshed = await refreshCustomerTokens(refreshToken);
  if (!refreshed?.access_token) {
    return { authenticated: false, reason: "refresh_failed" };
  }

  try {
    const customer = await fetchCustomerIdentity(refreshed.access_token);
    return {
      authenticated: true,
      accessToken: refreshed.access_token,
      customer,
      refreshedTokens: refreshed,
    };
  } catch {
    return { authenticated: false, reason: "refresh_failed" };
  }
}

export async function fetchCustomerProfile(accessToken: string) {
  return await shopifyCustomerGraphQL<{
    customer?: {
      id: string;
      email: string | null;
      firstName?: string | null;
      lastName?: string | null;
    };
  }>(accessToken, CUSTOMER_QUERY);
}

export async function fetchCustomerOrders(accessToken: string) {
  return await shopifyCustomerGraphQL<{
    customer?: {
      orders?: {
        edges?: Array<{
          node: {
            id: string;
            name: string;
            processedAt: string;
            totalPrice: {
              amount: string;
              currencyCode: string;
            };
          };
        }>;
      };
    };
  }>(
    accessToken,
    `
      query CustomerOrders {
        customer {
          orders(first: 10) {
            edges {
              node {
                id
                name
                processedAt
                totalPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `,
  );
}
