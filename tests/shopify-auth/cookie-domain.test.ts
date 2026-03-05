import { beforeEach, describe, expect, it, vi } from "vitest";

async function importCookieHelper() {
  return await import("@/lib/shopify/customer/cookies");
}

describe("customer cookie domain helper", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN;
  });

  it("returns undefined when env var is empty", async () => {
    process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN = "   ";
    const { getCustomerCookieDomain } = await importCookieHelper();
    expect(getCustomerCookieDomain()).toBeUndefined();
  });

  it("normalizes domain with leading dot", async () => {
    process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN = "printtextilien24.de";
    const { getCustomerCookieDomain } = await importCookieHelper();
    expect(getCustomerCookieDomain()).toBe(".printtextilien24.de");
  });

  it("rejects invalid values like full URLs", async () => {
    process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN = "https://printtextilien24.de/";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getCustomerCookieDomain } = await importCookieHelper();
    expect(getCustomerCookieDomain()).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
