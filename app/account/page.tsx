import { cookies } from "next/headers";
import Link from "next/link";

async function getCustomerData() {
  const res = await fetch("/api/customer/me", {
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
        <Link href="/api/auth/customer/login" className="underline">
          Sign in
        </Link>
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
