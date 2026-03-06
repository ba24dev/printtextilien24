# 2026-03-06 - Prod logout 500 hardening

## Issue
- Production intermittently returned `500` on `GET /api/auth/customer/logout`.
- Login/session flow still worked.

## Root cause
- Logout route resolved config at module initialization (`getShopifyClientId()`), which can throw before request handling if env/runtime state is invalid or unavailable.
- A throw at module scope can surface as route-level 500 before fallback logic runs.

## Fix
- Moved config resolution to request scope with safe wrappers.
- Hardened provider logout construction so any failure falls back to local redirect.
- Standardized local post-logout redirect target to `/account/login?logout=1`.
- Kept cookie clearing unconditional.
- Added structured debug trace outcomes:
  - `logout_completed:provider_redirect`
  - `logout_completed:local_fallback`
  - `logout_completed:local_fallback_error`

## Expected behavior after fix
- Logout should never return 500 from this route.
- On provider-logout success, user is redirected through provider end-session endpoint.
- On any provider/config/token issue, user is still logged out locally and redirected to `/account/login?logout=1`.
