import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/auth/customer/callback/route";
import { SCOPES } from "@/lib/shopify/auth/scopes";

// create a fake request-like object with a URL property
function makeRequest(url: string) {
  return { url } as unknown as Request;
}

describe("callback route", () => {
  it("warns if Shopify returns a different scope than requested", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = makeRequest(
      `https://example.com/?code=abc&state=xyz&scope=not_allowed`,
    );
    // call handler; it will return early due to missing cookies but after
    // logging
    await GET(req as any);
    expect(warn).toHaveBeenCalledWith(
      "Shopify returned a different scope than requested:",
      "not_allowed",
      "expected",
      SCOPES,
    );
    warn.mockRestore();
  });
});
