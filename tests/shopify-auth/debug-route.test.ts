import { beforeEach, describe, expect, it, vi } from "vitest";

type HeaderMap = Record<string, string | undefined>;

function makeRequest(url: string, cookies?: Record<string, string | undefined>, headers?: HeaderMap) {
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => {
        const value = cookies?.[name];
        if (!value) return undefined;
        return { value } as any;
      },
    },
    headers: {
      get: (name: string) => headers?.[name.toLowerCase()] ?? null,
    },
  } as any;
}

async function importDebugRoute() {
  return await import("@/app/api/auth/customer/debug/route");
}

describe("customer debug route", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SHOPIFY_CUSTOMER_DEBUG_KEY;
    delete process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID;
    delete process.env.SHOPIFY_CUSTOMER_API_AUTH_URL;
    delete process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL;
    delete process.env.SHOPIFY_CUSTOMER_API_LOGOUT_URL;
    delete process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI;
    delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;
  });

  it("returns 401 when debug key is configured and missing", async () => {
    process.env.SHOPIFY_CUSTOMER_DEBUG_KEY = "secret";
    const { GET } = await importDebugRoute();
    const res = await GET(makeRequest("https://example.com/api/auth/customer/debug"));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns cookie diagnostics without network probe by default", async () => {
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
    process.env.SHOPIFY_CUSTOMER_API_AUTH_URL = "https://shopify.com/authentication/123/oauth/authorize";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "https://shopify.com/authentication/123/oauth/token";
    process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI =
      "https://printtextilien24.de/api/auth/customer/callback";

    const { GET } = await importDebugRoute();
    const res = await GET(
      makeRequest(
        "https://printtextilien24.de/api/auth/customer/debug",
        { shopify_customer_access_token: "shcat_abc" },
        { cookie: "shopify_customer_access_token=shcat_abc", host: "printtextilien24.de" },
      ),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.cookies.shopify_customer_access_token.present).toBe(true);
    expect(body.cookies.hasCookieHeader).toBe(true);
    expect(body.probe.enabled).toBe(false);
    expect(body.env.redirectOriginMatchesRequestOrigin).toBe(true);
  });

  it("accepts debug key from query param", async () => {
    process.env.SHOPIFY_CUSTOMER_DEBUG_KEY = "secret";
    const { GET } = await importDebugRoute();
    const res = await GET(
      makeRequest("https://example.com/api/auth/customer/debug?key=secret", {}, { host: "example.com" }),
    );

    expect(res.status).toBe(200);
  });

  it("can set a test cookie for browser/proxy diagnostics", async () => {
    const { GET } = await importDebugRoute();
    const res = await GET(
      makeRequest(
        "https://printtextilien24.de/api/auth/customer/debug?set_test_cookie=1",
        {},
        { host: "printtextilien24.de" },
      ),
    );

    expect(res.status).toBe(200);
    expect(res.cookies.get("shopify_customer_debug_test")?.value).toContain("ok-");
  });
});
