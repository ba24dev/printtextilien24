# Foundation Setup

This section covers project setup from zero to a working local headless shop with Customer Account OAuth.

## 1) Prerequisites

- Node.js 18+
- pnpm
- Shopify store with:
  - Storefront API access
  - Customer Accounts (new customer accounts) enabled
  - Customer Account API client configured

## 2) Clone and Install

```bash
git clone <repo-url>
cd printtextilien24
pnpm install
```

## 3) Environment Configuration

Copy `.env.example` to `.env.local` and fill all required fields.

```bash
cp .env.example .env.local
```

### Required Storefront Variables

- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`
- `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION`

### Required Customer Account Variables

- `SHOPIFY_CUSTOMER_API_CLIENT_ID`
- `SHOPIFY_CUSTOMER_API_AUTH_URL`
- `SHOPIFY_CUSTOMER_API_TOKEN_URL`
- `NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI`
- `SHOPIFY_CUSTOMER_API_SCOPES`

### Optional But Recommended

- `SHOPIFY_CUSTOMER_API_LOGOUT_URL`
- `SHOPIFY_CUSTOMER_COOKIE_DOMAIN`
- `SHOPIFY_CUSTOMER_AUTH_V2` (defaults to `true`)
- `SHOPIFY_CUSTOMER_DEBUG_KEY`

## 4) Shopify Admin Setup

### Storefront

- Ensure headless storefront channel/access is configured.
- Create/read a Storefront API token for browser-safe cart and storefront operations.

### Customer Account API

- Enable **new customer accounts**.
- Create Customer Account API client.
- Copy OAuth URLs exactly from Shopify admin into env:
  - `SHOPIFY_CUSTOMER_API_AUTH_URL`
  - `SHOPIFY_CUSTOMER_API_TOKEN_URL`
  - optional `SHOPIFY_CUSTOMER_API_LOGOUT_URL`

Important: this repo does **not** derive these URLs from store domain or client ID. Use the full values from admin.

## 5) Redirect URI and Domain Rules

- Set `NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI` to the callback route:
  - `https://<your-domain>/api/auth/customer/callback`
- For local development, use HTTPS tunnel (for example ngrok) and point redirect URI there.
- If you serve both `www` and apex, set `SHOPIFY_CUSTOMER_COOKIE_DOMAIN` (for example `.example.com`).

## 6) Run Locally

```bash
pnpm dev
```

Open `http://localhost:3000` and verify:

1. `/products` loads catalog data.
2. Cart drawer opens and can proceed to checkout URL.
3. `/account/login` starts Customer Account OAuth when appropriate.

## 7) Source Anchors in Repo

- Env schema examples: `.env.example`
- OAuth URL expectations: `lib/shopify/customer/urls.ts`
- OAuth handlers: `app/api/auth/customer/*`
- Provider setup: `components/layout/ClientProviders.tsx`

