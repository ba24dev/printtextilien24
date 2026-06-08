# Customer Account Data and Mutations

This section documents how account profile, orders, and address changes are implemented.

## Read Endpoints

### `/api/customer/session`

- Returns login/session status for UI checks.
- Uses strict token validation and refresh fallback when auth-v2 is enabled.

### `/api/customer/me`

- Returns customer profile and order list.
- Uses schema-safe query fallback strategy:
  - try enhanced query first,
  - if Shopify schema rejects fields, retry with fallback query.
- Normalizes `emailAddress.emailAddress` into app-facing `email` for UI stability.

## Write Endpoints

- `POST /api/customer/profile`
- `POST /api/customer/address/create`
- `POST /api/customer/address/update`
- `POST /api/customer/address/delete`

All mutation routes:

- require a valid customer session,
- can apply refreshed tokens before redirect response,
- redirect back to `/account` with success/error query flags.

## Account UI Data Flow

- `/account` page server-fetches `/api/customer/me` using request cookies.
- If unauthenticated, page redirects to `/account/login`.
- UI supports:
  - profile viewing/editing,
  - address CRUD,
  - order list rendering with status/date/price formatting,
  - buy-again integration.

## Buy Again Behavior

- Reorder source of truth is account order line items.
- Buy-again updates local Hydrogen cart via cart hooks.
- Hosted Shopify `cart_link_id` deep links are treated as signals, not direct import payloads.

## Schema and Compatibility Notes

- Customer API schema drift is expected over time.
- This codebase already includes defensive fallbacks and normalized response shape.
- Keep UI contracts stable even when provider schema changes.

