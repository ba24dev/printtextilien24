import { cookies } from "next/headers";
import Link from "next/link";

async function getCustomerData() {
  // on a static export or during build we may not have a valid base URL; in
  // that case just pretend the user is not logged in rather than throwing.
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) {
    return null;
  }

  const res = await fetch(new URL("/api/customer/me", base).toString(), {
    headers: {
      Cookie: cookies().toString(),
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AccountPage() {
  const data = await getCustomerData();
  if (!data || !data.customer) {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p className="mb-6">Not logged in.</p>
        <a href="/login" className="underline" rel="noopener noreferrer">
          Sign in
        </a>
      </main>
    );
  }
  const { customer, orders } = data;
  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="mb-6">
        <div className="font-medium">{customer.email}</div>
        <div>
          {customer.firstName} {customer.lastName}
        </div>
        <Link
          href="/api/auth/customer/logout"
          className="text-red-600 underline text-sm"
        >
          Logout
        </Link>
      </div>
      <h2 className="text-xl font-semibold mb-2">Orders</h2>
      {orders?.edges?.length ? (
        <ul className="space-y-2">
          {orders.edges.map(({ node }: any) => (
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
        <div>No orders found.</div>
      )}
    </main>
  );
}
