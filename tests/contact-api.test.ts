import { POST } from "@/app/api/contact/route";
import { describe, expect, it, vi } from "vitest";

function makeReq(body: unknown) {
  return { json: async () => body } as unknown as Request;
}

describe("contact API route", () => {
  it("returns 400 when body is invalid", async () => {
    const res = await POST(makeReq({ name: "", email: "bad", message: "" }) as any);
    expect(res.status).toBe(400);
  });

  it("sends email when payload is valid", async () => {
    const transport = { sendMail: vi.fn().mockResolvedValue({}) };
    const nodemailer = await import("nodemailer");
    const create = vi.spyOn(nodemailer, "createTransport").mockReturnValue(transport as any);
    const req = makeReq({ name: "Alice", email: "a@b.com", message: "Hello" });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalled();
    expect(transport.sendMail).toHaveBeenCalled();
    create.mockRestore();
  });

  it("returns 500 if SMTP config missing", async () => {
    const origHost = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;
    const res = await POST(makeReq({ name: "A", email: "a@b.com", message: "x" }) as any);
    expect(res.status).toBe(500);
    process.env.SMTP_HOST = origHost;
  });
});
