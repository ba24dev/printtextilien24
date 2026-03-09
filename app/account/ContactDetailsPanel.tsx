"use client";

import { PenLine } from "lucide-react";
import { useState } from "react";

type ContactDetailsPanelProps = {
  initialName: string;
  initialEmail: string;
};

export default function ContactDetailsPanel({
  initialName,
  initialEmail,
}: ContactDetailsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  return (
    <form action="/api/customer/profile" method="post">
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-primary-900/30 bg-primary-900/10 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-primary-200/80">Name</p>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded p-1 text-primary-100/80 hover:bg-primary-900/20 hover:text-primary-100"
                aria-label="Kontaktdaten bearbeiten"
                title="Kontaktdaten bearbeiten"
              >
                <PenLine className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {editing ? (
            <input
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Vor- und Nachname"
              required
            />
          ) : (
            <p className="mt-1 font-medium">{fullName || "Nicht hinterlegt"}</p>
          )}
        </div>

        <div className="rounded-xl border border-primary-900/30 bg-primary-900/10 p-4">
          <p className="text-xs uppercase tracking-wide text-primary-200/80">E-Mail</p>
          {editing ? (
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="name@beispiel.de"
              required
            />
          ) : (
            <p className="mt-1 font-medium">{email || "Nicht hinterlegt"}</p>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 flex items-center gap-2">
          <button type="submit" className="btn-primary small">Speichern</button>
          <button
            type="button"
            className="btn-outline small"
            onClick={() => {
              setEditing(false);
              setFullName(initialName);
              setEmail(initialEmail);
            }}
          >
            Abbrechen
          </button>
        </div>
      ) : null}
    </form>
  );
}
