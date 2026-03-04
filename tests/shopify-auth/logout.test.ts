import { beforeEach, describe, expect, it, vi } from "vitest";

function toBase64Url(value: object): string {
  return Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeIdToken(aud: string, expOffsetSec = 300): string {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url({ alg: "none", typ: "JWT" });
  const payload = toBase64Url({ aud, exp: now + expOffsetSec });
  return `${header}.${payload}.sig`;
}

function makeRequest(url: string, cookies?: Record<string, string | undefined>) {
  return {
    url,
    cookies: {
      get: (name: string) => {
        const value = cookies?.[name];
        if (!value) return undefined;
        return { value } as any;
      },
    },
  } as any;
}

async function importLogoutRoute() {
  return await import("@/app/api/auth/customer/logout/route");
}

describe("logout route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SHOPIFY_CUSTOMER_API_LOGOUT_URL = "https://shopify.com/authentication/123/logout";
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
  });

  it("calls Shopify logout with id_token_hint and return URI when id token exists", async () => {
    const { GET } = await importLogoutRoute();
    const res = await GET(
      makeRequest("https://printtextilien24.de/api/auth/customer/logout", {
        shopify_customer_id_token: makeIdToken("test-client-id"),
      }),
    );
    const location = res.headers.get("location") || "";
    const parsed = new URL(location);

    expect(parsed.origin + parsed.pathname).toBe("https://shopify.com/authentication/123/logout");
    expect(parsed.searchParams.get("id_token_hint")).toBeTruthy();
    expect(parsed.searchParams.get("post_logout_redirect_uri")).toBe("https://printtextilien24.de/");
    expect(res.cookies.get("shopify_customer_access_token")?.value).toBe("");
    expect(res.cookies.get("shopify_customer_refresh_token")?.value).toBe("");
    expect(res.cookies.get("shopify_customer_id_token")?.value).toBe("");
  });

  it("falls back to local home redirect when id token is missing", async () => {
    const { GET } = await importLogoutRoute();
    const res = await GET(makeRequest("https://printtextilien24.de/api/auth/customer/logout"));
    const location = res.headers.get("location") || "";
    expect(location).toBe("https://printtextilien24.de/");
  });

  it("falls back to local home redirect when id token is invalid", async () => {
    const { GET } = await importLogoutRoute();
    const res = await GET(
      makeRequest("https://printtextilien24.de/api/auth/customer/logout", {
        shopify_customer_id_token: "not-a-jwt",
      }),
    );
    const location = res.headers.get("location") || "";
    expect(location).toBe("https://printtextilien24.de/");
  });
});
