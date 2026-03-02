# Shopify Customer Accounts Integration

## Backend Steps

1. **OAuth Login Handler** (`/api/auth/customer/login`)
   - Generates PKCE verifier/challenge, state, nonce.
   - Sets httpOnly, secure cookies for verifier, state, nonce.
   - Redirects to Shopify authorize endpoint.

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
   - Clears all customer auth cookies.
   - Redirects to `/`.

5. **Customer API Helper** (`lib/shopify/customer/graphql.ts`)
   - Calls Shopify Customer Account API GraphQL endpoint with access token.

6. **Typed GraphQL Queries** (`lib/shopify/customer/queries.ts`)
   - `customer { id, email, firstName, lastName }`
   - `customer.orders(first: 10) { ... }`

7. **Customer Data API** (`/api/customer/me`)
   - Returns customer profile and orders using access token from cookies.

8. **Session API** (`/api/customer/session`)
   - Returns `{ loggedIn, email }` based on access token cookie.

9. **Middleware Guard** (`middleware.ts`)
   - Redirects unauthenticated users from `/account` to login.

10. **Unit Tests** (`tests/shopify-auth/`)
    - PKCE utils and state validation.

## Shopify Admin Config

- Enable “Customer accounts” (new accounts) in Shopify admin.
- Create a Customer Account API client.
- Set callback URL to `https://<domain>/api/auth/customer/callback`.
- To require login before checkout: enable Shopify setting “Require customers to sign in to their customer account before checkout”.
- For order approval: create Shopify Flow workflow to hold fulfillment and tag orders “needs_approval”, plus a workflow/action to release hold when approved.

## Local Development

- Use a tunnel (e.g., ngrok) for HTTPS callback URLs: `https://<ngrok-id>.ngrok.io/api/auth/customer/callback`.
- Set environment variables for Shopify domain, client ID/secret, and redirect URI.

## Security Notes

- All tokens are stored in httpOnly, secure, sameSite=lax cookies.
- No tokens are accessible to client JS or stored in localStorage.
- No customer PII is stored locally or in Supabase.

---

See code and tests for implementation details.
