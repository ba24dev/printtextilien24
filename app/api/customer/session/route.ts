import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { CUSTOMER_QUERY } from "@/lib/shopify/customer/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  if (!accessToken) {
    const resp = NextResponse.json({ loggedIn: false });
    resp.cookies.set("shopify_customer_access_token", "", { maxAge: 0, path: "/" });
    resp.cookies.set("shopify_customer_refresh_token", "", { maxAge: 0, path: "/" });
    return resp;
  }
  try {
    const customerRes = await shopifyCustomerGraphQL(accessToken, CUSTOMER_QUERY);
    const customer = customerRes.customer;
    return NextResponse.json({ loggedIn: true, email: customer?.email });
  } catch (e) {
    // token invalid/expired – clear them
    const resp = NextResponse.json({ loggedIn: false });
    resp.cookies.set("shopify_customer_access_token", "", { maxAge: 0, path: "/" });
    resp.cookies.set("shopify_customer_refresh_token", "", { maxAge: 0, path: "/" });
    return resp;
  }
}
