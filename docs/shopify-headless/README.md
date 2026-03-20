# Shopify Headless Documentation (Next.js + Storefront API + Customer Account API)

This documentation is a repo-first implementation guide for the `printtextilien24` storefront.

If an external article conflicts with this codebase, follow the code in this repository.

## Audience

This guide is for future maintainers of this project who need concrete, implementation-level steps.

## Reading Order

2. [01-foundation-setup.md](./01-foundation-setup.md)
3. [02-storefront-shop-cart.md](./02-storefront-shop-cart.md)
4. [03-customer-auth-login-logout.md](./03-customer-auth-login-logout.md)
5. [04-customer-account-data.md](./04-customer-account-data.md)
6. [05-checkout-and-edge-cases.md](./05-checkout-and-edge-cases.md)
7. [06-troubleshooting.md](./06-troubleshooting.md)
8. [07-collection-visibility-access-control.md](./07-collection-visibility-access-control.md)

## System Boundaries

- Storefront browsing, product/catalog data, and cart state use Shopify Storefront API via Hydrogen React.
- Customer identity, login, session refresh, and account data use Shopify Customer Account API.
- Checkout is Shopify-hosted and entered through checkout URLs from cart or checkout intent redirects.

## Canonical Repo Anchors

- Storefront provider wiring: `components/layout/ClientProviders.tsx`
- Storefront request client: `lib/shopify/client.ts`
- Customer OAuth routes: `app/api/auth/customer/*`
- Customer GraphQL transport and session handling: `lib/shopify/customer/*`
- Account UI and data endpoints: `app/account/*`, `app/api/customer/*`

## External Sources Reviewed

- Matija: <https://www.buildwithmatija.com/blog/shopify-customer-account-api-headless-authentication>
- Vercel KB (build): <https://vercel.com/kb/guide/building-ecommerce-sites-with-next-js-and-shopify>
- Vercel KB (deploy): <https://vercel.com/kb/guide/deploy-headless-shopify-storefront-with-vercel>
- Bejamas guide: <https://bejamas.com/hub/guides/how-to-build-an-e-commerce-storefront-with-next-js-and-shopify>
- Devin article: <https://devin.no/blog/building-a-scalable-headless-shopify-storefront-with-next-js>
