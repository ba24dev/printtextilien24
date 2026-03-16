git import { copy } from "@/config/copy";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import AddressesPanel from "./AddressesPanel";
import BuyAgainButton from "./BuyAgainButton";
import ContactDetailsPanel from "./ContactDetailsPanel";
import { AccountApiResponse, AccountCustomer, AccountOrder } from "./types";

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
  if (order.cancelledAt) return copy.account.orderStatusLabels.CANCELLED;
  if (order.financialStatus) {
    return (
      copy.account.orderStatusLabels[
        order.financialStatus as keyof typeof copy.account.orderStatusLabels
      ] ?? copy.account.orderStatusLabels.FALLBACK
    );
  }
  return copy.account.orderStatusLabels.FALLBACK;
}

function itemSummary(order: AccountOrder): string {
  const items = order.lineItems?.nodes ?? [];
  if (!items.length) return copy.account.orderItemsUnavailable;
  const count = items.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
  if (!count) return copy.account.orderItemsUnavailable;
  return copy.account.orderItemsCount(count);
}

function orderItems(
  order: AccountOrder,
): Array<{ title: string; quantity: number }> {
  return (order.lineItems?.nodes ?? [])
    .filter((item) => Boolean(item.title?.trim()) && (item.quantity ?? 0) > 0)
    .map((item) => ({
      title: item.title.trim(),
      quantity: item.quantity,
    }));
}

function readableCustomerId(id?: string): string | null {
  if (!id) return null;
  return id.includes("/") ? id.slice(id.lastIndexOf("/") + 1) : id;
}

function customerName(customer?: AccountCustomer): string {
  if (!customer) return copy.account.profileUnavailable;
  const fallback =
    `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
  return fallback || copy.account.customerFallbackName;
}

function initialContactNames(customer?: AccountCustomer): {
  firstName: string;
  lastName: string;
} {
  const first = (customer?.firstName ?? "").trim();
  const last = (customer?.lastName ?? "").trim();
  return { firstName: first, lastName: last };
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
  const contactNames = initialContactNames(customer);

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:items-center">
          <header className="flex w-full items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
              {copy.account.title}
            </h1>
            {checkoutError ? (
              <div className="w-1/3 text-center rounded-xl border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
                {copy.account.checkoutUnavailable}
              </div>
            ) : null}

            {profileUpdated ? (
              <div className="w-1/3 text-center rounded-xl border border-green-500/40 bg-green-900/20 p-3 text-sm text-green-100">
                {copy.account.profileUpdated}
              </div>
            ) : null}

            {profileError ? (
              <div className="w-1/3 text-center rounded-xl border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
                {profileError}
              </div>
            ) : null}

            {addressUpdated ? (
              <div className="w-1/3 text-center rounded-xl border border-green-500/40 bg-green-900/20 p-3 text-sm text-green-100">
                {copy.account.addressUpdated}
              </div>
            ) : null}

            {addressError ? (
              <div className="w-1/3 text-center rounded-xl border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-100">
                {addressError}
              </div>
            ) : null}
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

          <section className="w-full component-radius border border-primary-900/50 bg-background p-6 shadow-lg shadow-primary-900/15 md:p-8">
            <div className="mb-6 flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{copy.account.contactTitle}</h2>
              </div>
            </div>
            <div className=" grid grid-cols-2 gap-3">
              <ContactDetailsPanel
                initialFirstName={contactNames.firstName}
                initialLastName={contactNames.lastName}
                customerId={customerId ?? undefined}
                email={customer?.email ?? undefined}
              />
            </div>
          </section>

          <section className="w-full component-radius border border-primary-900/50 bg-background p-6 shadow-lg shadow-primary-900/15 md:p-8">
            <div className="mb-6 flex flex-row flex-wrap items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold">{copy.account.addressesTitle}</h2>
              <span className="text-sm text-primary-200/80">
                {copy.account.addressEntriesLabel(addresses.length)}
              </span>
            </div>

            <AddressesPanel
              addresses={addresses}
              defaultAddressId={customer?.defaultAddress?.id}
            />
          </section>

          <section className="w-full component-radius border border-primary-900/50 bg-background p-6 shadow-lg shadow-primary-900/15 md:p-8">
            <div className="mb-6 flex flex-col items-start gap-2">
              <h2 className="text-2xl font-semibold">
                {copy.account.ordersTitle}
              </h2>
              <span className="text-sm text-primary-200/80">
                {copy.account.latestOrdersLabel}
              </span>
            </div>

            {orders?.edges?.length ? (
              <ul className="space-y-3">
                {orders.edges.map(({ node }) => (
                  <li
                    key={node.id}
                    className="rounded-xl border border-primary-900/30 bg-primary-800/30 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {copy.account.orderPrefix} {node.name}
                        </div>
                        <div className="mt-1 text-sm text-primary-200/80">
                          {copy.account.orderDateLabel}:{" "}
                          {formatGermanDate(node.processedAt)} •{" "}
                          {itemSummary(node)}
                        </div>
                      </div>

                      <span className="rounded-full border border-primary-500/40 bg-primary-500/15 px-3 py-1 text-xs font-medium text-primary-100">
                        {orderStatusLabel(node)}
                      </span>
                    </div>

                    {orderItems(node).length ? (
                      <div className="mt-3 rounded-lg border border-primary-900/30 bg-primary-500/30 p-3">
                        <p className="text-xs uppercase tracking-wide text-primary-200/80">
                          {copy.account.orderItemsLabel}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-primary-100">
                          {orderItems(node).map((item, index) => (
                            <li
                              key={`${item.title}-${index}`}
                              className="flex justify-between gap-3"
                            >
                              <span className="truncate">{item.title}</span>
                              <span className="shrink-0 text-primary-200/80">
                                x{item.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {node.lineItems?.pageInfo?.hasNextPage ? (
                          <p className="mt-2 text-xs text-primary-200/80">
                            {copy.account.orderItemsMoreHint}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

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
                        <div className="flex items-center gap-2">
                          <a
                            href={node.statusPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline small"
                          >
                            {copy.account.viewOrder}
                          </a>
                          <BuyAgainButton
                            orderName={node.name}
                            lines={node.lineItems?.nodes ?? []}
                          />
                        </div>
                      ) : (
                        <BuyAgainButton
                          orderName={node.name}
                          lines={node.lineItems?.nodes ?? []}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-primary-200/80">
                {copy.account.noOrders}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
