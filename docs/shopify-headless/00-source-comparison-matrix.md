# Source Comparison Matrix

Last reviewed: **March 10, 2026**.

Decision rule used in this project:

- Keep: directly compatible with current codebase.
- Adapt: concept is useful but implementation details differ.
- Ignore: conflicts with current code or omits required behavior for this repo.

## High-Level Matrix

| Source | Scope | Currentness Signals | Decision |
| --- | --- | --- | --- |
| [Matija - Headless Customer Account API](https://www.buildwithmatija.com/blog/shopify-customer-account-api-headless-authentication) | Customer Account OAuth + session | Updated Dec 26, 2025 | **Adapt + Keep** |
| [Vercel KB - Build Ecommerce with Next.js and Shopify](https://vercel.com/kb/guide/building-ecommerce-sites-with-next-js-and-shopify) | Storefront API usage patterns | Updated Feb 17, 2025 | **Adapt** |
| [Vercel KB - Deploy Headless Shopify Storefront with Vercel](https://vercel.com/kb/guide/deploy-headless-shopify-storefront-with-vercel) | Next.js Commerce starter deployment | Updated Feb 26, 2025 | **Adapt** |
| [Bejamas - Build storefront with Next.js + Shopify](https://bejamas.com/hub/guides/how-to-build-an-e-commerce-storefront-with-next-js-and-shopify) | Legacy storefront walkthrough | Updated Jun 18, 2024 | **Adapt + Ignore parts** |
| [Devin - Scalable headless storefront with Next.js](https://devin.no/blog/building-a-scalable-headless-shopify-storefront-with-next-js) | Architecture and scaling tradeoffs | Published Dec 9, 2024 | **Adapt** |

## Detailed Decisions

### 1) Customer Auth and Session

| Topic | External Guidance | Repo Reality | Decision |
| --- | --- | --- | --- |
| PKCE flow | Matija recommends OAuth code + PKCE for Customer Account API | Implemented in `app/api/auth/customer/login/route.ts` and callback route | **Keep** |
| Token storage | Matija uses transient browser storage during flow | Repo stores session tokens in secure httpOnly cookies and chunks large tokens in `lib/shopify/customer/session.ts` | **Adapt** (prefer repo cookie model) |
| OAuth endpoint derivation | Some guides imply deriving endpoints from shop context | Repo requires full copied URLs: `SHOPIFY_CUSTOMER_API_AUTH_URL`, `SHOPIFY_CUSTOMER_API_TOKEN_URL`, optional logout URL | **Keep repo** |
| Authorization header format | Matija highlights Customer API token format nuances | Repo hardens this with `formatAccessToken()` and auth-header retries in `lib/shopify/customer/graphql.ts` | **Keep + extend** |
| Account login route | General docs usually use custom `/login` pages | Repo canonical route is `/account/login` with checkout-aware redirect behavior | **Keep repo** |

### 2) Storefront Data and Cart

| Topic | External Guidance | Repo Reality | Decision |
| --- | --- | --- | --- |
| Storefront GraphQL calls | Vercel/Bejamas/Devin show direct Storefront API querying | Repo uses `lib/shopify/client.ts` wrapper and query modules under `lib/shopify/queries/*` | **Keep** |
| Client cart token | Older guides may blur token roles | Repo client cart uses public Storefront token in `components/layout/ClientProviders.tsx` | **Keep repo** |
| Checkout link handling | Guides generally redirect to checkout URL directly | Repo appends `logged_in=true` in cart and checkout redirect sanitizers | **Keep repo hardening** |
| Template assumptions | Vercel deploy guide is Next.js Commerce starter focused | Repo is custom app structure and not a stock Next.js Commerce template | **Adapt** |

### 3) Account Data and Schema Stability

| Topic | External Guidance | Repo Reality | Decision |
| --- | --- | --- | --- |
| Customer fields | Older examples often reference `customer.email` | Repo uses `emailAddress { emailAddress }` and normalizes to `email` in API responses | **Keep repo schema-safe approach** |
| Query fallback strategy | Usually omitted in generic guides | Repo falls back to compatibility queries in `/api/customer/me` on schema field errors | **Keep repo** |
| Account mutations | Not covered in most linked guides | Repo includes profile and address CRUD endpoints under `app/api/customer/` | **Keep repo** |

### 4) Operations, Domains, and Deployment

| Topic | External Guidance | Repo Reality | Decision |
| --- | --- | --- | --- |
| Canonical host behavior | Deployment docs are usually hostname-agnostic | Repo handles `www`/apex behavior in login/logout flow and cookie domain settings | **Keep repo** |
| Logout flow | External docs often stop at local cookie clear | Repo attempts provider end-session logout and falls back safely when unavailable | **Keep repo** |
| Header bloat from cookie clearing | Not discussed in source guides | Repo includes observed-chunk cleanup to avoid oversized `Set-Cookie` responses | **Keep repo** |
| Debug strategy | Usually absent | Repo has protected debug endpoint `/api/auth/customer/debug` and explicit trace cookie | **Keep repo** |

## Final Rule for Maintainers

When adding or updating behavior, always verify against code and tests first, then use external guides only as supporting context.
