# 2026-03-09 - Account profile/orders overhaul with schema-safe fallbacks

## What changed
- Expanded customer query fields for account UI enrichment:
  - `displayName`, `phoneNumber`, `imageUrl` (plus existing email/name fields).
- Expanded order query fields for familiar account presentation:
  - `statusPageUrl`, `financialStatus`, `cancelledAt`, `cancelReason`, `lineItems` summary.

## Safety mechanism
- Added schema fallback flow in `/api/customer/me`:
  - try enhanced customer/order queries first,
  - if Shopify returns unknown-field schema errors, fallback to basic queries.
- This keeps account page functional across Customer API version/schema differences.

## UI overhaul
- Reworked `/account` layout to a card-based dashboard style:
  - profile section with customer name/id, email, phone,
  - action-aligned logout button,
  - recent orders list with status badges, localized dates and prices,
  - optional external order status link when available.
- Replaced raw `gid://` display with readable customer ID segment.
- Switched date/currency rendering to `de-DE` formatting.

## Notes
- Scope for this pass focused on Profile + Orders only.
- Address/payment sections remain for subsequent iteration once final field contract is locked.
