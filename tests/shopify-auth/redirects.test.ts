import {
  sanitizePostLoginRedirect,
  sanitizeReturnToRedirect,
} from "@/lib/shopify/customer/redirects";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("customer redirects", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = "https://12d54a-a9.myshopify.com";
  });

  it("accepts return_to as relative path", () => {
    expect(sanitizeReturnToRedirect("/products?q=shirt", "https://example.com/login")).toBe(
      "/products?q=shirt",
    );
  });

  it("converts same-origin absolute return_to to relative", () => {
    expect(
      sanitizeReturnToRedirect("https://example.com/products?q=shirt", "https://example.com/login"),
    ).toBe("/products?q=shirt");
  });

  it("rejects external return_to targets", () => {
    expect(
      sanitizeReturnToRedirect("https://evil.com/products?q=shirt", "https://example.com/login"),
    ).toBe(null);
  });

  it("keeps checkout redirect normalization behavior", () => {
    expect(
      sanitizePostLoginRedirect(
        "https://printtextilien24.de/checkouts/cn/abc?locale=de-DE",
        "https://example.com/login",
      ),
    ).toBe("https://12d54a-a9.myshopify.com/checkouts/cn/abc?locale=de-DE&logged_in=true");
  });
});
