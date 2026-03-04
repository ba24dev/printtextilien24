import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getShopifyAuthUrl, getShopifyTokenUrl } from "@/lib/shopify/customer/urls";

// These helpers simply read the corresponding environment variable and throw
// if it is missing or empty.  Shopify’s authentication service uses a numeric
// identifier in the path, which cannot be derived from the client ID or the
// shop domain, so the full URL string is required.

describe("Customer OAuth endpoint configuration", () => {
  let originalAuth: string | undefined;
  let originalToken: string | undefined;

  beforeEach(() => {
    originalAuth = process.env.SHOPIFY_CUSTOMER_API_AUTH_URL;
    originalToken = process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL;
  });

  afterEach(() => {
    process.env.SHOPIFY_CUSTOMER_API_AUTH_URL = originalAuth;
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = originalToken;
  });

  it("errors when URLs are missing and returns provided values", () => {
    process.env.SHOPIFY_CUSTOMER_API_AUTH_URL = "";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "";

    expect(() => getShopifyAuthUrl()).toThrow(
      /SHOPIFY_CUSTOMER_API_AUTH_URL is required/
    );
    expect(() => getShopifyTokenUrl()).toThrow(
      /SHOPIFY_CUSTOMER_API_TOKEN_URL is required/
    );

    process.env.SHOPIFY_CUSTOMER_API_AUTH_URL = "https://x/auth";
    process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL = "https://x/token";
    expect(getShopifyAuthUrl()).toBe("https://x/auth");
    expect(getShopifyTokenUrl()).toBe("https://x/token");
  });
});
