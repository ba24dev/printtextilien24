import { copy } from "@/config/copy";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import AddressesPanel from "./AddressesPanel";
import ContactDetailsPanel from "./ContactDetailsPanel";
import {
  AccountApiResponse,
  AccountCustomer,
  AccountOrder,
} from "./types";

type AccountFetchResult =
  | { status: "authenticated"; data: AccountApiResponse }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

type AccountPageSearchParams = {
  checkout_error?: string | string[];
  profile_updated?: string | string[];
  profile_error?: string | string[];
  address_updated?: string | string[];
  address_error?: string | string[];
};

type AccountPageProps = {
  searchParams?: AccountPageSearchParams | Promise<AccountPageSearchParams>;
};

function formatGermanDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amount: string, currencyCode: string): string {
  const numeric = Number.parseFloat(amount);
  if (!Number.isFinite(numeric)) return `${amount} ${currencyCode}`;
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currencyCode,
    }).format(numeric);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

function orderStatusLabel(order: AccountOrder): string {
  if (order.cancelledAt) return "Storniert";
  if (order.financialStatus) {
    const mapped = order.financialStatus
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
    return mapped;
  }
  return "Verarbeitet";
}

function itemSummary(order: AccountOrder): string {
  const items = order.lineItems?.nodes ?? [];
  if (!items.length) return "Keine Artikeldetails verfügbar";
  const count = items.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
  if (!count) return "Keine Artikeldetails verfügbar";
  return `${count} Artikel`;
}

function readableCustomerId(id?: string): string | null {
  if (!id) return null;
  return id.includes("/") ? id.slice(id.lastIndexOf("/") + 1) : id;
}

