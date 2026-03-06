# 2026-03-06 - Remove logout flicker on /account/logout

## Issue
- `/account/logout` was implemented as a page that immediately redirected to `/api/auth/customer/logout`.
- This caused a visible route-load flicker before logout redirect completed.

## Change
- Replaced `/account/logout` page with a route handler.
- New `app/account/logout/route.ts` directly delegates to the existing secure logout handler.

## Result
- `/account/logout` remains the canonical URL.
- No intermediate page render during logout navigation.
