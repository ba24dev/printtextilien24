# Checkout Integration and Edge Cases

This section captures headless checkout specifics and production hardening decisions.

## Checkout Entry Paths

### From local cart drawer

- Checkout URL comes from Hydrogen cart state.
- URL is normalized and appended with `logged_in=true` before navigation.

### From Shopify login redirect (`checkout_url`)

- `/account/login` and `/api/auth/customer/login` accept checkout intent.
- Redirect target is sanitized.
- Checkout paths are rewritten to storefront host and include `logged_in=true`.

## Post-Login Redirect Behavior

- Priority order:
  1. safe checkout intent
  2. safe `return_to`
  3. `/account`
- Unsafe intent URLs are blocked and replaced with account fallback carrying checkout error context.

## Middleware and Route Canonicalization

- `/account` route is middleware-protected.
- Unauthenticated users are sent to `/account/login?return_to=...`.
- Login route canonical-origin logic avoids redirect loops between `www` and apex host variants.

## Headless Buy Again and `/cart?cart_link_id`

- Hosted Shopify cart links are not directly importable into local Hydrogen cart state.
- `app/cart/page.tsx` acts as resolver UX:
  - explains limitation,
  - sends user to `/account` buy-again flow.

## Logout Across Host Variants

- Provider logout requires allowlisted `post_logout_redirect_uri` exact matching.
- This repo derives canonical post-logout redirect from configured redirect URI origin.
- If provider logout cannot be used, local logout still succeeds.

## Response Header Safety

- Chunked token cookie cleanup can generate many `Set-Cookie` headers.
- This repo clears only observed chunks to avoid platform header-size failures in production.

## Source Anchors in Repo

- `components/cart/CartFooter.tsx`
- `app/account/login/page.tsx`
- `lib/shopify/customer/redirects.ts`
- `app/cart/page.tsx`
- `app/api/auth/customer/login/route.ts`
- `app/api/auth/customer/logout/route.ts`
- `docs/dev-log/2026-03-06-login-redirect-loop-www-apex.md`
- `docs/dev-log/2026-03-06-provider-logout-host-mismatch.md`
- `docs/dev-log/2026-03-06-prod-logout-500-header-bloat.md`

