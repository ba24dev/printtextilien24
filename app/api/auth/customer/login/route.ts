import { generatePKCE, randomState } from "@/lib/shopify/auth/pkce";
import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID!;
const SHOPIFY_AUTH_URL = process.env.SHOPIFY_CUSTOMER_API_AUTH_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI!;
const SCOPES = "openid email customer_read_customers customer_read_orders";

export async function GET(request: NextRequest) {
  // Generate PKCE verifier/challenge
  const { verifier, challenge } = await generatePKCE();
  const state = randomState();
  const nonce = randomState();

  // Set short-lived httpOnly cookies for verifier, state, nonce
  const response = NextResponse.redirect(
    `${SHOPIFY_AUTH_URL}?` +
      new URLSearchParams({
        client_id: SHOPIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: "S256",
      }).toString(),
  );
  response.cookies.set("shopify_pkce_verifier", verifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  response.cookies.set("shopify_oauth_nonce", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return response;
}
