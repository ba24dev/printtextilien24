import { beforeEach, describe, expect, it, vi } from "vitest";

// create a fake request-like object with a URL property and optional
// cookies.  The middleware handler only reads `cookies.get().value`, so we
// mirror that interface.
function makeRequest(url: string, cookies?: Record<string, string | undefined>) {
  return {
    url,
    cookies: {
      get: (name: string) => ({ value: cookies?.[name] }) as any,
    },
  } as unknown as Request;
}

async function importCallbackRoute() {
  return await import("@/app/api/auth/customer/callback/route");
}

async function importScopes() {
  return await import("@/lib/shopify/auth/scopes");
}

describe("callback route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "https://shopify.com/authentication/123/oauth/token";
    process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI =
      "https://example.com/api/auth/customer/callback";
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = "https://12d54a-a9.myshopify.com";
  });

  it("warns if Shopify returns a different scope than requested", async () => {
    const { GET } = await importCallbackRoute();
    const { SCOPES } = await importScopes();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = makeRequest("https://example.com/?code=abc&state=xyz&scope=not_allowed");
    // call handler; it will return early due to missing cookies but after
    // logging
    const res: any = await GET(req as any);
    expect(warn).toHaveBeenCalledWith(
      "Shopify returned a different scope than requested:",
      "not_allowed",
      "expected",
      SCOPES,
    );
    expect(res.headers.get("location")).toBe(
      "https://example.com/account/login?reason=auth_session_expired",
    );
    expect(res.cookies.get("shopify_customer_debug_trace")?.value).toContain(
      "callback_redirect_auth_session_expired",
    );
    warn.mockRestore();
  });

  it("uses stored post-login redirect when available", async () => {
    const { GET } = await importCallbackRoute();
    // stub fetch to return a successful token response
    const fakeFetch = vi.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 1234,
        id_token: "id-token-1",
      }),
    } as any);

    const req = makeRequest("https://example.com/?code=abc&state=xyz", {
      shopify_oauth_state: "xyz",
      shopify_pkce_verifier: "verifier",
      shopify_post_login_redirect: "/checkout/somewhere",
    });

    const res: any = await GET(req as any);
    const loc = res.headers.get("location") || "";
    expect(loc).toBe("https://example.com/checkout/somewhere");
    expect(res.cookies.get("shopify_customer_id_token")?.value).toBe("uri:id-token-1");
    expect(res.cookies.get("shopify_customer_debug_trace")?.value).toContain(
      "callback_success_cookies_set",
    );

    fakeFetch.mockRestore();
  });

  it("forces checkout redirects to the Shopify storefront host", async () => {
    const { GET } = await importCallbackRoute();
    const fakeFetch = vi.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 1234,
        id_token: "id-token-2",
      }),
    } as any);

    const req = makeRequest("https://example.com/?code=abc&state=xyz", {
      shopify_oauth_state: "xyz",
      shopify_pkce_verifier: "verifier",
      shopify_post_login_redirect: "/checkouts/cn/abc?locale=de-DE",
    });

    const res: any = await GET(req as any);
    const loc = res.headers.get("location") || "";
    expect(loc).toBe("https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE&logged_in=true");

    fakeFetch.mockRestore();
  });

  it("falls back to account when stored checkout redirect is invalid", async () => {
    const { GET } = await importCallbackRoute();
    const fakeFetch = vi.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 1234,
        id_token: "id-token-3",
      }),
    } as any);

    const req = makeRequest("https://example.com/?code=abc&state=xyz", {
      shopify_oauth_state: "xyz",
      shopify_pkce_verifier: "verifier",
      shopify_post_login_redirect: "https://evil.com/stale-checkout",
    });

    const res: any = await GET(req as any);
    const loc = res.headers.get("location") || "";
    expect(loc).toBe("https://example.com/account?checkout_error=1");

    fakeFetch.mockRestore();
  });
});
