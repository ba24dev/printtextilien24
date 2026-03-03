import { GET } from "@/app/api/auth/customer/callback/route";
import { SCOPES } from "@/lib/shopify/auth/scopes";
import { describe, expect, it, vi } from "vitest";

// create a fake request-like object with a URL property and optional
// cookies.  The middleware handler only reads `cookies.get().value`, so we
// mirror that interface.
function makeRequest(url: string, cookies?: Record<string, string | undefined>) {
  return {
    url,
    cookies: {
      get: (name: string) => ({ value: cookies?.[name] } as any),
    },
  } as unknown as Request;
}

describe("callback route", () => {
  it("warns if Shopify returns a different scope than requested", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = makeRequest(
      `https://example.com/?code=abc&state=xyz&scope=not_allowed",
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

  it("uses stored post-login redirect when available", async () => {
    // stub fetch to return a successful token response
    const fakeFetch = vi
      .spyOn(global, "fetch" as any)
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "token",
          refresh_token: "refresh",
          expires_in: 1234,
        }),
      } as any);

    const req = makeRequest(
      "https://example.com/?code=abc&state=xyz",
      {
        shopify_oauth_state: "xyz",
        shopify_pkce_verifier: "verifier",
        shopify_post_login_redirect: "/checkout/somewhere",
      },
    );

    const res: any = await GET(req as any);
    const loc = res.headers.get("location") || "";
    expect(loc).toBe("https://example.com/checkout/somewhere");

    fakeFetch.mockRestore();
  });
});
