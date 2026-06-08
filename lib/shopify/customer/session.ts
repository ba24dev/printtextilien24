import { formatAccessToken } from "@/lib/shopify/auth/token";
import { getCustomerCookieDomain } from "@/lib/shopify/customer/cookies";
import { isShopifyCustomerSessionStoreKvEnabled } from "@/lib/shopify/customer/feature";
import {
  CUSTOMER_QUERY,
  CUSTOMER_TAGS_QUERY,
  CUSTOMER_TAGS_QUERY_FALLBACK,
} from "@/lib/shopify/customer/queries";
import {
  customerSessionTtlSeconds,
  deleteCustomerSessionRecord,
  readCustomerSessionRecord,
  writeCustomerSessionRecord,
} from "@/lib/shopify/customer/session-store";
import { getShopifyClientId, getShopifyTokenUrl } from "@/lib/shopify/customer/urls";
import { NextResponse } from "next/server";

import { shopifyCustomerGraphQL } from "./graphql";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
};

type CustomerCookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
};

const TOKEN_COOKIE_CHUNK_SIZE = 1800;
const MAX_TOKEN_COOKIE_CHUNKS = 12;
const CHUNKED_COOKIE_SENTINEL = "__chunked__";
const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const RECENT_LOGOUT_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export const CUSTOMER_SESSION_COOKIE_NAME = "shopify_customer_session_id";
export const CUSTOMER_RECENT_LOGOUT_COOKIE_NAME = "shopify_recent_logout";
export const CUSTOMER_RECENT_LOGOUT_SERVER_COOKIE_NAME = "shopify_recent_logout_server";
const TOKEN_COOKIE_NAMES = new Set([
  "shopify_customer_access_token",
  "shopify_customer_refresh_token",
  "shopify_customer_id_token",
]);

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

export type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export type CustomerAuthTokens = {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  sessionId?: string;
};

function serializeTokenCookieValue(value: string): string {
  return `uri:${encodeURIComponent(value)}`;
}

