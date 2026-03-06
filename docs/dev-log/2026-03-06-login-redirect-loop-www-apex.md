# 2026-03-06 - Login redirect loop (www vs apex)

## Symptom
- Repeated `307` responses on `/api/auth/customer/login` in production.
- Host observed as `www.printtextilien24.de`.

## Root cause
- Login route had strict canonical-origin redirect logic:
  - if `request.nextUrl.origin !== REDIRECT_URI origin`, it always redirected.
- In an environment where infrastructure enforces opposite host canonicalization (`www` <-> apex), this created a redirect loop.

## Fix
- Added same-site host normalization in login canonical check.
- `www` and apex variants are treated as equivalent for canonical redirect decisions.
- Canonical redirect still occurs for genuinely different origins.

## Expected outcome
- `/api/auth/customer/login` no longer loops between `307` redirects when only host variant differs.
- OAuth flow proceeds to Shopify authorization URL.
