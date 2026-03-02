import {
  base64urlEncode,
  generatePKCE,
  randomState,
} from "@/lib/shopify/auth/pkce";
import { describe, expect, it } from "vitest";

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

  it("reads scopes from env or falls back to default", () => {
    // reset environments so module loads cleanly
    delete process.env.SHOPIFY_CUSTOMER_API_SCOPES;
    // re-import module to get fresh SCOPES
    const { SCOPES: defaultScopes } = require("@/app/api/auth/customer/login/route");
    expect(defaultScopes).toContain("customer_read_customers");

    process.env.SHOPIFY_CUSTOMER_API_SCOPES = "custom scope1 scope2";
    const { SCOPES: overridden } = require("@/app/api/auth/customer/login/route");
    expect(overridden).toBe("custom scope1 scope2");
  });

  it("warns about unknown scopes", () => {
    const { unknownScopes } = require("@/lib/shopify/auth/scopes");
    const bad = unknownScopes("customer_read_customers foo_bar openid");
    expect(bad).toEqual(["foo_bar"]);
  });

  it("normalizes comma-separated scopes", () => {
    const { normalizeScopes } = require("@/lib/shopify/auth/scopes");
    expect(normalizeScopes("a,b,c")).toBe("a b c");
    expect(normalizeScopes("a, b  ,c")).toBe("a b c");
    expect(normalizeScopes("a a,b")).toBe("a b");
  });

  it("recognizes the composite customer-account-api:full scope", () => {
    const { unknownScopes } = require("@/lib/shopify/auth/scopes");
    expect(unknownScopes("customer-account-api:full")).toEqual([]);
  });
});
