import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import {
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_QUERY,
} from "@/lib/shopify/customer/queries";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type AccountCustomer = {
  email?: string;
  firstName?: string;
  lastName?: string;
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

type AccountData = {
  customer?: AccountCustomer;
  orders?: {
    edges?: Array<{ node: AccountOrder }>;
  };
};

async function getCustomerData(accessToken: string): Promise<AccountData | null> {
  try {
    const customerRes = await shopifyCustomerGraphQL<{ customer?: AccountCustomer }>(
      accessToken,
      CUSTOMER_QUERY,
    );
    const ordersRes = await shopifyCustomerGraphQL<{
      customer?: { orders?: AccountData["orders"] };
    }>(accessToken, CUSTOMER_ORDERS_QUERY);

    return {
      customer: customerRes.customer,
      orders: ordersRes.customer?.orders,
    };
  } catch {
    // Keep account access based on cookie presence; this data fetch is optional.
    return null;
  }
}

export default async function AccountPage() {
  const accessToken = (await cookies()).get("shopify_customer_access_token")?.value;
  if (!accessToken) redirect("/account/login");

  const data = await getCustomerData(accessToken);
  const customer = data?.customer;
  const orders = data?.orders;
  return (
    <main className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 mt-16">Account</h1>
      <div className="mb-6">
        {customer ? (
          <>
            <div className="font-medium">{customer.email}</div>
            <div>
              {customer.firstName} {customer.lastName}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            Signed in. Profile details are temporarily unavailable.
          </div>
        )}
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
        <div className="text-sm text-gray-500">
          {data ? "No orders found." : "Orders are temporarily unavailable."}
        </div>
      )}
    </main>
  );
}
