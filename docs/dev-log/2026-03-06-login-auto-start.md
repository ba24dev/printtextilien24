# 2026-03-06 - Remove login interstitial click

## Issue
- Login UX required an unnecessary extra click:
  1) open `/account/login`
  2) click "Mit Shopify anmelden"
  3) continue in Shopify OAuth.
- This felt wrong especially when entering login from checkout.

## Change
- Updated `app/account/login/page.tsx` to start OAuth automatically when there is no blocking notice state.
- Blocking notice states (logout, callback/session errors, checkout unavailable) still render with manual retry CTA.
- If session check fails, login still proceeds automatically to the OAuth route.

## Result
- Normal sign-in flow no longer has an in-between stop page.
- Error/logout states remain understandable and actionable.
