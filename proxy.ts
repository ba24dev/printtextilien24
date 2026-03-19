import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionStore = process.env.SHOPIFY_SESSION_STORE?.trim().toLowerCase();
  const useRedisSessionStore = sessionStore === "redis" || sessionStore === "kv";
  const hasAuthCookie = useRedisSessionStore
    ? Boolean(request.cookies.get("shopify_customer_session_id")?.value)
    : Boolean(request.cookies.get("shopify_customer_access_token")?.value);

  if (!hasAuthCookie) {
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
