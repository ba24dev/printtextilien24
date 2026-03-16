import { proxy } from "@/proxy";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

// helper to fake a NextRequest-like object
function makeRequest(url: string, cookies: Record<string, string | undefined>) {
  const parsed = new URL(url);
  return {
    url,
    nextUrl: {
      pathname: parsed.pathname,
      search: parsed.search,
    },
    cookies: {
      get: (name: string) => ({ value: cookies[name] }) as any,
    },
  } as unknown as NextRequest;
}

describe("authentication proxy", () => {
  it("redirects to /account/login with return_to when no access token cookie is present", async () => {
    const req = makeRequest("https://example.com/account?tab=orders", {});
    const res = await proxy(req);
    const loc = res.headers.get("location") || "";
    expect(loc).toBe("https://example.com/account/login?return_to=%2Faccount%3Ftab%3Dorders");
  });

  it("allows through when an access token exists", async () => {
    const req = makeRequest("https://example.com/account", {
      shopify_customer_access_token: "abcd",
    });
    const res = await proxy(req);
    // NextResponse.next() returns the same object, no location header
    expect(res.headers.get("location")).toBe(null);
  });
});
