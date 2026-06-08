# Collection Visibility Access Control (Customer Tags -> Collection Titles)

This chapter documents how collection access works in this repository and what must remain true over time.

## Why This Exists

Shopify exposes product collections, but customer objects do not have collection membership.

In this project, access is derived as follows:

- customer `tags` are used as permission labels,
- collection `title` values are used as access labels,
- a product is visible if any of its collection titles is allowed for the current customer,
- `Allgemein` is always public.

## Business Rules (Canonical)

1. `Allgemein` is always visible, even when not logged in.
2. Any other collection is visible only when a customer tag matches the collection title.
3. Matching is normalized (case-insensitive, punctuation/whitespace-insensitive, accent-insensitive).
4. Search must return empty results for inaccessible products, never a 404.
5. Collection routes should show a friendly access message when restricted, not a hard 404.

## Normalization Logic

Location: `lib/catalog/access.ts`

Normalization (`normalizeAccessToken`) applies:

- Unicode normalization (`NFKD`)
- remove combining marks
- lowercase
- remove non-alphanumeric chars

Examples:

- `"TSV"` -> `"tsv"`
- `"Fire fighter"` -> `"firefighter"`
- `"Allgemein"` -> `"allgemein"`

Core helpers:

- `isCollectionTitleAllowedForCustomer(...)`
- `filterCollectionsByCustomerTags(...)`
- `isProductVisibleForCustomerByCollections(...)`

## Data Flow

### 1. Resolve customer tags from cookies/session

Location: `lib/shopify/customer/access.ts`

Flow:

1. Read access/refresh cookies.
2. Validate/refresh session (`validateCustomerSession`).
3. Fetch tags with `fetchCustomerTags(accessToken)`.
4. On any failure, return `[]` (safe default: public-only access).

### 2. Apply access in UI/API surfaces

- Products listing: `app/products/page.tsx`
  - fetch collections + products
  - filter collections via `filterCollectionsByCustomerTags`

- Product detail breadcrumbs: `app/products/[handle]/page.tsx`
  - keep product page reachable
  - remove inaccessible collection breadcrumbs

- Search API: `app/api/search/route.ts`
  - filter search results via `isProductVisibleForCustomerByCollections`
  - inaccessible items simply disappear from results

- Homepage sections: `app/page.tsx`
  - featured/carousel collections are product-filtered
  - entire section is hidden when no visible products remain

- Footer links: `components/layout/footer/Footer.tsx`
  - `/collections/*` links are filtered by access

- Collection routes:
  - `app/collections/page.tsx`
  - `app/collections/[handle]/page.tsx`
  - restricted access shows a friendly permission message

## Collection Route Behavior

### `/collections`

- Shows visible collections only.
- If none are visible, shows explanatory message + login CTA.

### `/collections/[handle]`

- If handle does not exist: `notFound()`.
- If handle exists but user lacks access: show friendly "permission required" message.
- If access is allowed: render visible products for that collection.

## Required Shopify Permissions and Scopes

### Customer tag reads

Code path uses `customer { tags }` in `CUSTOMER_TAGS_QUERY`:

- `lib/shopify/customer/queries.ts`
- `lib/shopify/customer/session.ts` (`fetchCustomerTags`)

Practical requirement: your Customer Account API client must be allowed to read customer tags.

Notes for maintainers:

- Shopify docs are inconsistent across APIs and versions.
- In some docs this appears as `unauthenticated_read_customer_tags`.
- In this repo, auth scopes are configured through `SHOPIFY_CUSTOMER_API_SCOPES`.
- Ensure your configured scope set in Shopify Admin grants tag-read capability for the `customer.tags` query used here.

### Scope configuration entry point

- Env var: `SHOPIFY_CUSTOMER_API_SCOPES`
- Used by login route to request scopes from Shopify.

Do not hardcode scopes in source. Keep scope policy in environment and Shopify admin.

## Environment Variables (Relevant)

- `SHOPIFY_CUSTOMER_API_CLIENT_ID`
- `SHOPIFY_CUSTOMER_API_AUTH_URL`
- `SHOPIFY_CUSTOMER_API_TOKEN_URL`
- `SHOPIFY_CUSTOMER_API_LOGOUT_URL`
- `SHOPIFY_CUSTOMER_API_SCOPES`
- `NEXT_PUBLIC_SHOPIFY_CUSTOMER_REDIRECT_URI`
- `SHOPIFY_CUSTOMER_AUTH_V2`
- `SHOPIFY_CUSTOMER_COOKIE_DOMAIN`

Storefront vars still required for catalog/product queries:

- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`
- `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION`

## Failure Modes and Fallback Behavior

1. Tag fetch fails -> treat as `[]` tags -> only `Allgemein` remains visible.
2. Customer session invalid -> treated as anonymous.
3. Restricted collection URL requested -> show friendly permission message (not 404).
4. Search query includes restricted items -> empty/filtered result set only.

## QA Checklist (Manual)

1. Anonymous user:
   - sees `Allgemein` products
   - does not see restricted footer collection links
   - `/collections/restricted` shows permission message

2. Customer with matching tag (example `TSV`):
   - sees `TSV` collection and products in `/products`, `/collections`, homepage blocks
   - sees footer link for `/collections/tsv`

3. Customer without matching tag:
   - cannot see `TSV` collections/products
   - search for TSV returns no matching restricted products

## Maintainer Handover Notes

If this logic is changed, update these files together:

- `lib/catalog/access.ts`
- `lib/shopify/customer/access.ts`
- `app/products/page.tsx`
- `app/api/search/route.ts`
- `app/page.tsx`
- `components/layout/footer/Footer.tsx`
- `app/collections/page.tsx`
- `app/collections/[handle]/page.tsx`

Keep these invariants:

1. `Allgemein` stays public.
2. Access checks remain normalized (no raw string compare only).
3. Search hides restricted products silently.
4. Restricted collection routes do not expose hard technical errors to users.
