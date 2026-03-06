import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  if (!accessToken) {
    // NextResponse.redirect requires an absolute URL; use the incoming
    // request as base so the code behaves the same in tests and in
    // production.
    const dest = new URL("/account/login", request.url);
    return NextResponse.redirect(dest.toString());
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account"],
};
