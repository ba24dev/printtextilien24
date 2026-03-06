# Shopify Customer Accounts Integration

## Backend Steps

> 🔐 **Scope note:** this project accepts both the newer
> `customer-account-api:full` scope and granular customer scopes (for example
> `customer_read_customers`, `customer_write_customers`, `customer_read_orders`).
> `SHOPIFY_CUSTOMER_API_SCOPES` must exactly match what is enabled on the
> Shopify Customer Account API client.

The system exposes a customer-facing login page at `/account/login`, which is
exactly the URL Shopify will redirect customers to during headless checkout (the
`checkout_url` query parameter is preserved).

1. **OAuth Login Handler** (`/api/auth/customer/login`)
   - Generates PKCE verifier/challenge, state, nonce.
   - Sets httpOnly, secure cookies for verifier, state, nonce.
   - Redirects to Shopify authorize endpoint.
   - Handles an optional `checkout_url` query param by preserving it in a
     temporary cookie so the callback can forward the user back to the
     checkout when they return from Shopify.

     **Tokens & headers:** Shopify Customer Account API requires access tokens
     to be prefixed with `shcat_` and sent directly as the `Authorization`
     header value – do **not** use the standard `Bearer` prefix. The
     helper `formatAccessToken()` applies the prefix if needed and strips any
     stray `Bearer` text.

2. **OAuth Callback Handler** (`/api/auth/customer/callback`)
   - Validates state from query/cookie.
   - Exchanges code for tokens at Shopify token endpoint.
   - Stores access/refresh tokens in httpOnly, secure cookies.
   - Clears PKCE/state cookies.
   - Redirects to `/account`.

3. **Token Refresh Handler** (`/api/auth/customer/refresh`)
   - Uses refresh token cookie to obtain new access token.
   - Rotates tokens and updates cookies.

4. **Logout Handler** (`/api/auth/customer/logout`)
   - Canonical user-facing logout URL is `/account/logout`.
   - Attempts provider end-session logout (`id_token_hint`) when possible.
   - Always clears local customer auth cookies.
   - Redirects to `/account/login?logout=1` (canonical post-logout page).

5. **Customer API Helper** (`lib/shopify/customer/graphql.ts`)
   - Calls Shopify Customer Account API GraphQL endpoint with access token.

6. **Typed GraphQL Queries** (`lib/shopify/customer/queries.ts`)
   - `customer { id, emailAddress { emailAddress }, firstName, lastName }`
   - `customer.orders(first: 10) { ... }`

7. **Customer Data API** (`/api/customer/me`)
   - Returns customer profile and orders using access token from cookies.

8. **Session API** (`/api/customer/session`)
   - Returns `{ loggedIn, email }` based on access token cookie.

9. **Middleware Guard** (`middleware.ts`)
   - Redirects unauthenticated users from `/account` to `/account/login`.

10. **Unit Tests** (`tests/shopify-auth/`)
    - PKCE utils and state validation.

## Shopify Admin Config

- Enable “Customer accounts” (new accounts) in Shopify admin.
- Create a Customer Account API client and note its **client ID** (and secret if you choose the private type).
- Set callback URL to `https://<domain>/api/auth/customer/callback`.
- To require login before checkout: enable Shopify setting “Require customers to sign in to their customer account before checkout”.
- For order approval: create Shopify Flow workflow to hold fulfillment and tag orders “needs_approval”, plus a workflow/action to release hold when approved.

## Local Development

- Use a tunnel (e.g., ngrok) for HTTPS callback URLs: `https://<ngrok-id>.ngrok.io/api/auth/customer/callback`.
- **Environment variables:** you must supply the client ID and redirect URI. The three provider URLs
  (`SHOPIFY_CUSTOMER_API_AUTH_URL`, `SHOPIFY_CUSTOMER_API_TOKEN_URL`,
  `SHOPIFY_CUSTOMER_API_LOGOUT_URL`) **must** also be set to the full Shopify
  endpoints you copied from the admin; they include a numeric identifier that
  cannot be inferred from the client ID or any other value. Omitting them will
  cause the login flow to throw an error at runtime. This is a one-time copy‑paste
  cost, and it prevents the endless mis‑config loops we’ve been chasing.

  The only Shopify URL that actually uses your store’s domain is
  `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL` (for the Storefront API). Don’t try to
  build the OAuth endpoints from it: the authorization server is completely
  separate.

## Security Notes

- All tokens are stored in httpOnly, secure, sameSite=lax cookies.
- No tokens are accessible to client JS or stored in localStorage.
- No customer PII is stored locally or in Supabase.

---

See code and tests for implementation details.