function deserializeTokenCookieValue(value: string): string {
  if (!value.startsWith("uri:")) return value;
  const encoded = value.slice("uri:".length);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

function chunkCountCookieName(name: string): string {
  return `${name}_chunks`;
}

function chunkCookieName(name: string, index: number): string {
  return `${name}_${index}`;
}

function clearCookie(response: NextResponse, name: string): void {
  response.cookies.set(name, "", customerCookieOptions({ httpOnly: false, maxAge: 0 }));
}

function clearHttpOnlyCookie(response: NextResponse, name: string): void {
  response.cookies.set(name, "", customerCookieOptions({ httpOnly: true, maxAge: 0 }));
}

function clearTokenChunkCookies(
  response: NextResponse,
  name: string,
  options?: { clearChunks?: boolean },
): void {
  clearCookie(response, chunkCountCookieName(name));
  if (options?.clearChunks) {
    for (let index = 0; index < MAX_TOKEN_COOKIE_CHUNKS; index += 1) {
      clearCookie(response, chunkCookieName(name, index));
    }
  }
}

function setTokenCookie(
  response: NextResponse,
  name: string,
  tokenValue: string,
  maxAge: number,
): void {
  const serialized = serializeTokenCookieValue(tokenValue);
  if (serialized.length <= TOKEN_COOKIE_CHUNK_SIZE) {
    response.cookies.set(name, serialized, customerCookieOptions({ maxAge }));
    // Clearing the chunk-count cookie is enough; stale chunk cookies are ignored
    // as long as the primary cookie value is present and not chunked.
    clearTokenChunkCookies(response, name);
    return;
  }

  const chunkCount = Math.ceil(serialized.length / TOKEN_COOKIE_CHUNK_SIZE);
  if (chunkCount > MAX_TOKEN_COOKIE_CHUNKS) {
    throw new Error("Token too large to store in cookies");
  }

  response.cookies.set(name, CHUNKED_COOKIE_SENTINEL, customerCookieOptions({ maxAge }));
  response.cookies.set(
    chunkCountCookieName(name),
    String(chunkCount),
    customerCookieOptions({ maxAge }),
  );
  for (let index = 0; index < chunkCount; index += 1) {
    const start = index * TOKEN_COOKIE_CHUNK_SIZE;
    const end = start + TOKEN_COOKIE_CHUNK_SIZE;
    const chunk = serialized.slice(start, end);
    response.cookies.set(chunkCookieName(name, index), chunk, customerCookieOptions({ maxAge }));
  }
}

export function readCustomerCookie(cookieStore: CookieStoreLike, name: string): string | undefined {
  const baseValue = cookieStore.get(name)?.value;
  if (baseValue && baseValue !== CHUNKED_COOKIE_SENTINEL) {
    return deserializeTokenCookieValue(baseValue);
  }

  const chunkCountRaw = cookieStore.get(chunkCountCookieName(name))?.value;
  if (!chunkCountRaw) {
    return undefined;
  }

  const chunkCount = Number.parseInt(chunkCountRaw, 10);
  if (!Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > MAX_TOKEN_COOKIE_CHUNKS) {
    return undefined;
  }

  let combined = "";
  for (let index = 0; index < chunkCount; index += 1) {
    const chunk = cookieStore.get(chunkCookieName(name, index))?.value;
    if (!chunk) return undefined;
    combined += chunk;
  }
  if (!combined) return undefined;
  return deserializeTokenCookieValue(combined);
}

export function clearCustomerCookie(response: NextResponse, name: string): void {
  clearCookie(response, name);
  if (TOKEN_COOKIE_NAMES.has(name)) {
    // During normal auth redirects, keep this lightweight to avoid oversized
    // response headers. Clearing the count cookie invalidates chunked reads.
    clearTokenChunkCookies(response, name);
  }
}

function setCustomerSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(
    CUSTOMER_SESSION_COOKIE_NAME,
    sessionId,
    customerCookieOptions({ httpOnly: true, maxAge: AUTH_SESSION_MAX_AGE_SECONDS }),
  );
}

function clearCustomerSessionCookie(response: NextResponse): void {
  clearHttpOnlyCookie(response, CUSTOMER_SESSION_COOKIE_NAME);
}

export function setRecentLogoutCookies(response: NextResponse): void {
  response.cookies.set(
    CUSTOMER_RECENT_LOGOUT_COOKIE_NAME,
    "1",
    customerCookieOptions({
      httpOnly: false,
      maxAge: RECENT_LOGOUT_COOKIE_MAX_AGE_SECONDS,
    }),
  );
  response.cookies.set(
    CUSTOMER_RECENT_LOGOUT_SERVER_COOKIE_NAME,
    "1",
    customerCookieOptions({
      httpOnly: true,
      maxAge: RECENT_LOGOUT_COOKIE_MAX_AGE_SECONDS,
    }),
  );
}

export function clearRecentLogoutCookies(response: NextResponse): void {
  clearCookie(response, CUSTOMER_RECENT_LOGOUT_COOKIE_NAME);
  clearHttpOnlyCookie(response, CUSTOMER_RECENT_LOGOUT_SERVER_COOKIE_NAME);
}

export function isRecentLogoutActive(cookieStore: CookieStoreLike): boolean {
  return (
    cookieStore.get(CUSTOMER_RECENT_LOGOUT_SERVER_COOKIE_NAME)?.value === "1" ||
    cookieStore.get(CUSTOMER_RECENT_LOGOUT_COOKIE_NAME)?.value === "1"
  );
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
      reason:
        | "missing_access"
        | "invalid_access"
        | "refresh_failed"
        | "provider_unavailable"
        | "recent_logout";
    };

function isProviderUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("could not resolve shopify customer graphql endpoint") ||
    message.includes("shopify customer api error: 404") ||
    message.includes("shopify customer api error: 429") ||
    message.includes("shopify customer api error: 5") ||
    message.includes("fetch failed") ||
    message.includes("network error")
  );
}

