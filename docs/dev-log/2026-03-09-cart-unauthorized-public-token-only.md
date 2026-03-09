# 2026-03-09 - Cart `UNAUTHORIZED`: Public Token Only

## Issue
- Local cart mutations returned:
  - `{"errors":[{"message":"","extensions":{"code":"UNAUTHORIZED"}}]}`

## Root Cause
- The client-side Shopify provider was configured to use a private Storefront token in non-production.
- Hydrogen browser cart requests must use the public Storefront access token (`X-Shopify-Storefront-Access-Token`).

## Fix
- `components/layout/ClientProviders.tsx` now always uses:
  - `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`
- Added env value sanitization for quoted strings (`"..."` / `'...'`) for:
  - store domain
  - storefront token
  - API version

## Result
- Cart add/update requests no longer depend on customer auth and use the correct Storefront token path.
