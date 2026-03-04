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
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = "https://12d54a-a9.myshopify.com";
  });

  it("stores post-login redirect cookie when checkout_url is safe", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest("https://example.com/api/auth/customer/login?checkout_url=%2Fcheckout%2Fabc"),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("/checkout/abc");
    const location = response.headers.get("location") || "";
    const parsed = new URL(location);
    expect(parsed.searchParams.get("prompt")).toBe("login");
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

  it("normalizes checkout redirects to the Shopify storefront host", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=https%3A%2F%2Fprinttextilien24.de%2Fcheckouts%2Fcn%2Fabc%3Flocale%3Dde-DE",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe(
      "https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE",
    );
  });
});
