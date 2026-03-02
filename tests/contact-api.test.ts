import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

function makeReq(body: unknown) {
  return { json: async () => body } as unknown as Request;
}

describe("contact API route", () => {
  it("returns 400 when body is invalid", async () => {
    const res = await POST(makeReq({ name: "", email: "bad", message: "" }) as any);
    expect(res.status).toBe(400);
  });

  it("sends email when payload is valid", async () => {
    const fakeFetch = vi.spyOn(global, "fetch" as any).mockResolvedValue({ ok: true });
    const req = makeReq({ name: "Alice", email: "a@b.com", message: "Hello" });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(fakeFetch).toHaveBeenCalled();
    fakeFetch.mockRestore();
  });

  it("returns 500 if resend API key missing", async () => {
    const orig = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    const res = await POST(makeReq({ name: "A", email: "a@b.com", message: "x" }) as any);
    expect(res.status).toBe(500);
    process.env.RESEND_API_KEY = orig;
  });
});
