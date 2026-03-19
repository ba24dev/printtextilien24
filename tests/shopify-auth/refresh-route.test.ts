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

async function importRefreshRoute() {
  return await import("@/app/api/auth/customer/refresh/route");
}

describe("refresh route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "https://shopify.com/authentication/123/oauth/token";
  });

  it("requires reauthentication during recent logout window", async () => {
    const fetchSpy = vi.spyOn(global, "fetch" as any);
    const { GET } = await importRefreshRoute();

    const req = makeRequest({
      shopify_customer_refresh_token: "refresh-123",
      shopify_recent_logout_server: "1",
    });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({
      error: "Recent logout - reauthentication required",
    });
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
