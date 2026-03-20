# Customer Auth: Login, Callback, Refresh, Logout

This is the canonical auth implementation for this repository.

## Route Map

- Public login page: `/account/login`
- OAuth start: `/api/auth/customer/login`
- OAuth callback: `/api/auth/customer/callback`
- Token refresh: `/api/auth/customer/refresh`
- Canonical logout entry: `/account/logout`
- Provider/logout backend handler: `/api/auth/customer/logout`

## End-to-End Login Sequence

1. User lands on `/account/login`.
2. Page computes a safe post-login intent from `checkout_url` or `return_to`.
3. Page checks session state through the customer session endpoint.
4. If already authenticated, user is redirected to the account area or intended destination.
5. If checkout intent exists and no recent logout / blocking notice is active, OAuth can start automatically.
6. Login route generates PKCE verifier/challenge plus `state` and `nonce`.
7. User is redirected to Shopify’s authorize endpoint.
8. Shopify redirects back to the callback with `code` and `state`.
9. Callback validates the OAuth response and exchanges the code for tokens.
10. Tokens are normalized and stored server-side.
11. A session is created in Redis / KV.
12. Browser receives only a small HttpOnly cookie: `shopify_customer_session_id`.

## Redirect and Intent Handling

### Checkout intent

- Login accepts `checkout_url`.
- Redirect target is sanitized.
- `/checkouts/...` paths are normalized onto the storefront origin.
- `logged_in=true` is appended.
- Unsafe external URLs are rejected.
- Invalid targets fall back to `/account?checkout_error=1`.

### Return-to intent

- `return_to` must be:
  - a safe relative path, or
  - a same-origin URL
- Unsafe values are discarded.

## Token and Session Storage Model

- Tokens are stored server-side in Redis / KV.
- Browser stores only `shopify_customer_session_id` (HttpOnly, secure).
- Session key format:
  - `shopify:customer:session:{sessionId}`
- Session contains:
  - accessToken
  - refreshToken
  - idToken
  - expiresAt (optional)
  - updatedAt
- TTL:
  - based on token expiry if available
  - fallback: 30 days

## Session Resolution

1. Read session ID from cookie
2. Load session from Redis
3. Extract tokens

## Session Validation

- Access token is validated against Shopify customer API
- If invalid:
  - refresh token fallback is attempted
- If provider unavailable:
  - validation degrades gracefully

## Refresh Model

- Uses refresh token from Redis session
- Exchanges token with Shopify
- Updates existing session
- Cookie remains unchanged unless session is recreated

## Logout Model

- Deletes Redis session
- Clears session cookie
- Optionally triggers provider logout
- Falls back to `/account/login?logout=1`
- Prevents immediate silent re-login via short-lived flags

## Guarding Protected Area

- `/account` routes are protected via proxy/middleware
- Unauthenticated users are redirected to login with `return_to`
- Auth is determined via:
  - session cookie
  - successful Redis session resolution

## Notes

- Legacy chunked-cookie token storage still exists as fallback
- Redis session storage is the canonical model
