import { NextRequest, NextResponse } from "next/server";
import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { CUSTOMER_QUERY } from "@/lib/shopify/customer/queries";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(
    "shopify_customer_access_token",
  )?.value;
  if (!accessToken) {
    return NextResponse.json({ loggedIn: false });
  }
  try {
    const customerRes = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY);
    const customer = customerRes.customer;
    return NextResponse.json({ loggedIn: true, email: customer?.email });
  } catch (e) {
    // token invalid/expired
    return NextResponse.json({ loggedIn: false });
  }
}
