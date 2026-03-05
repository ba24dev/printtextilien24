import { beforeEach, describe, expect, it, vi } from "vitest";

function makeRequest(cookies: Record<string, string | undefined>) {
  return {
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        if (!value) return undefined;
        return { value } as any;
      },
    },
  } as any;
}

async function importSessionRoute() {
  return await import("@/app/api/customer/session/route");
}

describe("session route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "https://shopify.com/authentication/123/oauth/token";
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = "https://12d54a-a9.myshopify.com";
    delete process.env.SHOPIFY_CUSTOMER_AUTH_V2;
  });

  it("returns loggedOut when no token cookies exist", async () => {
    const { GET } = await importSessionRoute();
    const req = makeRequest({});
    const res = await GET(req);
    await expect(res.json()).resolves.toEqual({ loggedIn: false, reason: "missing_access" });
  });

  it("uses legacy cookie-presence mode when SHOPIFY_CUSTOMER_AUTH_V2=false", async () => {
    process.env.SHOPIFY_CUSTOMER_AUTH_V2 = "false";
    const fetchSpy = vi.spyOn(global, "fetch" as any);

    const { GET } = await importSessionRoute();
    const req = makeRequest({ shopify_customer_access_token: "legacy-token" });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({ loggedIn: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
    delete process.env.SHOPIFY_CUSTOMER_AUTH_V2;
  });

  it("returns strict loggedIn payload when access token validates", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api: "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
            }),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({
            data: {
              customer: {
                id: "gid://shopify/Customer/1",
                email: "hello@example.com",
              },
            },
          }),
        } as any;
      });

    const { GET } = await importSessionRoute();
    const req = makeRequest({ shopify_customer_access_token: "token-123" });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({
      loggedIn: true,
      customerId: "gid://shopify/Customer/1",
      email: "hello@example.com",
    });
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("reads chunked access-token cookies", async () => {
    const longToken = "a".repeat(2600);
    const serialized = `uri:${encodeURIComponent(longToken)}`;
    const chunkSize = 1800;
    const chunks = [
      serialized.slice(0, chunkSize),
      serialized.slice(chunkSize),
    ];

    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api: "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
            }),
          } as any;
        }
        const auth = String((args[1] as any)?.headers?.Authorization || "");
        expect(auth.length).toBeGreaterThan(2000);
        return {
          ok: true,
          json: async () => ({
            data: {
              customer: {
                id: "gid://shopify/Customer/99",
                email: "chunked@example.com",
              },
            },
          }),
        } as any;
      });

    const { GET } = await importSessionRoute();
    const req = makeRequest({
      shopify_customer_access_token: "__chunked__",
      shopify_customer_access_token_chunks: "2",
      shopify_customer_access_token_0: chunks[0],
      shopify_customer_access_token_1: chunks[1],
    });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({
      loggedIn: true,
      customerId: "gid://shopify/Customer/99",
      email: "chunked@example.com",
    });
    fetchSpy.mockRestore();
  });

  it("refreshes token once if access token is invalid", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        const method = String((args[1] as any)?.method || "GET");
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api: "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
            }),
          } as any;
        }
        if (url.endsWith("/oauth/token") && method === "POST") {
          return {
            ok: true,
            json: async () => ({
              access_token: "new-token",
              refresh_token: "new-refresh",
              expires_in: 1200,
            }),
          } as any;
        }
        const auth = String((args[1] as any)?.headers?.Authorization || "");
        if (auth.includes("token-123")) {
          return {
            ok: true,
            json: async () => ({ errors: [{ message: "Invalid token" }] }),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({
            data: {
              customer: {
                id: "gid://shopify/Customer/2",
                email: "refresh@example.com",
              },
            },
          }),
        } as any;
      });

    const { GET } = await importSessionRoute();
    const req = makeRequest({
      shopify_customer_access_token: "token-123",
      shopify_customer_refresh_token: "refresh-123",
    });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({
      loggedIn: true,
      customerId: "gid://shopify/Customer/2",
      email: "refresh@example.com",
    });
    expect(res.cookies.get("shopify_customer_access_token")?.value).toBe("uri:shcat_new-token");
    expect(res.cookies.get("shopify_customer_refresh_token")?.value).toBe("uri:new-refresh");
    fetchSpy.mockRestore();
  });

  it("keeps logged-in state when customer API is temporarily unavailable", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api: "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
            }),
          } as any;
        }
        return {
          ok: false,
          status: 404,
          text: async () => "Not found",
        } as any;
      });

    const { GET } = await importSessionRoute();
    const req = makeRequest({ shopify_customer_access_token: "token-123" });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({ loggedIn: true, degraded: true });
    expect(res.cookies.get("shopify_customer_access_token")).toBeUndefined();
    fetchSpy.mockRestore();
  });

  it("returns loggedOut without clearing cookies when refresh fails", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        const method = String((args[1] as any)?.method || "GET");
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api: "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
            }),
          } as any;
        }
        if (url.endsWith("/oauth/token") && method === "POST") {
          return {
            ok: false,
            text: async () => "refresh failed",
          } as any;
        }
        return {
          ok: true,
          json: async () => ({ errors: [{ message: "Invalid token" }] }),
        } as any;
      });

    const { GET } = await importSessionRoute();
    const req = makeRequest({
      shopify_customer_access_token: "token-123",
      shopify_customer_refresh_token: "refresh-123",
    });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({ loggedIn: false, reason: "refresh_failed" });
    expect(res.cookies.get("shopify_customer_access_token")).toBeUndefined();
    expect(res.cookies.get("shopify_customer_refresh_token")).toBeUndefined();
    fetchSpy.mockRestore();
  });
});
