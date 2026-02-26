import { describe, expect, it } from "vitest";
import { z } from "zod";

const CallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  scope: z.string().optional(),
  context: z.string().optional(),
});

describe("OAuth callback state validation", () => {
  it("accepts valid params", () => {
    const params = { code: "abc", state: "xyz" };
    const result = CallbackSchema.safeParse(params);
    expect(result.success).toBe(true);
  });

  it("rejects missing code", () => {
    const params = { state: "xyz" };
    const result = CallbackSchema.safeParse(params);
    expect(result.success).toBe(false);
  });

  it("rejects missing state", () => {
    const params = { code: "abc" };
    const result = CallbackSchema.safeParse(params);
    expect(result.success).toBe(false);
  });
});
