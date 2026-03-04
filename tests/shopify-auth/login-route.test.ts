import { beforeEach, describe, expect, it, vi } from "vitest";

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as any;
}

async function importLoginRoute() {
  return await import("@/app/api/auth/customer/login/route");
}

describe("login route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID = "test-client-id";
    process.env.SHOPIFY_CUSTOMER_API_AUTH_URL = "https://shopify.com/authentication/123/oauth/authorize";
    process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI =
      "https://example.com/api/auth/customer/callback";
  });

  it("stores post-login redirect cookie when checkout_url is safe", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest("https://example.com/api/auth/customer/login?checkout_url=%2Fcheckout%2Fabc"),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("/checkout/abc");
  });

  it("does not store post-login redirect cookie when checkout_url is external", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=https%3A%2F%2Fevil.com%2Fsteal",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")).toBeUndefined();
  });
});
