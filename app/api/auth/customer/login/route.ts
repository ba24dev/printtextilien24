import { generatePKCE, randomState } from "@/lib/shopify/auth/pkce";
import { NextRequest, NextResponse } from "next/server";
import { SCOPES, unknownScopes, normalizeScopes } from "@/lib/shopify/auth/scopes";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID!;
const SHOPIFY_AUTH_URL = process.env.SHOPIFY_CUSTOMER_API_AUTH_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI!;

// note: SCOPES is now imported from a shared helper.  It defaults to the two
// basic read scopes and can be overridden via
// SHOPIFY_CUSTOMER_API_SCOPES in the environment.

export async function GET(request: NextRequest) {
  // warn if the scopes string is blank – this is a common misconfiguration
  if (!SCOPES || SCOPES.trim() === "") {
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES is empty; authorization URL will fail",
    );
  }
  if (SCOPES.includes(",")) {
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES contains commas; they will be converted to spaces",
    );
  }
  const bad = unknownScopes(SCOPES);
  if (bad.length) {
    console.warn(
      "SHOPIFY_CUSTOMER_API_SCOPES contains unknown/unexpected scopes:",
      bad,
    );
  }

  // Generate PKCE verifier/challenge
  const { verifier, challenge } = await generatePKCE();
  const state = randomState();
  const nonce = randomState();

  // build the authorization URL so we can examine it in logs
  const authUrl =
    `${SHOPIFY_AUTH_URL}?` +
    new URLSearchParams({
      client_id: SHOPIFY_CLIENT_ID,
      // if SCOPES is accidentally empty or contains invalid entries
      // Shopify will immediately render an error page rather than
      // redirecting back; keeping this construction explicit makes it
      // easier to log/inspect during development.
      //
      // note: public Headless clients don’t show `openid` or `email` in
      // the permissions UI, so requesting them here will produce the
      // "invalid scope" error.  Only ask for scopes which you’ve enabled
      // in the Shopify admin.
      scope: normalizeScopes(SCOPES),
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();

  console.info("redirecting user to Shopify auth URL", authUrl);
  if (SCOPES !== normalizeScopes(SCOPES)) {
    console.info(
      "normalized scopes to",
      normalizeScopes(SCOPES),
      "from",
      SCOPES,
    );
  }

  const response = NextResponse.redirect(authUrl);
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
