# 2026-03-09 - Account Orders: Item Details

## Goal
Show which products are inside each order card on the account page.

## Changes
- Increased order line-item fetch from `first: 5` to `first: 10`.
- Added `pageInfo.hasNextPage` for line items to indicate truncation.
- Extended account order types to include `lineItems.pageInfo.hasNextPage`.
- Updated account order UI to render an itemized list per order:
  - item title
  - quantity (`xN`)
- Added a small hint when there are more items than fetched:
  - `Weitere Artikel sind in der Bestellung enthalten.`

## Validation
- `pnpm run typecheck` passes.
