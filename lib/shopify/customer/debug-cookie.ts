import { getCustomerCookieDomain } from "@/lib/shopify/customer/cookies";
import { NextResponse } from "next/server";

function debugCookieOptions(maxAge: number) {
  const domain = getCustomerCookieDomain();
  return {
    httpOnly: false,
    secure: true,
    sameSite: "lax" as const,
    maxAge,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setCustomerDebugTrace(response: NextResponse, value: string): void {
  response.cookies.set(
    "shopify_customer_debug_trace",
    `${value}:${Date.now()}`,
    debugCookieOptions(60 * 15),
  );
}

export function clearCustomerDebugTrace(response: NextResponse): void {
  response.cookies.set("shopify_customer_debug_trace", "", debugCookieOptions(0));
}
