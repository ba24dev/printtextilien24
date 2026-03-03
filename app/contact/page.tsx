"use client";

import { copy } from "@/config/copy";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("network");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-secondary-500 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20";

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <header className="mb-12 space-y-4 text-center">
            <h1 className="text-4xl font-semibold text-foreground">
              {copy.contact?.heading ?? "Kontakt"}
            </h1>
            <p className="text-lg text-foreground/70">
              {copy.contact?.description ?? "Schreiben Sie uns"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground">
                {copy.contact?.nameLabel ?? "Name"}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {copy.contact?.emailLabel ?? "E-Mail"}
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {copy.contact?.messageLabel ?? "Nachricht"}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full"
            >
              {status === "sending" ? "Senden…" : copy.actions.submit}
            </button>
            {status === "success" && (
              <p className="text-green-600">{copy.contact?.success}</p>
            )}
            {status === "error" && (
              <p className="text-red-600">{copy.contact?.error}</p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
