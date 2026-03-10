# Storefront, Shop, and Cart

This section documents how storefront browsing and cart state work in the current repository.

## Architecture

- Client storefront context is provided by `ShopifyProvider` + `CartProvider` in `components/layout/ClientProviders.tsx`.
- Server-side data fetching is centralized in `lib/shopify/client.ts` with `shopifyRequest()`.
- Product and collection data is organized in query modules under `lib/shopify/queries/*`.

## Product and Collection Flow

### Catalog page (`/products`)

- `app/products/page.tsx` fetches collections with products.
- Hidden collections are filtered by handle prefix (`hidden-`).

### Product detail (`/products/[handle]`)

- `app/products/[handle]/page.tsx` resolves handle and fetches product + print configuration.
- `lib/shopify/product.ts` fetches product data and related metaobjects for print surfaces.

## Cart Flow

- Cart UI is drawer-based (`components/cart/*`) and uses Hydrogen cart hooks.
- Checkout button is in `components/cart/CartFooter.tsx`.
- Checkout URL is normalized before redirect and forced to include `logged_in=true`.

## Token Rules for Storefront in This Repo

- Browser/client storefront operations use `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`.
- This avoids unauthorized cart mutations caused by private token misuse in browser cart requests.

## Where This Differs from Generic Guides

- This app is not a stock Next.js Commerce template.
- Storefront code is split by domain modules (client, queries, transformers) instead of one monolithic integration layer.
- Cart and checkout handling is explicitly hardened for headless customer-account login transitions.

## Source Anchors in Repo

- `components/layout/ClientProviders.tsx`
- `lib/shopify/client.ts`
- `lib/shopify/collection.ts`
- `lib/shopify/product.ts`
- `components/cart/CartFooter.tsx`

