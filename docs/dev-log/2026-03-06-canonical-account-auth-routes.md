# 2026-03-06 - Canonical auth routes under /account

## Goal
- Remove legacy public `/login` route.
- Standardize customer auth UX on `/account/*` routes only.

## Changes
- Moved customer login page implementation to `/account/login`.
- Added `/account/logout` route that redirects to `/api/auth/customer/logout`.
- Updated internal references:
  - header login -> `/account/login`
  - header/account logout -> `/account/logout`
  - callback error redirects -> `/account/login?reason=...`
  - middleware unauth redirect -> `/account/login`
- Removed `app/login/page.tsx`.

## Operational follow-up
- Shopify login URL should point to:
  - `https://printtextilien24.de/account/login?logout=1`

## Notes
- `/api/auth/customer/logout` remains the secure internal endpoint for provider logout + cookie clearing.
