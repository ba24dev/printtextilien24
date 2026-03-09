# 2026-03-09 - Inline Address Editing On Account Page

## Goal
Replace the old `<details>`-based address edit/create flow with an inline card UX that matches the contact details panel behavior.

## Changes
- Replaced server-rendered address `<details>` forms in the account page with `AddressesPanel`.
- Integrated `AddressesPanel` in `app/account/page.tsx` and passed:
  - `addresses`
  - `defaultAddressId`
- Updated `AddressesPanel` behavior:
  - Address cards are read-only by default.
  - Edit icon opens inline inputs in the same card.
  - Save/Cancel actions are inline.
  - Add-address remains a dedicated plus-card with inline create form.
  - Delete is now two-step in-card (`Löschen` -> `Löschen bestätigen` / `Nicht löschen`).
- Kept existing address API endpoints unchanged:
  - `/api/customer/address/create`
  - `/api/customer/address/update`
  - `/api/customer/address/delete`

## Validation
- `pnpm run typecheck` passes.

## Notes
- This is server roundtrip form submission UX (no optimistic client updates).
- Country/region fields remain `territoryCode` and `zoneCode`.
