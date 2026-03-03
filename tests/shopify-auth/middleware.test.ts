import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

// helper to fake a NextRequest-like object
function makeRequest(cookies: Record<string, string | undefined>) {
  return {
    url: "https://example.com/", // base needed for URL constructor
    cookies: {
      get: (name: string) => ({ value: cookies[name] }) as any,
    },
  } as unknown as NextRequest;
}

describe("authentication middleware", () => {
  it("redirects to /login when no access token cookie is present", async () => {
    const req = makeRequest({});
    const res = await middleware(req);
    // origin is added automatically, make sure path is correct
    const loc = res.headers.get("location") || "";
    expect(loc.endsWith("/login")).toBe(true);
  });

  it("allows through when an access token exists", async () => {
    const req = makeRequest({ shopify_customer_access_token: "abcd" });
    const res = await middleware(req);
    // NextResponse.next() returns the same object, no location header
    expect(res.headers.get("location")).toBe(null);
  });
});
