# 2026-03-09 - Headless Buy Again + `/cart?cart_link_id` Resolver

## Goal
Support Shopify "Buy again" deep links in a headless-safe way and add a native reorder flow that writes into the Hydrogen local cart.

## Problem
- Shopify order pages can send users to URLs like:
  - `/cart?cart_link_id=...&country=DE`
- In this project, `/cart` did not exist and cart state is managed by Hydrogen `CartProvider` + localStorage cart ID.
- Shopify hosted cart links cannot be imported directly into this headless cart model.

## Changes
- Added `app/cart/page.tsx`:
  - Handles `cart_link_id` and `country`.
  - Shows an explanation that hosted Shopify cart links are resolver-only in this headless setup.
  - Guides users to `/account` for native reorder flow.
- Extended order query fields in `lib/shopify/customer/queries.ts`:
  - `lineItems.nodes.id`
  - `lineItems.nodes.variantId`
  - kept `title` and `quantity` for display and fallback.
- Added `app/account/BuyAgainButton.tsx`:
  - Uses Hydrogen cart actions (`linesAdd`, `linesRemove`).
  - Merge/replace prompt when cart already has lines:
    - `Zusammenführen`
    - `Ersetzen`
    - `Abbrechen`
  - Skips non-reorderable items (missing `variantId`) and shows feedback.
- Integrated Buy Again into account orders list in `app/account/page.tsx`.
- Updated account order line item type in `app/account/types.ts` for reorder fields.

## Notes
- `cart_link_id` is treated as an external signal, not a direct import source.
- Source of truth for reorder is Customer Account order line items.
- Cart mutations remain client-side through existing Hydrogen cart state.