function customerName(customer?: AccountCustomer): string {
  if (!customer) return copy.account.profileUnavailable;
  if (customer.displayName?.trim()) return customer.displayName.trim();
  const fallback =
    `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
  return fallback || "Kunde";
}

async function getCustomerData(): Promise<AccountFetchResult> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return { status: "unauthenticated" };

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  if (!host) {
    return {
      status: "error",
      message: copy.account.hostError,
    };
  }
  const protoHeader = requestHeaders.get("x-forwarded-proto");
  const proto = protoHeader ?? (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  try {
    const response = await fetch(
      new URL("/api/customer/me", baseUrl).toString(),
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );
    if (response.status === 401) return { status: "unauthenticated" };

    const payload = (await response
      .json()
      .catch(() => ({}))) as AccountApiResponse;
    if (!response.ok) {
      return {
        status: "error",
        message: payload.error ?? copy.account.apiError(response.status),
      };
    }

    return {
      status: "authenticated",
      data: payload,
    };
  } catch {
    return {
      status: "error",
      message: copy.account.profileFetchError,
    };
  }
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const checkoutErrorValue = resolvedSearchParams?.checkout_error;
  const checkoutError =
    checkoutErrorValue === "1" ||
    (Array.isArray(checkoutErrorValue) && checkoutErrorValue.includes("1"));
  const profileUpdated = resolvedSearchParams?.profile_updated === "1";
  const addressUpdated = resolvedSearchParams?.address_updated === "1";
  const profileErrorValue = resolvedSearchParams?.profile_error;
  const addressErrorValue = resolvedSearchParams?.address_error;
  const profileError = Array.isArray(profileErrorValue)
    ? profileErrorValue[0]
    : profileErrorValue;
  const addressError = Array.isArray(addressErrorValue)
    ? addressErrorValue[0]
    : addressErrorValue;

  const result = await getCustomerData();
  if (result.status === "unauthenticated") {
    redirect(
      checkoutError ? "/account/login?checkout_error=1" : "/account/login",
    );
  }
  if (result.status === "error") {
    return (
      <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 mt-16">{copy.account.title}</h1>
        <p className="text-sm text-red-500 mb-4">
          {copy.account.loadErrorTitle}
        </p>
        <p className="text-sm text-gray-500 mb-6">{result.message}</p>
        <Link href="/account" className="underline">
          {copy.account.retry}
        </Link>
      </main>
    );
  }

  const customer = result.data.customer;
  const orders = result.data.orders;
  const addresses = customer?.addresses?.nodes ?? [];
  const customerId = readableCustomerId(customer?.id);

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-col md:items-center">
          <header className="space-y-4 flex justify-between mb-6">
            <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
              {copy.account.title}
            </h1>
            <form
              action="/account/logout"
              method="post"
              className="inline-block"
            >
              <button
                type="submit"
                className="btn-primary small cursor-pointer"
              >
                {copy.auth.logoutLabel}
              </button>
            </form>
          </header>

          {checkoutError ? (
            <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
              {copy.account.checkoutUnavailable}
            </div>
          ) : null}
          {profileUpdated ? (
            <div className="mb-6 rounded-xl border border-green-500/40 bg-green-900/20 p-3 text-sm text-green-100">
              Kontaktdaten wurden gespeichert.
            </div>
          ) : null}
          {profileError ? (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
              {profileError}
            </div>
          ) : null}
          {addressUpdated ? (
            <div className="mb-6 rounded-xl border border-green-500/40 bg-green-900/20 p-3 text-sm text-green-100">
              Adresse wurde aktualisiert.
            </div>
          ) : null}
          {addressError ? (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
              {addressError}
            </div>
          ) : null}

          <section className="w-full component-radius border border-primary-900/50 bg-background shadow-lg shadow-primary-900/15 p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {customerName(customer)}
                </h2>
                {customerId ? (
                  <p className="text-sm text-primary-200/80 mt-1">
                    Kundennummer: {customerId}
                  </p>
                ) : null}
              </div>
            </div>

            <ContactDetailsPanel
              initialName={customerName(customer)}
              initialEmail={customer?.email ?? ""}
            />
          </section>

          <section className="w-full component-radius border border-primary-900/50 bg-background shadow-lg shadow-primary-900/15 p-6 md:p-8 mb-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold">
                  Gespeicherte Adressen
                </h2>
                <span className="text-sm text-primary-200/80">
                  {addresses.length} Einträge
                </span>
              </div>
              <AddressesPanel
                addresses={addresses}
                defaultAddressId={customer?.defaultAddress?.id}
              />
            </div>
          </section>

          <section className="w-full component-radius border border-primary-900/50 bg-background shadow-lg shadow-primary-900/15 p-6 md:p-8 mb-8">
            <div className="flex flex-wrap flex-col items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {copy.account.ordersTitle}
                </h2>
                <span className="text-sm text-primary-200/80">
                  Letzte 10 Bestellungen
                </span>
              </div>
              {orders?.edges?.length ? (
                <ul className="space-y-3">
                  {orders.edges.map(({ node }) => (
                    <li
                      key={node.id}
                      className="rounded-xl border border-primary-900/30 bg-primary-900/10 p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            {copy.account.orderPrefix} {node.name}
                          </div>
                          <div className="text-sm text-primary-200/80 mt-1">
                            {copy.account.orderDateLabel}:{" "}
                            {formatGermanDate(node.processedAt)} •{" "}
                            {itemSummary(node)}
                          </div>
                        </div>
                        <span className="rounded-full border border-primary-500/40 bg-primary-500/15 px-3 py-1 text-xs font-medium text-primary-100">
                          {orderStatusLabel(node)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm">
                          <span className="text-primary-200/80">
                            {copy.account.orderTotalLabel}:{" "}
                          </span>
                          <span className="font-semibold">
                            {formatMoney(
                              node.totalPrice.amount,
                              node.totalPrice.currencyCode,
                            )}
                          </span>
                        </div>
                        {node.statusPageUrl ? (
                          <a
                            href={node.statusPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline small"
                          >
                            Bestellung ansehen
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-primary-200/80">
                  {copy.account.noOrders}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
