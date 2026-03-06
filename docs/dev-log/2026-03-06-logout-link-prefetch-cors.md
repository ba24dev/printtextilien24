# 2026-03-06 - Logout CORS noise caused by Link prefetch/fetch

## Symptom
- Clicking/hovering logout produced RSC/fetch requests (`.../account/logout?_rsc=...`) and CORS errors involving Shopify logout URL.
- User appeared locally logged out (cookies cleared), but Shopify IdP session could remain active.

## Root cause
- `next/link` on `/account` logout action triggered client fetch/prefetch behavior.
- Logout flow includes cross-origin redirect to Shopify end-session URL, which is not suitable for fetch-based navigation.

## Fix
- Replaced logout action on account page from `Link` to plain `<a href="/account/logout">`.
- Keeps logout as top-level browser navigation so provider logout redirect can execute normally.

## Result
- No logout prefetch/fetch CORS noise from account page action.
- More reliable full Shopify logout on shared devices.
