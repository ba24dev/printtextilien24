import { fetchLegalText } from "@/lib/erecht24";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const origApiKey = process.env.ERECHT24_API_KEY;

// helper to make a fake client instance with overrideable docs
function makeFakeClient(): any {
  return {
    PrivacyPolicy: Promise.resolve(null),
    Imprint: Promise.resolve(null),
  };
}

describe("eRecht24 helper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.env.ERECHT24_API_KEY = origApiKey;
  });

  it("returns null when API key not set", async () => {
    delete process.env.ERECHT24_API_KEY;
    const result = await fetchLegalText("privacy");
    expect(result).toBeNull();
  });

  describe("with an API key", () => {
    beforeEach(() => {
      process.env.ERECHT24_API_KEY = "test-key";
    });

    it("returns html when the request succeeds", async () => {
      const fake = makeFakeClient();
      fake.PrivacyPolicy = Promise.resolve({ htmlDe: "<p>ok</p>" });
      const result = await fetchLegalText("privacy", () => fake);
      expect(result).toBe("<p>ok</p>");
    });

    it("falls back to english if german missing", async () => {
      const fake = makeFakeClient();
      fake.PrivacyPolicy = Promise.resolve({ htmlEn: "<p>en</p>" });
      const result = await fetchLegalText("privacy", () => fake);
      expect(result).toBe("<p>en</p>");
    });

    it("returns null on client error", async () => {
      const fake = makeFakeClient();
      const error = new Error("boom");
      fake.PrivacyPolicy = Promise.reject(error);
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await fetchLegalText("privacy", () => fake);
      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith("eRecht24 client error", error);
    });

    it("handles imprint type", async () => {
      const fake = makeFakeClient();
      fake.Imprint = Promise.resolve({ htmlDe: "<p>imp</p>" });
      const result = await fetchLegalText("imprint", () => fake);
      expect(result).toBe("<p>imp</p>");
    });
  });
});
