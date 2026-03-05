import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

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
      message: "Could not determine request host for account lookup.",
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
        message: payload.error ?? `Account API request failed (${response.status}).`,
      };
    }

    return {
      status: "authenticated",
      data: payload,
    };
  } catch {
    return {
      status: "error",
      message: "Could not load customer profile. Please try again.",
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
        <h1 className="text-4xl font-bold mb-4 mt-16">Account</h1>
        <p className="text-sm text-red-500 mb-4">Could not load account details.</p>
        <p className="text-sm text-gray-500 mb-6">{result.message}</p>
        <Link href="/account" className="underline">
          Retry
        </Link>
      </main>
    );
  }

  const customer = result.data.customer;
  const orders = result.data.orders;

  return (
    <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 mt-16">Account</h1>
      {checkoutError ? (
        <div className="mb-4 rounded border border-yellow-500/40 bg-yellow-900/20 p-3 text-sm text-yellow-100">
          Your previous checkout session is no longer available. Please return to cart and
          start checkout again.
        </div>
      ) : null}
      <div className="mb-6">
        {customer ? (
          <>
            <div className="font-medium">{customer.email ?? "No email available"}</div>
            <div className="text-xs text-gray-500">{customer.id}</div>
            <div>
              {customer.firstName ?? ""} {customer.lastName ?? ""}
            </div>
          </>
        ) : (
          <div className="text-sm text-red-500">Could not load customer profile details.</div>
        )}
        <Link href="/api/auth/customer/logout" className="text-red-600 underline text-sm">
          Logout
        </Link>
      </div>
      <h2 className="text-xl font-semibold mb-2">Orders</h2>
      {orders?.edges?.length ? (
        <ul className="space-y-2">
          {orders.edges.map(({ node }) => (
            <li key={node.id} className="border rounded p-3">
              <div className="font-medium">Order {node.name}</div>
              <div>Date: {new Date(node.processedAt).toLocaleDateString()}</div>
              <div>
                Total: {node.totalPrice.amount} {node.totalPrice.currencyCode}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">No orders yet.</div>
      )}
    </main>
  );
}