function tokenMaxAge(expiresIn?: number): number {
  if (!expiresIn || Number.isNaN(expiresIn)) return 60 * 60;
  return Math.max(60, expiresIn);
}

export function clearCustomerAuthCookies(response: NextResponse): void {
  clearCustomerCookie(response, "shopify_customer_access_token");
  clearCustomerCookie(response, "shopify_customer_refresh_token");
  clearCustomerCookie(response, "shopify_customer_id_token");
  clearCustomerCookie(response, "shopify_post_login_redirect");
  clearCustomerSessionCookie(response);
}

export function applyCustomerAuthCookies(response: NextResponse, tokenData: TokenResponse): void {
  const accessTokenMaxAge = tokenMaxAge(tokenData.expires_in);
  setTokenCookie(response, "shopify_customer_access_token", tokenData.access_token, accessTokenMaxAge);
  if (tokenData.refresh_token) {
    setTokenCookie(
      response,
      "shopify_customer_refresh_token",
      tokenData.refresh_token,
      60 * 60 * 24 * 30,
    );
  }
  if (tokenData.id_token) {
    setTokenCookie(response, "shopify_customer_id_token", tokenData.id_token, accessTokenMaxAge);
  }
}

function fallbackCustomerAuthTokens(cookieStore: CookieStoreLike): CustomerAuthTokens {
  return {
    accessToken: readCustomerCookie(cookieStore, "shopify_customer_access_token"),
    refreshToken: readCustomerCookie(cookieStore, "shopify_customer_refresh_token"),
    idToken: readCustomerCookie(cookieStore, "shopify_customer_id_token"),
  };
}

export async function resolveCustomerAuthTokens(
  cookieStore: CookieStoreLike,
): Promise<CustomerAuthTokens> {
  if (!isShopifyCustomerSessionStoreKvEnabled()) {
    return fallbackCustomerAuthTokens(cookieStore);
  }

  const sessionId = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return {};

  try {
    const session = await readCustomerSessionRecord(sessionId);
    if (!session) {
      return { sessionId };
    }
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      idToken: session.idToken,
      sessionId,
    };
  } catch {
    return { sessionId };
  }
}

export async function resolveCustomerIdToken(cookieStore: CookieStoreLike): Promise<string | undefined> {
  const tokens = await resolveCustomerAuthTokens(cookieStore);
  return tokens.idToken;
}

export async function applyCustomerAuthSession(
  response: NextResponse,
  tokenData: TokenResponse,
  options?: { existingSessionId?: string },
): Promise<void> {
  if (!isShopifyCustomerSessionStoreKvEnabled()) {
    applyCustomerAuthCookies(response, tokenData);
    return;
  }

  const existingSessionId = options?.existingSessionId;
  const sessionId = existingSessionId || crypto.randomUUID();
  let existingRefreshToken: string | undefined;
  let existingIdToken: string | undefined;

  if (existingSessionId) {
    try {
      const previous = await readCustomerSessionRecord(existingSessionId);
      existingRefreshToken = previous?.refreshToken;
      existingIdToken = previous?.idToken;
    } catch {
      // Best effort read; continue with new token payload.
    }
  }

  const refreshToken = tokenData.refresh_token ?? existingRefreshToken;
  const idToken = tokenData.id_token ?? existingIdToken;
  const ttlSeconds = customerSessionTtlSeconds(tokenData.expires_in ?? AUTH_SESSION_MAX_AGE_SECONDS);

  await writeCustomerSessionRecord(
    sessionId,
    {
      accessToken: tokenData.access_token,
      refreshToken,
      idToken,
      expiresAt: tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + Math.max(60, Math.floor(tokenData.expires_in))
        : undefined,
    },
    ttlSeconds,
  );

  setCustomerSessionCookie(response, sessionId);
  clearCustomerCookie(response, "shopify_customer_access_token");
  clearCustomerCookie(response, "shopify_customer_refresh_token");
  clearCustomerCookie(response, "shopify_customer_id_token");
}

