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
    [address.zoneCode ?? "", address.territoryCode ?? ""].filter(Boolean).join(", ").trim(),
  ].filter(Boolean);
}

function displayName(address: AccountAddress): string {
  const name = `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim();
  return name || "Adresse";
}

type AddressCardProps = {
  address: AccountAddress;
  isDefault: boolean;
};

function AddressCard({ address, isDefault }: AddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lines = formatAddressLines(address);

  return (
    <article className="rounded-xl border border-primary-900/30 bg-primary-900/10 p-4">
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
            <p className="mt-2 text-sm text-primary-100">Tel: {address.phoneNumber}</p>
          ) : null}
        </>
      ) : (
        <>
          <form action="/api/customer/address/update" method="post" className="mt-3 grid gap-2">
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
            <div className="grid grid-cols-2 gap-2">
              <input
                name="territoryCode"
                defaultValue={address.territoryCode ?? ""}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder="Land-Code (DE)"
              />
              <input
                name="zoneCode"
                defaultValue={address.zoneCode ?? ""}
                className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
                placeholder="Region-Code"
              />
            </div>
            <input
              name="phoneNumber"
              defaultValue={address.phoneNumber ?? ""}
              className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm"
              placeholder="Telefon"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="defaultAddress" defaultChecked={isDefault} />
              Als Standardadresse setzen
            </label>
            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary small">Speichern</button>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => {
                  setEditing(false);
                  setConfirmDelete(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </form>
          <div className="mt-2">
            {!confirmDelete ? (
              <button
                type="button"
                className="btn-outline small"
                onClick={() => setConfirmDelete(true)}
              >
                Löschen
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <form action="/api/customer/address/delete" method="post">
                  <input type="hidden" name="addressId" value={address.id ?? ""} />
                  <button type="submit" className="btn-outline small">
                    Löschen bestätigen
                  </button>
                </form>
                <button
                  type="button"
                  className="btn-outline small"
                  onClick={() => setConfirmDelete(false)}
                >
                  Nicht löschen
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}

function AddAddressCard() {
  const [editing, setEditing] = useState(false);

  return (
    <article className="rounded-xl border border-dashed border-primary-900/40 bg-primary-900/5 p-4">
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
        <form action="/api/customer/address/create" method="post" className="grid gap-2">
          <input name="firstName" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Vorname" />
          <input name="lastName" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Nachname" />
          <input name="address1" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Straße und Hausnummer" />
          <input name="address2" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Adresszusatz" />
          <div className="grid grid-cols-2 gap-2">
            <input name="zip" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="PLZ" />
            <input name="city" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Stadt" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input name="territoryCode" defaultValue="DE" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Land-Code (DE)" />
            <input name="zoneCode" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Region-Code" />
          </div>
          <input name="phoneNumber" className="rounded-md border border-primary-900/50 bg-background px-3 py-2 text-sm" placeholder="Telefon" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="defaultAddress" />
            Als Standardadresse setzen
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary small">Adresse speichern</button>
            <button type="button" className="btn-outline small" onClick={() => setEditing(false)}>
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

export default function AddressesPanel({ addresses, defaultAddressId }: AddressesPanelProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-2">
      {addresses.map((address) => (
        <AddressCard
          key={address.id ?? JSON.stringify(address)}
          address={address}
          isDefault={Boolean(address.id && address.id === defaultAddressId)}
        />
      ))}
      <AddAddressCard />
    </div>
  );
}
