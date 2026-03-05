import { beforeEach, describe, expect, it, vi } from "vitest";

async function importCustomerGraphql() {
  return await import("@/lib/shopify/customer/graphql");
}

describe("customer graphql client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL = "https://12d54a-a9.myshopify.com";
  });

  it("uses discovery endpoint and discovered graphql URL", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({
              graphql_api:
                "https://12d54a-a9.myshopify.com/account/customer/api/2025-10/graphql.json",
            }),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({ data: { customer: { email: "hello@example.com" } } }),
        } as any;
      });

    const { shopifyCustomerGraphQL } = await importCustomerGraphql();
    const result = await shopifyCustomerGraphQL<{ customer: { email: string } }>(
      "abc123",
      "query Customer { customer { email } }",
    );

    expect(result.customer.email).toBe("hello@example.com");
    expect(fetchSpy.mock.calls[0]?.[0]).toContain("/.well-known/customer-account-api");
    expect(fetchSpy.mock.calls[1]?.[0]).toBe(
      "https://12d54a-a9.myshopify.com/account/customer/api/2025-10/graphql.json",
    );
    fetchSpy.mockRestore();
  });

  it("falls back to storefront latest endpoint if discovery has no graphql_api", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockImplementation(async (...args: unknown[]) => {
        const url = String(args[0]);
        if (url.endsWith("/.well-known/customer-account-api")) {
          return {
            ok: true,
            json: async () => ({}),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({ data: { customer: { email: "fallback@example.com" } } }),
        } as any;
      });

    const { shopifyCustomerGraphQL } = await importCustomerGraphql();
    await shopifyCustomerGraphQL<{ customer: { email: string } }>(
      "abc123",
      "query Customer { customer { email } }",
    );

    expect(fetchSpy.mock.calls[1]?.[0]).toBe(
      "https://12d54a-a9.myshopify.com/account/customer/api/latest/graphql.json",
    );
    fetchSpy.mockRestore();
  });
});