export async function clearCustomerAuthSession(
  response: NextResponse,
  cookieStore?: CookieStoreLike,
): Promise<void> {
  if (isShopifyCustomerSessionStoreKvEnabled()) {
    const sessionId = cookieStore?.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
      try {
        await deleteCustomerSessionRecord(sessionId);
      } catch {
        // Cookie is still cleared below, even if delete fails.
      }
    }
  }
  if (!cookieStore) {
    clearCustomerAuthCookies(response);
    return;
  }

  if (cookieStore.get("shopify_customer_access_token")) {
    clearCustomerCookie(response, "shopify_customer_access_token");
  }
  if (cookieStore.get("shopify_customer_refresh_token")) {
    clearCustomerCookie(response, "shopify_customer_refresh_token");
  }
  if (cookieStore.get("shopify_customer_id_token")) {
    clearCustomerCookie(response, "shopify_customer_id_token");
  }
  if (cookieStore.get("shopify_post_login_redirect")) {
    clearCustomerCookie(response, "shopify_post_login_redirect");
  }
  if (cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)) {
    clearCustomerSessionCookie(response);
  }
}

async function fetchCustomerIdentity(accessToken: string): Promise<CustomerIdentity> {
  const data = await shopifyCustomerGraphQL<{
    customer?: {
      id?: string;
      emailAddress?: { emailAddress?: string | null } | null;
    };
  }>(
    accessToken,
    `
      query CustomerIdentity {
        customer {
          id
          emailAddress {
            emailAddress
          }
        }
      }
    `,
  );
  if (!data.customer?.id) {
    throw new Error("Missing customer identity");
  }
  return {
    id: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? null,
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
  options?: { allowRefresh?: boolean },
): Promise<SessionValidationResult> {
  if (!accessToken && !refreshToken) {
    return { authenticated: false, reason: "missing_access" };
  }

  if (accessToken) {
    try {
      const normalized = formatAccessToken(accessToken);
      const customer = await fetchCustomerIdentity(normalized);
      return { authenticated: true, accessToken: normalized, customer };
    } catch (error) {
      if (isProviderUnavailableError(error)) {
        return { authenticated: false, reason: "provider_unavailable" };
      }
      // continue with refresh fallback
    }
  }

  if (!refreshToken) {
    return { authenticated: false, reason: "invalid_access" };
  }

  if (options?.allowRefresh === false) {
    return { authenticated: false, reason: "recent_logout" };
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
  } catch (error) {
    if (isProviderUnavailableError(error)) {
      return { authenticated: false, reason: "provider_unavailable" };
    }
    return { authenticated: false, reason: "refresh_failed" };
  }
}

export async function fetchCustomerProfile(accessToken: string) {
  const result = await shopifyCustomerGraphQL<{
    customer?: {
      id: string;
      emailAddress?: { emailAddress?: string | null } | null;
      firstName?: string | null;
      lastName?: string | null;
    };
  }>(accessToken, CUSTOMER_QUERY);

  return {
    ...result,
    customer: result.customer
      ? {
          ...result.customer,
          email: result.customer.emailAddress?.emailAddress ?? null,
        }
      : undefined,
  };
}

function shouldFallbackForCustomerTags(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    (message.includes("field") && message.includes("doesn't exist on type")) ||
    message.includes("access denied")
  );
}

export async function fetchCustomerTags(accessToken: string): Promise<string[]> {
  try {
    const data = await shopifyCustomerGraphQL<{
      customer?: {
        tags?: string[];
      };
    }>(accessToken, CUSTOMER_TAGS_QUERY);

    return Array.isArray(data.customer?.tags) ? data.customer.tags : [];
  } catch (error) {
    if (!shouldFallbackForCustomerTags(error)) {
      throw error;
    }

    await shopifyCustomerGraphQL(accessToken, CUSTOMER_TAGS_QUERY_FALLBACK);
    return [];
  }
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
