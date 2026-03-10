# Troubleshooting

Use this page when auth/cart/account behavior fails unexpectedly.

## Quick Checks

1. Verify env values in `.env.local` match required names in `.env.example`.
2. Confirm redirect URI and OAuth endpoints exactly match Shopify admin values.
3. Confirm account auth routes are reachable on your active host variant.
4. Check `/api/auth/customer/debug` output (with debug key if configured).

## Common Failures

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| OAuth callback redirects to login with `auth_session_expired` | Missing/mismatched `state` or missing PKCE verifier cookie | Restart login flow and confirm cookies are allowed and domain config is correct |
| Repeated redirects on `/api/auth/customer/login` | Canonical host mismatch (`www` vs apex) loop | Align redirect URI origin and keep host-normalization logic active |
| `Customer.email` GraphQL field error | Schema drift in Customer Account API | Use `emailAddress { emailAddress }` and keep query fallback paths |
| Cart mutation returns `UNAUTHORIZED` | Wrong storefront token on client cart operations | Use public storefront token in client provider config |
| Logout returns provider/local inconsistency | Invalid id token, missing logout endpoint, or host mismatch for post-logout URI | Keep fallback local logout and canonical redirect origin derivation |
| Production logout 500 with function invocation failure | Excessive `Set-Cookie` headers from aggressive chunk cleanup | Clear only observed token cookie chunks |
| Account page unauthenticated while tokens exist | Access token invalid/expired and refresh failure | Check token refresh endpoint, scopes, and Customer API endpoint discovery |

## Debug Endpoint Usage

- Endpoint: `/api/auth/customer/debug`
- Optional auth: `SHOPIFY_CUSTOMER_DEBUG_KEY`
- Useful flags:
  - `?probe=1`
  - `?set_test_cookie=1`
  - `?clear_test_cookie=1`

Inspect returned diagnostics for:

- env/config readiness,
- cookie presence and token shape,
- discovery endpoint resolution,
- session validation and refresh behavior.

## Primary Incident References

- `docs/dev-log/2026-03-06-shopify-customer-session-validation.md`
- `docs/dev-log/2026-03-06-login-redirect-loop-www-apex.md`
- `docs/dev-log/2026-03-06-provider-logout-host-mismatch.md`
- `docs/dev-log/2026-03-06-prod-logout-500-hardening.md`
- `docs/dev-log/2026-03-06-prod-logout-500-header-bloat.md`
- `docs/dev-log/2026-03-09-cart-unauthorized-public-token-only.md`

