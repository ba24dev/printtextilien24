`# Local Shopify Auth Testing With ngrok

This guide validates the Redis-backed Shopify auth flow on a local app exposed via ngrok.

## 1) Prepare Environment

1. Keep your normal `.env.local` as your base config.
2. Use `.env.dev.local` as your ngrok override source.
3. Enable ngrok env mode:

```bash
pnpm run env:ngrok:on
```

Or start dev with ngrok overrides in one command:

```bash
pnpm run dev:ngrok
```

4. Confirm these effective values in `.env.development.local`:

```env
SHOPIFY_SESSION_STORE="redis"
NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI="https://elidia-unpliable-angla.ngrok-free.dev/api/auth/customer/callback"
SHOPIFY_CUSTOMER_COOKIE_DOMAIN=""
NEXT_PUBLIC_SHOPIFY_CUSTOMER_COOKIE_DOMAIN=""
UPSTASH_REDIS_REST_URL="https://unified-eft-77495.upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."
```

## 2) Configure Shopify Customer Account App

In Shopify admin for your Customer Account OAuth app, add/confirm:

1. Callback URL:
`https://elidia-unpliable-angla.ngrok-free.dev/api/auth/customer/callback`
2. Logout/return URL (if required by the app settings):
`https://elidia-unpliable-angla.ngrok-free.dev/account/login?logout=1`
3. Allowed origins/domains include your ngrok host.

If any URL is missing or mismatched, login will fail or redirect incorrectly.

## 3) Start Tunnel And App

1. Start Next.js app:

```bash
pnpm dev
```

2. In another terminal, start ngrok to port 3000 (if not already active):

```bash
ngrok http 3000
```

3. Open exactly this URL in browser:
`https://elidia-unpliable-angla.ngrok-free.dev`

Do not start from `localhost` for OAuth tests.

## 4) Pass ngrok Warning Once

If ngrok shows an interstitial warning page:

1. Open the ngrok URL manually once.
2. Continue through the warning.
3. Retry auth flow from the ngrok URL.

## 5) Test Matrix

### A) Website-origin login

1. Open `/account/login` on ngrok domain.
2. Click sign in.
3. Complete Shopify auth.
4. Expect landing on `/account` (or safe `return_to` path).

### B) Checkout-origin login

1. Start from flow that sends user to login with `checkout_url`.
2. Complete Shopify auth.
3. Expect redirect to Shopify checkout host (`12d54a-a9.myshopify.com`), not your site host.

### C) Logout and reauth

1. Logout from your site.
2. Immediately try accessing authenticated page.
3. Expect reauthentication required (no silent refresh login).
4. Start login again and confirm you see Shopify login prompt.

## 6) Cookie/Session Verification

In browser devtools on ngrok domain:

1. Confirm `shopify_customer_session_id` exists after login.
2. Confirm large token cookies are absent in Redis mode:
`shopify_customer_access_token`, `shopify_customer_refresh_token`, `shopify_customer_id_token` should not persist.
3. After logout, confirm `shopify_recent_logout` and `shopify_recent_logout_server` are set briefly.

## 7) Useful Debug Endpoint

You can inspect auth cookie/session state with:

`/api/auth/customer/debug`

If debug key is configured, pass `?key=...`.

## 8) Cleanup After Testing

1. Disable ngrok env mode when done:

```bash
pnpm run env:ngrok:off
```

2. Use normal `.env.local` for standard local development.

## Notes

1. Preview deployments are not reliable for your Shopify app if callback domains are not configurable there.
2. Production-domain testing remains the final validation path.
3. Keep `SHOPIFY_SESSION_STORE="redis"` in production once validation succeeds.
