import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("shopify_customer_access_token")?.value;
  if (!accessToken) {
    const dest = new URL("/account/login", request.url);
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    // Sanitize the return_to parameter.
    if (
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.startsWith("/checkouts")
    ) {
      dest.searchParams.set("return_to", returnTo);
    }

    return NextResponse.redirect(dest.toString());
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account"],
};
