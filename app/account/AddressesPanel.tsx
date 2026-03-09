"use client";

import { PenLine, Plus } from "lucide-react";
import { useState } from "react";

import { AccountAddress } from "./types";

type AddressesPanelProps = {
  addresses: AccountAddress[];
  defaultAddressId?: string;
};

function formatAddressLines(address: AccountAddress): string[] {
  const formatted = address.formatted?.filter(Boolean) ?? [];
  if (formatted.length) return formatted;

  return [
    `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim(),
    address.address1 ?? "",
    address.address2 ?? "",
    [address.zip ?? "", address.city ?? ""].filter(Boolean).join(" ").trim(),
    [address.zoneCode ?? "", address.territoryCode ?? ""]
      .filter(Boolean)
      .join(", ")
      .trim(),
  ].filter(Boolean);
}

function displayName(address: AccountAddress): string {
  const name = `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim();
  return name || "Adresse";
}

type AddressCardProps = {
  address: AccountAddress;
  isDefault: boolean;
  addressCount: number;
};

function AddressCard({ address, isDefault, addressCount }: AddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const lines = formatAddressLines(address);
  const canDelete = !isDefault;
  const lockDefault = isDefault && addressCount === 1;

  return (
    <article className="rounded-xl border border-primary-900/30 bg-primary-800/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{displayName(address)}</h3>
        <div className="flex items-center gap-2">
          {isDefault ? (
            <span className="rounded-full border border-primary-500/50 bg-primary-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary-100">
              Standard
            </span>
          ) : null}
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded p-1 text-primary-100/80 hover:bg-primary-900/20 hover:text-primary-100"
              aria-label="Adresse bearbeiten"
              title="Adresse bearbeiten"
            >
              <PenLine className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {!editing ? (
        <>
          <div className="mt-2 space-y-1 text-sm text-primary-200/90">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {address.phoneNumber ? (
            <p className="mt-2 text-sm text-primary-100">
              Tel: {address.phoneNumber}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <form
            action="/api/customer/address/update"
            method="post"
            className="mt-3 grid gap-2"
          >
            <input type="hidden" name="addressId" value={address.id ?? ""} />
            <input
              name="firstName"
              defaultValue={address.firstName ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Vorname"
            />
            <input
              name="lastName"
              defaultValue={address.lastName ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Nachname"
            />
            <input
              name="address1"
              defaultValue={address.address1 ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Straße und Hausnummer"
            />
            <input
              name="address2"
              defaultValue={address.address2 ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Adresszusatz"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="zip"
                defaultValue={address.zip ?? ""}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder="PLZ"
              />
              <input
                name="city"
                defaultValue={address.city ?? ""}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder="Stadt"
              />
            </div>
            <input
              name="territoryCode"
              defaultValue={address.territoryCode ?? "DE"}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Land-Code (DE)"
            />
            <input
              type="hidden"
              name="zoneCode"
              defaultValue={address.zoneCode ?? ""}
            />
            <input
              name="phoneNumber"
              defaultValue={address.phoneNumber ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Telefon"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="defaultAddress"
                defaultChecked={isDefault}
                disabled={lockDefault}
              />
              Als Standardadresse setzen
            </label>
            {lockDefault ? (
              <p className="text-xs text-primary-200/80">
                Bei nur einer Adresse bleibt diese Standard.
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary small">
                Speichern
              </button>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => {
                  setEditing(false);
                  setDeleteModalOpen(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </form>
          <div className="mt-2">
            {canDelete ? (
              <button
                type="button"
                className="small rounded-md border border-red-500/50 bg-red-900/30 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-800/40"
                onClick={() => setDeleteModalOpen(true)}
              >
                Löschen
              </button>
            ) : (
              <p className="text-xs text-primary-200/80">
                Standardadresse kann nicht gelöscht werden.
              </p>
            )}
          </div>
        </>
      )}

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            onClick={() => setDeleteModalOpen(false)}
            aria-label="Löschen abbrechen"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-primary-900/40 bg-background p-5 text-sm text-primary-100 shadow-2xl shadow-primary-900/50">
            <h3 className="text-base font-semibold">Adresse löschen</h3>
            <p className="mt-2 text-primary-200/90">
              Diese Adresse wird dauerhaft entfernt.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action="/api/customer/address/delete" method="post">
                <input type="hidden" name="addressId" value={address.id ?? ""} />
                <button
                  type="submit"
                  className="small rounded-md border border-red-500/60 bg-red-900/40 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-800/50"
                >
                  Löschen bestätigen
                </button>
              </form>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => setDeleteModalOpen(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function AddAddressCard() {
  const [editing, setEditing] = useState(false);

  return (
    <article
      className={`rounded-xl border border-dashed dark:border-primary-800 border-primary-600 ${!editing ? "bg-primary-900/5" : "bg-primary-800/30"} p-4`}
    >
      {!editing ? (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg py-8 text-primary-100/90 hover:bg-primary-900/15"
          onClick={() => setEditing(true)}
        >
          <Plus className="h-5 w-5" />
          <span>Neue Adresse hinzufügen</span>
        </button>
      ) : (
        <form
          action="/api/customer/address/create"
          method="post"
          className="grid gap-2"
        >
          <input
            name="firstName"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Vorname"
          />
          <input
            name="lastName"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Nachname"
          />
          <input
            name="address1"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Straße und Hausnummer"
          />
          <input
            name="address2"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Adresszusatz"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="zip"
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="PLZ"
            />
            <input
              name="city"
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Stadt"
            />
          </div>
          <input
            name="territoryCode"
            defaultValue="DE"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Land-Code (DE)"
          />
          <input
            name="phoneNumber"
            className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
            placeholder="Telefon"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="defaultAddress" />
            Als Standardadresse setzen
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary small">
              Adresse speichern
            </button>
            <button
              type="button"
              className="btn-outline small"
              onClick={() => setEditing(false)}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

export default function AddressesPanel({
  addresses,
  defaultAddressId,
}: AddressesPanelProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-2">
      {addresses.map((address) => (
        <AddressCard
          key={address.id ?? JSON.stringify(address)}
          address={address}
          isDefault={Boolean(address.id && address.id === defaultAddressId)}
          addressCount={addresses.length}
        />
      ))}
      <AddAddressCard />
    </div>
  );
}
