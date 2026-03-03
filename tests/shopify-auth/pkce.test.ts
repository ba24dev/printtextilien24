import { base64urlEncode, generatePKCE, randomState } from "@/lib/shopify/auth/pkce";
import { describe, expect, it } from "vitest";

// helper for loading modules with fresh env state
async function importLoginRoute() {
  return await import("@/app/api/auth/customer/login/route");
}
async function importScopes() {
  return await import("@/lib/shopify/auth/scopes");
}

describe("PKCE utils", () => {
  it("generates a valid PKCE challenge and verifier", async () => {
    const { verifier, challenge } = await generatePKCE();
    expect(verifier).toBeDefined();
    expect(challenge).toBeDefined();
    expect(verifier.length).toBeGreaterThan(10);
    expect(challenge.length).toBeGreaterThan(10);
  });

  it("generates a random state", () => {
    const state1 = randomState();
    const state2 = randomState();
    expect(state1).not.toEqual(state2);
    expect(state1.length).toBeGreaterThan(10);
  });

  it("base64url encodes correctly", () => {
    const buf = Buffer.from("test123");
    const encoded = base64urlEncode(buf);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("reads scopes from env or falls back to default", async () => {
    delete process.env.SHOPIFY_CUSTOMER_API_SCOPES;
    vi.resetModules();
    const { SCOPES: defaultScopes } = await importScopes();
    expect(defaultScopes).toBe("customer-account-api:full");

    process.env.SHOPIFY_CUSTOMER_API_SCOPES = "custom scope1 scope2";
    vi.resetModules();
    const { SCOPES: overridden } = await importScopes();
    expect(overridden).toBe("custom scope1 scope2");
  });

  it("warns about unknown scopes", async () => {
    const { unknownScopes } = await importScopes();
    const bad = unknownScopes("customer_read_customers foo_bar openid");
    expect(bad).toEqual(["foo_bar"]);
  });

  it("normalizes comma-separated scopes", async () => {
    const { normalizeScopes } = await importScopes();
    expect(normalizeScopes("a,b,c")).toBe("a b c");
    expect(normalizeScopes("a, b  ,c")).toBe("a b c");
    expect(normalizeScopes("a a,b")).toBe("a b");
  });

  it("recognizes the composite customer-account-api:full scope", async () => {
    const { unknownScopes } = await importScopes();
    expect(unknownScopes("customer-account-api:full")).toEqual([]);
  });
});
