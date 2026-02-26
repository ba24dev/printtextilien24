import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID!;
const SHOPIFY_TOKEN_URL = process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_API_CLIENT_SECRET!;

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(
    "shopify_customer_refresh_token",
  )?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const tokenRes = await fetch(SHOPIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
  const tokenData = await tokenRes.json();
  // Set new tokens in cookies
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    "shopify_customer_access_token",
    tokenData.access_token,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenData.expires_in,
      path: "/",
    },
  );
  response.cookies.set(
    "shopify_customer_refresh_token",
    tokenData.refresh_token,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    },
  );
  return response;
}
