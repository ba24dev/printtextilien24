# 2026-03-09 - Account/Cart Copy Centralization

## Goal
Move hardcoded user-facing strings in account/cart customer flows into `config/copy.ts`.

## Changes
- Added account/cart copy keys for:
  - order status labels
  - account headings/alerts/button labels
  - buy-again modal/toast labels
  - address form labels/placeholders/modal/delete labels
  - contact panel labels/placeholders/fallback labels
  - cart resolver page content
  - shared account error messages (`missingAddress`, `unknownError`)
- Replaced hardcoded strings with `copy.*` in:
  - `app/account/page.tsx`
  - `app/account/BuyAgainButton.tsx`
  - `app/account/AddressesPanel.tsx`
  - `app/account/ContactDetailsPanel.tsx`
  - `app/cart/page.tsx`
  - `app/api/customer/address/create/route.ts`
  - `app/api/customer/address/update/route.ts`
  - `app/api/customer/address/delete/route.ts`
  - `app/api/customer/profile/route.ts`

## Validation
- `pnpm run typecheck` passes.
