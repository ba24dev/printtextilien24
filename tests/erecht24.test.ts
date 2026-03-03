import { fetchLegalText } from "@/lib/erecht24";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// tests manually override `globalThis.fetch` with a jest-style mock
const origApiKey = process.env.ERECHT24_API_KEY;

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
    let fetchMock: vi.Mock;

    beforeEach(() => {
      process.env.ERECHT24_API_KEY = "test-key";
      fetchMock = vi.fn();
      (globalThis as any).fetch = fetchMock;
    });

    it("returns html when the request succeeds", async () => {
      fetchMock.mockResolvedValue(
        // @ts-ignore
        { ok: true, json: async () => ({ html: "<p>ok</p>" }) },
      );
      const result = await fetchLegalText("privacy");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.e-recht24.de/v2/privacyPolicy?api_key=test-key",
      );
      expect(result).toBe("<p>ok</p>");
    });

    it("returns null and warns on 404", async () => {
      fetchMock.mockResolvedValue(
        // @ts-ignore
        { ok: false, status: 404, text: async () => "not found" },
      );
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await fetchLegalText("privacy");
      expect(result).toBeNull();
      expect(warn).toHaveBeenCalled();
    });
    it("returns null and warns on 401 (invalid key)", async () => {
      fetchMock.mockResolvedValue(
        // @ts-ignore
        {
          ok: false,
          status: 401,
          text: async () =>
            '{"message":"No API key was passed to the eRecht24 legal texts API when requested."}',
        },
      );
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await fetchLegalText("privacy");
      expect(result).toBeNull();
      expect(warn).toHaveBeenCalledWith(
        "eRecht24 returned 401 – unauthorized. make sure ERECHT24_API_KEY is valid",
      );
    });
    it("returns null and errors on non-404 failure", async () => {
      fetchMock.mockResolvedValue(
        // @ts-ignore
        { ok: false, status: 500, text: async () => "oops" },
      );
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await fetchLegalText("privacy");
      expect(result).toBeNull();
      expect(error).toHaveBeenCalledWith("eRecht24 fetch failed", 500, "oops");
    });

    it("returns null and logs on network error", async () => {
      fetchMock.mockRejectedValue(new Error("no network"));
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await fetchLegalText("privacy");
      expect(result).toBeNull();
      expect(error).toHaveBeenCalledWith("eRecht24 fetch error", expect.any(Error));
    });

    it("uses the imprint endpoint when asked", async () => {
      fetchMock.mockResolvedValue(
        // @ts-ignore
        { ok: true, json: async () => ({ html: "<p>imp</p>" }) },
      );
      await fetchLegalText("imprint");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.e-recht24.de/v2/imprint?api_key=test-key",
      );
    });
  });
});
