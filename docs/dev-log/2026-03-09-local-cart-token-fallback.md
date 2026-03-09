# 2026-03-09 - Local Cart Add Fallback Token

## Goal
Unblock add-to-cart behavior on localhost when the public Storefront token cannot create/update carts.

## Change
- Updated `components/layout/ClientProviders.tsx` token selection:
  - Production: use `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`.
  - Non-production: prefer `NEXT_PUBLIC_SHOPIFY_PRIVATE_STOREFRONT_API_TOKEN`, fallback to public token.

## Why
- Product rendering can work with server-side queries while client cart mutations fail if the public token lacks required checkout/cart capabilities.
- This keeps production behavior unchanged and gives reliable local cart mutation behavior.

## Validation
- `pnpm run typecheck` passes.
