import { NextRequest, NextResponse } from "next/server";

import { getCustomerCookieDomain } from "@/lib/shopify/customer/cookies";
import { getCustomerApiDiscovery, getOidcConfiguration } from "@/lib/shopify/customer/discovery";
import { isShopifyCustomerAuthV2Enabled } from "@/lib/shopify/customer/feature";
import { readCustomerCookie, validateCustomerSession } from "@/lib/shopify/customer/session";
import {
  getShopifyAuthUrl,
  getShopifyClientId,
  getShopifyLogoutUrl,
  getShopifyStorefrontOrigin,
  getShopifyTokenUrl,
} from "@/lib/shopify/customer/urls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SafeResult<T> = { ok: true; value: T } | { ok: false; error: string };

function safe<T>(fn: () => T): SafeResult<T> {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function toBoolParam(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function getTestCookieOptions() {
  const domain = getCustomerCookieDomain();
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

function tokenSummary(token?: string) {
  if (!token) return { present: false };
  return {
    present: true,
    length: token.length,
    startsWithShcat: token.startsWith("shcat_"),
    startsWithBearer: /^bearer\s+/i.test(token),
    preview: token.slice(0, 12),
  };
}

type JwtPayload = { aud?: string | string[]; exp?: number };

function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function readCookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

async function getDiscoveryReport() {
  const customerDiscovery = await getCustomerApiDiscovery();
  const oidc = await getOidcConfiguration();
  return {
    customerApiDiscovery: customerDiscovery
      ? {
          available: true,
          graphql_api: customerDiscovery.graphql_api
            ? redactUrl(customerDiscovery.graphql_api)
            : null,
        }
      : { available: false, graphql_api: null },
    oidc: oidc
      ? {
          available: true,
          end_session_endpoint: oidc.end_session_endpoint
            ? redactUrl(oidc.end_session_endpoint)
            : null,
        }
      : { available: false, end_session_endpoint: null },
  };
}

function getEnvReport(request: NextRequest) {
  const authUrl = safe(() => getShopifyAuthUrl());
  const tokenUrl = safe(() => getShopifyTokenUrl());
  const logoutUrl = safe(() => getShopifyLogoutUrl());
  const clientId = safe(() => getShopifyClientId());
  const storefrontOrigin = safe(() => getShopifyStorefrontOrigin());

  const redirectUriRaw = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI || null;
  const cookieDomainRaw = process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN ?? null;
  const redirectOrigin = safe(() => (redirectUriRaw ? new URL(redirectUriRaw).origin : null));
  const requestOrigin = request.nextUrl.origin;

  return {
    authV2Enabled: isShopifyCustomerAuthV2Enabled(),
    redirectUri: redirectUriRaw,
    redirectUriOrigin: redirectOrigin.ok ? redirectOrigin.value : null,
    requestOrigin,
    redirectOriginMatchesRequestOrigin:
      redirectOrigin.ok && typeof redirectOrigin.value === "string"
        ? redirectOrigin.value === requestOrigin
        : null,
    storefrontOrigin: storefrontOrigin.ok ? storefrontOrigin.value : null,
    cookieDomain: getCustomerCookieDomain() ?? null,
    cookieDomainRaw,
    cookieDomainEnvPresent: cookieDomainRaw !== null,
    clientIdPreview: clientId.ok ? clientId.value.slice(0, 8) : null,
    authUrl: authUrl.ok ? redactUrl(authUrl.value) : null,
    tokenUrl: tokenUrl.ok ? redactUrl(tokenUrl.value) : null,
    logoutUrl: logoutUrl.ok ? redactUrl(logoutUrl.value) : null,
    errors: [authUrl, tokenUrl, clientId, redirectOrigin, storefrontOrigin]
      .filter((entry): entry is { ok: false; error: string } => !entry.ok)
      .map((entry) => entry.error),
  };
}

function isDebugAuthorized(request: NextRequest): boolean {
  const expected = process.env.SHOPIFY_CUSTOMER_DEBUG_KEY?.trim();
  if (!expected) return true;
  const provided =
    request.nextUrl.searchParams.get("key")?.trim() ??
    request.headers.get("x-shopify-debug-key")?.trim() ??
    "";
  return provided.length > 0 && provided === expected;
}

export async function GET(request: NextRequest) {
  if (!isDebugAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const probeEnabled = toBoolParam(request.nextUrl.searchParams.get("probe"));
  const setTestCookie = toBoolParam(request.nextUrl.searchParams.get("set_test_cookie"));
  const clearTestCookie = toBoolParam(request.nextUrl.searchParams.get("clear_test_cookie"));
  const accessToken = readCustomerCookie(request.cookies, "shopify_customer_access_token");
  const refreshToken = readCustomerCookie(request.cookies, "shopify_customer_refresh_token");
  const idToken = readCustomerCookie(request.cookies, "shopify_customer_id_token");

  const idPayload = decodeJwtPayload(idToken);
  const idTokenExp = typeof idPayload?.exp === "number" ? idPayload.exp : null;
  const now = Math.floor(Date.now() / 1000);

  const cookieReport = {
    hasCookieHeader: Boolean(request.headers.get("cookie")),
    shopify_customer_access_token: tokenSummary(accessToken),
    shopify_customer_refresh_token: tokenSummary(refreshToken),
    shopify_customer_id_token: {
      ...tokenSummary(idToken),
      aud: idPayload?.aud ?? null,
      exp: idTokenExp,
      expired: typeof idTokenExp === "number" ? idTokenExp <= now : null,
    },
    shopify_oauth_state: tokenSummary(readCookie(request, "shopify_oauth_state")),
    shopify_pkce_verifier: tokenSummary(readCookie(request, "shopify_pkce_verifier")),
    shopify_oauth_nonce: tokenSummary(readCookie(request, "shopify_oauth_nonce")),
    shopify_post_login_redirect: {
      present: Boolean(readCookie(request, "shopify_post_login_redirect")),
      value: readCookie(request, "shopify_post_login_redirect") ?? null,
    },
    shopify_customer_debug_trace: {
      present: Boolean(readCookie(request, "shopify_customer_debug_trace")),
      value: readCookie(request, "shopify_customer_debug_trace") ?? null,
    },
  };

  let probe: Record<string, unknown> = { enabled: false };
  if (probeEnabled) {
    let discovery: unknown = null;
    let discoveryError: string | null = null;
    try {
      discovery = await getDiscoveryReport();
    } catch (error) {
      discoveryError = error instanceof Error ? error.message : "Unknown discovery error";
    }

    let sessionValidation: unknown = null;
    let sessionValidationError: string | null = null;
    try {
      const validation = await validateCustomerSession(accessToken, refreshToken);
      sessionValidation = validation.authenticated
        ? {
            authenticated: true,
            customerId: validation.customer.id,
            email: validation.customer.email,
            refreshedTokens: Boolean(validation.refreshedTokens),
          }
        : { authenticated: false, reason: validation.reason };
    } catch (error) {
      sessionValidationError =
        error instanceof Error ? error.message : "Unknown session validation error";
    }

    probe = {
      enabled: true,
      discovery,
      discoveryError,
      sessionValidation,
      sessionValidationError,
    };
  }

  const response = NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      env: getEnvReport(request),
      request: {
        url: request.url,
        host: request.headers.get("host"),
        xForwardedHost: request.headers.get("x-forwarded-host"),
        xForwardedProto: request.headers.get("x-forwarded-proto"),
      },
      cookies: cookieReport,
      testCookie: {
        setRequested: setTestCookie,
        clearRequested: clearTestCookie,
        presentOnRequest: Boolean(readCookie(request, "shopify_customer_debug_test")),
      },
      probe,
    },
    { status: 200 },
  );
  if (setTestCookie) {
    response.cookies.set("shopify_customer_debug_test", `ok-${Date.now()}`, getTestCookieOptions());
  }
  if (clearTestCookie) {
    response.cookies.set("shopify_customer_debug_test", "", {
      ...getTestCookieOptions(),
      maxAge: 0,
    });
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
