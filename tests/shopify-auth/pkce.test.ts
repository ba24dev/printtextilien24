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
});
