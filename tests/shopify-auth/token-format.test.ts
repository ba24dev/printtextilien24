import { formatAccessToken } from "@/lib/shopify/auth/token";
import { describe, expect, it } from "vitest";

describe("token formatting", () => {
  it("adds shcat_ prefix when missing", () => {
    expect(formatAccessToken("abc123")).toBe("shcat_abc123");
    expect(formatAccessToken("shcat_xyz")).toBe("shcat_xyz");
  });

  it("strips Bearer keyword and prefixes", () => {
    expect(formatAccessToken("Bearer abc123")).toBe("shcat_abc123");
    expect(formatAccessToken("Bearer shcat_abc")).toBe("shcat_abc");
  });

  it("returns empty string unchanged", () => {
    expect(formatAccessToken("")).toBe("");
  });
});
