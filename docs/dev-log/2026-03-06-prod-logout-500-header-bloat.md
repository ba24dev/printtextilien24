# 2026-03-06 - Logout 500 follow-up (cookie header bloat)

## Symptom
- `/api/auth/customer/logout` still returned `500` in production with `FUNCTION_INVOCATION_FAILED`.
- Local logout worked.

## Likely cause
- Logout route previously cleared chunked token cookies using a fixed max-chunk sweep for each cookie name.
- That emitted a large number of `Set-Cookie` headers on each logout and can exceed platform header limits in production.

## Fix
- Changed logout cookie cleanup to clear only cookies observed on the incoming request.
- For token cookies, chunk cleanup is now bounded by observed chunk metadata/present chunks.
- Kept existing provider-logout fallback and post-logout redirect behavior unchanged.

## Expected result
- Logout should no longer fail due to oversized response headers during cookie cleanup.
