import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { name, email, message } = parsed.data;

  const to = process.env.CONTACT_EMAIL || "sales@printtextilien.de";
  const from = process.env.SMTP_FROM || "no-reply@printtextilien24.de";

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("SMTP configuration incomplete");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const payload = {
    from,
    to,
    subject: `Kontaktanfrage von ${name}`,
    html: `<p>${message}</p><p>Absender: ${name} &lt;${email}&gt;</p>`,
  };

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: nodemailer may not be installed in minimal environments
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail(payload as any);
  } catch (err) {
    console.error("error sending via SMTP", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
