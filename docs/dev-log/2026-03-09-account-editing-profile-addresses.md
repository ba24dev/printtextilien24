# 2026-03-09 - Account editing: profile + addresses

## What was missing
- Account page only displayed customer data; no edit capability for profile or addresses.

## Implementation
- Added authenticated customer mutation routes:
  - `POST /api/customer/profile`
  - `POST /api/customer/address/create`
  - `POST /api/customer/address/update`
  - `POST /api/customer/address/delete`
- Added shared auth helper for customer API mutation routes:
  - validates customer session from cookies,
  - applies refreshed tokens to redirect responses,
  - redirects back to `/account` with status query params.
- Updated account page with server-rendered forms:
  - contact details edit form (displayName, firstName, lastName),
  - address add form,
  - per-address update and delete forms,
  - success/error flash messaging via query params.

## UX detail
- Phone number was removed from contact summary section as requested.
- Phone is managed and shown in address cards/forms.
