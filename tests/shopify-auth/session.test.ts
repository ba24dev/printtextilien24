import { GET } from "@/app/api/customer/session/route";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

function makeRequest(cookies: Record<string, string | undefined>) {
  return {
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        if (!value) return undefined;
        return { value } as any;
      },
    },
  } as unknown as NextRequest;
}

describe("session route", () => {
  it("returns loggedOut when no token cookie exists", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    await expect(res.json()).resolves.toEqual({ loggedIn: false });
  });

  it("returns loggedIn when token cookie exists and does not call Shopify", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const req = makeRequest({ shopify_customer_access_token: "token-123" });
    const res = await GET(req);

    await expect(res.json()).resolves.toEqual({ loggedIn: true, email: null });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
