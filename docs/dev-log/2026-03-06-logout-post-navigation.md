# 2026-03-06 - Force full navigation for logout via POST

## HAR finding
- Logout was executed as RSC fetch (`/account/logout?_rsc=...`, `sec-fetch-mode: cors`) instead of document navigation.
- Redirect chain then produced CORS-blocked fetch behavior.

## Change
- `/account/logout` now supports both `GET` and `POST`.
- Account page logout action changed to POST form submit.
- Header dropdown logout action changed to POST form submit.

## Why
- Form POST forces top-level browser navigation semantics for logout.
- Avoids Next.js router fetch/prefetch path for logout, which is incompatible with cross-origin provider redirect flows.
