"use client";

import { copy } from "@/config/copy";
import { PenLine } from "lucide-react";
import { useState } from "react";

type ContactDetailsPanelProps = {
  initialFirstName: string;
  initialLastName: string;
  customerId?: string;
  email?: string;
};

export default function ContactDetailsPanel({
  initialFirstName,
  initialLastName,
  customerId,
  email,
}: ContactDetailsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  return (
    <form action="/api/customer/profile" method="post">
      <div className="rounded-xl border border-primary-900/30 bg-primary-800/30 p-4">
        <article className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">
              {([firstName, lastName].filter(Boolean).join(" ") || copy.account.notProvided)}
            </p>

            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded p-1 text-primary-100/80 hover:text-primary-100"
                aria-label={copy.account.editContact}
                title={copy.account.editContact}
              >
                <PenLine className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-3 grid gap-2">
              <input
                name="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder={copy.account.firstNamePlaceholder}
                required
              />
              <input
                name="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder={copy.account.lastNamePlaceholder}
                required
              />
              <p className="text-sm text-primary-200/80">
                {copy.account.customerNumberPrefix} {customerId || copy.account.notProvided}
              </p>
              <p className="text-sm text-primary-200/80">
                {copy.account.emailPrefix} {email || copy.account.noEmailProvided}
              </p>
            </div>
          ) : (
            <div className="mt-2 space-y-1 text-sm text-primary-200/90">
              <p>{copy.account.customerNumberPrefix} {customerId || copy.account.notProvided}</p>
              <p>{copy.account.emailPrefix} {email || copy.account.noEmailProvided}</p>
            </div>
          )}
        </article>
      </div>

      {editing ? (
        <div className="mt-3 flex items-center gap-2">
          <button type="submit" className="btn-primary small">
            {copy.account.save}
          </button>
          <button
            type="button"
            className="btn-outline small"
            onClick={() => {
              setEditing(false);
              setFirstName(initialFirstName);
              setLastName(initialLastName);
            }}
          >
            {copy.account.cancel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
