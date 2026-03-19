import { beforeEach, describe, expect, it, vi } from "vitest";

function makeRequest(url: string, cookies?: Record<string, string | undefined>) {
  return {
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => ({ value: cookies?.[name] }) as any,
    },
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
    expect(response.cookies.get("shopify_customer_debug_trace")?.value).toContain(
      "login_oauth_started",
    );
    const location = response.headers.get("location") || "";
    const parsed = new URL(location);
    expect(parsed.searchParams.get("prompt")).toBe("login");
    expect(parsed.searchParams.get("max_age")).toBe("0");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("does not store post-login redirect cookie when checkout_url is external", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=https%3A%2F%2Fevil.com%2Fsteal",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe(
      "https://example.com/account?checkout_error=1",
    );
  });

  it("normalizes checkout redirects to the Shopify storefront host", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=https%3A%2F%2Fprinttextilien24.de%2Fcheckouts%2Fcn%2Fabc%3Flocale%3Dde-DE",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe(
      "https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE&logged_in=true",
    );
  });

  it("stores post-login redirect cookie when return_to is a safe relative path", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest("https://example.com/api/auth/customer/login?return_to=%2Fproducts%3Fq%3Dshirt"),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("/products?q=shirt");
  });

  it("does not store return_to when it points to an external host", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?return_to=https%3A%2F%2Fevil.com%2Fsteal",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("");
  });

  it("prefers checkout_url over return_to when both are provided", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=%2Fcheckout%2Fabc&return_to=%2Fproducts",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("/checkout/abc");
  });

  it("uses checkout fallback when checkout_url is invalid even if return_to is present", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=https%3A%2F%2Fevil.com%2Fsteal&return_to=%2Fproducts",
      ),
    );

    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe(
      "https://example.com/account?checkout_error=1",
    );
  });

  it("does not store checkout redirect when recent logout is active", async () => {
    const { GET } = await importLoginRoute();
    const response = await GET(
      makeRequest(
        "https://example.com/api/auth/customer/login?checkout_url=%2Fcheckout%2Fabc",
        { shopify_recent_logout: "1" },
      ),
    );
    expect(response.cookies.get("shopify_post_login_redirect")?.value).toBe("");
  });
});
