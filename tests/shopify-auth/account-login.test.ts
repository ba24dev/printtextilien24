import {
  buildAccountLoginRedirect,
  buildCustomerLoginHref,
  getSafeReturnTo,
  shouldAutoStartShopifyLogin,
} from "@/app/account/login/page";
import { describe, expect, it } from "vitest";

describe("account login redirect", () => {
  it("redirects to /account/login when no query exists", () => {
    expect(buildAccountLoginRedirect()).toBe("/account/login");
  });

  it("preserves checkout_url query parameter", () => {
    expect(buildAccountLoginRedirect({ checkout_url: "/checkout/somewhere" })).toBe(
      "/account/login?checkout_url=%2Fcheckout%2Fsomewhere",
    );
  });

  it("preserves multi-value query parameters", () => {
    expect(buildAccountLoginRedirect({ foo: ["a", "b"] })).toBe("/account/login?foo=a&foo=b");
  });
});

describe("account login helpers", () => {
  it("builds login href with return_to when checkout_url is absent", () => {
    expect(buildCustomerLoginHref({ returnTo: "/products?q=hoodie" })).toBe(
      "/api/auth/customer/login?return_to=%2Fproducts%3Fq%3Dhoodie",
    );
  });

  it("falls back to return_to when checkout_url is not sanitizable", () => {
    expect(
      buildCustomerLoginHref({
        checkoutUrl: "/checkouts/cn/123",
        returnTo: "/products",
      }),
    ).toBe("/api/auth/customer/login?return_to=%2Fproducts");
  });

  it("accepts safe return_to path", () => {
    expect(getSafeReturnTo("/products?color=blue")).toBe("/products?color=blue");
  });

  it("rejects unsafe return_to path", () => {
    expect(getSafeReturnTo("https://evil.com")).toBe(null);
    expect(getSafeReturnTo("//evil.com")).toBe(null);
  });

  it("auto-starts Shopify login only for checkout intent without blocking notice", () => {
    expect(
      shouldAutoStartShopifyLogin({
        checkoutUrl: "/checkouts/cn/123",
        suppressAutoRedirect: false,
      }),
    ).toBe(true);
    expect(
      shouldAutoStartShopifyLogin({
        checkoutUrl: "/checkouts/cn/123",
        suppressAutoRedirect: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoStartShopifyLogin({
        checkoutUrl: null,
        suppressAutoRedirect: false,
      }),
    ).toBe(false);
  });
});
