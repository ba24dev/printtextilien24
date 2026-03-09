# 2026-03-09 - Address Delete Mutation Argument Fix

## Issue
- Customer Account API returned:
  - `customerAddressDelete` missing required `addressId`
  - `id` argument not accepted

## Fix
- Updated `app/api/customer/address/delete/route.ts`:
  - mutation variable `$id` -> `$addressId`
  - mutation call `customerAddressDelete(id: ...)` -> `customerAddressDelete(addressId: ...)`
  - payload variable key `id` -> `addressId`

## Validation
- `pnpm run typecheck` passes.
