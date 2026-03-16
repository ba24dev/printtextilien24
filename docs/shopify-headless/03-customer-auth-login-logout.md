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
2. Page computes safe intent from `checkout_url` or `return_to` query params.
3. Page calls `/api/customer/session`.
4. If already logged in, user is sent to account or intended destination.
5. If checkout intent exists and no blocking notice is active, OAuth starts automatically via `/api/auth/customer/login`.
6. Login route generates PKCE verifier/challenge, `state`, and `nonce`.
7. Transient cookies are set (`shopify_pkce_verifier`, `shopify_oauth_state`, `shopify_oauth_nonce`).
8. User is redirected to Shopify authorize endpoint.
9. Shopify redirects to callback with `code` and `state`.
10. Callback validates params and `state` cookie.
11. Callback exchanges code for tokens with form-encoded POST.
12. Tokens are stored in secure cookies, transient cookies are cleared, and user is redirected to resolved destination.

## Redirect and Intent Handling

### Checkout intent

- Login route accepts `checkout_url`.
- Redirect target is sanitized.
- `/checkouts/...` paths are normalized to storefront host and `logged_in=true` is added.
- Unsafe external URLs are rejected and replaced with checkout-unavailable fallback.

### Return-to intent

- `return_to` is accepted only when safe relative path or same-origin URL.

## Token and Cookie Model

- Access, refresh, and id token are stored in secure cookie storage.
- Large token values are chunked in `lib/shopify/customer/session.ts`.
- Token format is normalized by `formatAccessToken()`.
- Customer API auth headers are retried across safe variants to survive provider format inconsistencies.

## Session Validation

- `/api/customer/session` uses strict validation (`SHOPIFY_CUSTOMER_AUTH_V2=true` default).
- Access token is validated by probing customer identity.
- On expired/invalid access token, refresh token fallback is attempted.
- If provider is temporarily unavailable, response can degrade gracefully.

## Logout Model

- `/account/logout` delegates to `/api/auth/customer/logout`.
- Logout route attempts provider end-session redirect when id token + config are valid.
- Local auth cookies are always cleared.
- On provider failure/unavailability, route falls back to local redirect (`/account/login?logout=1`).
- Cleanup is bounded to observed cookie chunks to avoid oversized response headers.

## Guarding Protected Area

- `proxy.ts` protects `/account` and redirects unauthenticated requests to `/account/login` with `return_to`.

## Source Anchors in Repo

- `app/account/login/page.tsx`
- `app/api/auth/customer/login/route.ts`
- `app/api/auth/customer/callback/route.ts`
- `app/api/auth/customer/refresh/route.ts`
- `app/api/auth/customer/logout/route.ts`
- `lib/shopify/customer/session.ts`
- `lib/shopify/customer/graphql.ts`
- `proxy.ts`

