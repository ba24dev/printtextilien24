import { SCOPES } from "@/lib/shopify/auth/scopes";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID!;
const SHOPIFY_TOKEN_URL = process.env.SHOPIFY_CUSTOMER_API_TOKEN_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI!;
// public (web) clients have no secret; it’s optional
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_API_CLIENT_SECRET;

const CallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  scope: z.string().optional(),
  context: z.string().optional(),
});

export async function GET(request: NextRequest) {
  console.debug("callback handler invoked");
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    console.debug("callback params", params);
    const parsed = CallbackSchema.safeParse(params);
    if (!parsed.success) {
      console.warn("callback params failed validation", params);
      return NextResponse.json({ error: "Invalid callback params" }, { status: 400 });
    }
    const { code, state, scope } = parsed.data;
    console.debug("received code,state,scope", { code, state, scope });
    if (scope && scope !== SCOPES) {
      console.warn("Shopify returned a different scope than requested:", scope, "expected", SCOPES);
    }

    // Validate state matches cookie
    const stateCookie = request.cookies.get("shopify_oauth_state")?.value;
    const verifier = request.cookies.get("shopify_pkce_verifier")?.value;
    console.debug("cookies", { stateCookie, verifier });
    if (!stateCookie || stateCookie !== state) {
      console.warn("state cookie mismatch", stateCookie, state);
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    // Get PKCE verifier from cookie
    if (!verifier) {
      console.warn("no PKCE verifier cookie present");
      return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
    }

    // Exchange code for tokens
    const bodyPayload: Record<string, unknown> = {
      client_id: SHOPIFY_CLIENT_ID,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    };
    if (SHOPIFY_CLIENT_SECRET) {
      bodyPayload.client_secret = SHOPIFY_CLIENT_SECRET;
    }

    // Shopify expects a form‑encoded body rather than JSON
    const urlencoded = new URLSearchParams();
    Object.entries(bodyPayload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) urlencoded.set(k, String(v));
    });

    const tokenRes = await fetch(SHOPIFY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlencoded.toString(),
    });
    if (!tokenRes.ok) {
      const bodyText = await tokenRes.text();
      console.error("Shopify token exchange error", tokenRes.status, bodyText, bodyPayload);
      return NextResponse.json(
        { error: "Token exchange failed", details: bodyText },
        { status: 400 },
      );
    }
    const tokenData = await tokenRes.json();
    // tokenData: { access_token, refresh_token, expires_in, id_token, ... }

    // determine where we should send the user after login; default to
    // /account but allow a previously stored destination (e.g. a
    // checkout_url from Shopify) to override.
    const postLogin = request.cookies.get("shopify_post_login_redirect")?.value;
    const redirectTarget = postLogin ? new URL(postLogin, request.url).toString() : "/account";

    const response = NextResponse.redirect(redirectTarget);
    response.cookies.set("shopify_customer_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenData.expires_in,
      path: "/",
    });
    response.cookies.set("shopify_customer_refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    // Clear PKCE and state cookies
    response.cookies.set("shopify_pkce_verifier", "", { maxAge: 0, path: "/" });
    response.cookies.set("shopify_oauth_state", "", { maxAge: 0, path: "/" });
    response.cookies.set("shopify_oauth_nonce", "", { maxAge: 0, path: "/" });
    // and clear our custom destination cookie so it won't stick around
    if (postLogin) {
      response.cookies.set("shopify_post_login_redirect", "", {
        maxAge: 0,
        path: "/",
      });
    }
    return response;
  } catch (err) {
    console.error("callback handler unexpected error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
