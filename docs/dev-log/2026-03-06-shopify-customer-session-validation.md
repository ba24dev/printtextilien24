# 2026-03-06 - Shopify Customer Account session validation failure

## Context
- Environment: Production only (`printtextilien24.de`), auth flow not reproducible on localhost due to domain/redirect constraints.
- Symptom: Customer session check returned unauthenticated with `reason: refresh_failed`.
- Debug endpoint used: `/api/auth/customer/debug?probe=1`.

## What we observed
- Tokens/cookies were present and looked valid (`shopify_customer_access_token`, `shopify_customer_refresh_token`, `shopify_customer_id_token`).
- Discovery endpoints resolved correctly.
- Direct identity probe and refresh identity probe both failed with:
  - `Field 'email' doesn't exist on type 'Customer'`.

## Root cause
Shopify Customer Account API schema changed for customer email. The queried field `customer.email` is no longer available in this API version; email is exposed through `customer.emailAddress.emailAddress`.

## Fix applied
1. Updated GraphQL queries to request `emailAddress { emailAddress }` instead of `email`.
2. Updated session validation identity fetch to read `emailAddress.emailAddress`.
3. Updated debug probe identity query to the new email field.
4. Added response normalization in `/api/customer/me` to keep app-facing shape stable:
   - API responses still include `customer.email` for UI consumers.

## Files changed
- `lib/shopify/customer/queries.ts`
- `lib/shopify/customer/session.ts`
- `app/api/auth/customer/debug/route.ts`
- `app/api/customer/me/route.ts`

## Validation plan (production)
1. Deploy to production.
2. Log in with Customer Account OAuth flow.
3. Hit `/api/auth/customer/debug?probe=1`.
4. Confirm:
   - `probe.sessionValidation.authenticated === true`
   - no GraphQL error about `Customer.email`
5. Open `/account` and verify customer/email/orders render correctly.

## Reuse checklist for next shop
- Use Customer Account API schema-compatible fields from day 1 (`emailAddress { emailAddress }`).
- Keep a normalization layer for app-facing payloads to avoid UI breakage when API schemas evolve.
- Keep debug probe endpoint available behind a key (`SHOPIFY_CUSTOMER_DEBUG_KEY`) for production-only troubleshooting.
