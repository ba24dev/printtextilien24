# 2026-03-06 - Provider logout mismatch between hosts

## Observed behavior
- `/account/logout` cleared local cookies but did not always terminate Shopify IdP session.
- Direct call to `https://www.printtextilien24.de/api/auth/customer/logout` did terminate Shopify session.

## Root cause
- Provider logout requires exact `post_logout_redirect_uri` allowlist matching.
- Logout route previously built post-logout redirect origin from incoming request host (`www` vs apex).
- When request host differed from the allowlisted host, provider logout could be skipped/fail while local logout still succeeded.

## Fix
- Logout route now builds post-logout redirect URL from canonical configured redirect URI origin (`NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI`) with path `/account/login?logout=1`.
- Added more specific debug trace values for fallback reasons (`no_provider_url`, `invalid_id_token`, `missing_client_id`, etc.).

## Result
- Consistent provider logout behavior across host variants when canonical redirect URI is correctly configured.
