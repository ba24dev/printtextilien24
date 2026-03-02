import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import {
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_QUERY,
} from "@/lib/shopify/customer/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(
    "shopify_customer_access_token",
  )?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const customer = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY);
    const orders = await shopifyCustomerGraphQL(
      accessToken,
      CUSTOMER_ORDERS_QUERY,
    );
    return NextResponse.json({
      customer: customer.customer,
      orders: orders.customer.orders,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
