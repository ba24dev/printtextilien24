import { describe, it, expect } from "vitest";
import { fetchLegalText } from "@/lib/erecht24";

describe("eRecht24 helper", () => {
  it("returns null when API key not set", async () => {
    const orig = process.env.ERECHT24_API_KEY;
    delete process.env.ERECHT24_API_KEY;
    const result = await fetchLegalText("privacy");
    expect(result).toBeNull();
    process.env.ERECHT24_API_KEY = orig;
  });
});
