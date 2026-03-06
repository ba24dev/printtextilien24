import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { copy } from "@/config/copy";

type AccountCustomer = {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type AccountOrder = {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
};

type AccountApiResponse = {
  customer?: AccountCustomer;
  orders?: {
    edges?: Array<{ node: AccountOrder }>;
  };
  error?: string;
};

type AccountFetchResult =
  | { status: "authenticated"; data: AccountApiResponse }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

type AccountPageSearchParams = {
  checkout_error?: string | string[];
};

type AccountPageProps = {
  searchParams?: AccountPageSearchParams | Promise<AccountPageSearchParams>;
};

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
    const response = await fetch(new URL("/api/customer/me", baseUrl).toString(), {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    if (response.status === 401) return { status: "unauthenticated" };

    const payload = (await response.json().catch(() => ({}))) as AccountApiResponse;
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
  const result = await getCustomerData();
  if (result.status === "unauthenticated") {
    redirect(checkoutError ? "/account/login?checkout_error=1" : "/account/login");
  }
  if (result.status === "error") {
    return (
      <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 mt-16">{copy.account.title}</h1>
        <p className="text-sm text-red-500 mb-4">{copy.account.loadErrorTitle}</p>
        <p className="text-sm text-gray-500 mb-6">{result.message}</p>
        <Link href="/account" className="underline">
          {copy.account.retry}
        </Link>
      </main>
    );
  }

  const customer = result.data.customer;
  const orders = result.data.orders;

  return (
    <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 mt-16">{copy.account.title}</h1>
      {checkoutError ? (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
          {copy.account.checkoutUnavailable}
        </div>
      ) : null}
      <div className="mb-6">
        {customer ? (
          <>
            <div className="font-medium">{customer.email ?? copy.account.noEmail}</div>
            <div className="text-xs text-gray-500">{customer.id}</div>
            <div>
              {customer.firstName ?? ""} {customer.lastName ?? ""}
            </div>
          </>
        ) : (
          <div className="text-sm text-red-500">{copy.account.profileUnavailable}</div>
        )}
        <a href="/account/logout" className="text-red-600 underline text-sm">
          {copy.auth.logoutLabel}
        </a>
      </div>
      <h2 className="text-xl font-semibold mb-2">{copy.account.ordersTitle}</h2>
      {orders?.edges?.length ? (
        <ul className="space-y-2">
          {orders.edges.map(({ node }) => (
            <li key={node.id} className="border rounded p-3">
              <div className="font-medium">{copy.account.orderPrefix} {node.name}</div>
              <div>{copy.account.orderDateLabel}: {new Date(node.processedAt).toLocaleDateString()}</div>
              <div>
                {copy.account.orderTotalLabel}: {node.totalPrice.amount} {node.totalPrice.currencyCode}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">{copy.account.noOrders}</div>
      )}
    </main>
  );
}
