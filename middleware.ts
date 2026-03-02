import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(
    "shopify_customer_access_token",
  )?.value;
  if (!accessToken) {
    return NextResponse.redirect("/api/auth/customer/login");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account"],
};
