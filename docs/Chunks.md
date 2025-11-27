# Project Blueprint – Next.js Printshop MVP

This document defines the development chunks for the printshop MVP.  
It follows four main phases: setup → Shopify integration → custom features → design/polish.

---

## Phase 1 – Project Setup

### Chunk 1 – Bootstrap & Config

**Goal:** Next 16 + TypeScript running, environment validated.  
**Tasks:**

- Initialize Next.js project with TS, ESLint, Prettier.
- Create `config.ts` using `zod` to validate ENV variables.
- Prepare `.env.sample`.
  **Done when:** `npm run dev` starts and `config` logs missing ENV keys clearly.

### Chunk 2 – Base Libraries & Structure

**Goal:** Core modules in place.  
**Tasks:**

- `lib/shopify.ts` – Storefront client helper.
- `lib/storage/` – Factory + Supabase adapter.
- `lib/placement.ts` – mm/px utils, safe-zone, DPI check.
- Folder structure `/app`, `/components` ready.  
  **Done when:** Storefront API call works and Upload API endpoint exists.  
  **Status:** ✅ Completed

---

## Phase 2 – Shopify Integration (Shopping Experience)

### Chunk 3 – Catalog & Collections

**Goal:** Homepage with categories and highlighted products.  
**Tasks:** Query collections/products, display via `ProductCard` component.  
**Done when:** Homepage shows product grid and categories.  
**Status:** ✅ Completed

### Chunk 4 – Product Detail Page (PDP)

**Goal:** Functional PDP with variant selection.  
**Tasks:** `/products/[handle]` route, variant switcher, price, images, “Add to Cart.”  
**Done when:** PDP adds correct variant to cart.  
**Status:** ✅ Completed – PDP renders via Hydrogen `ProductProvider`; variant selectors sync with Shopify and add-to-cart mutations target the selected variant.

### Chunk 5 – Cart & Checkout

**Goal:** End-to-end cart.  
**Tasks:** Implement `CartProvider`, drawer/page, quantity update, remove line, checkout button.  
**Done when:** Cart lines render correctly; checkout opens Shopify.  
**Status:** ✅ Completed – Cart drawer lists variants, updates quantities, removes lines, and links to Shopify checkout.

### Chunk 6 – Search (Stub)

**Goal:** Basic search field.  
**Tasks:** `/api/search?q=` route (dummy), search input UI, prepare Orama integration.  
**Done when:** Search returns basic results.  
**Status:** ✅ Completed – `/api/search` serves mocked products, header search debounces queries, and results link to the PDP.

---

## Phase 3 – Design & Polish

### Chunk 7 – Theme & Layout

**Goal:** Base styling and layout.  
**Tasks:** Header/footer, grid, spacing, buttons, cart drawer style.  
**Done when:** Consistent layout across desktop and mobile.  
**Status:** ✅ Completed – Homepage now features the marquee carousel and featured spotlight, `/products` gained the filterable catalogue layout, and the PDP received the mosaic gallery plus polished purchase panel.

---

## Phase 4 – Immediate Backlog (High Priority)

### Chunk 8 – Search with Orama

**Goal:** Real search integration.  
**Tasks:** Build Orama index from products, ship a `/api/search` endpoint that queries it, surface autocomplete + result list in the header search.  
**Done when:** Relevant search results return in <100 ms and link to PDPs.  
**Status:** ✅ Completed – Orama now indexes live Shopify products, `/api/search` streams real results in <100 ms, and the header autocomplete surfaces images, titles, and prices with proper empty/error states.
**Plan:**

- Add `@orama/orama` plus a `lib/search/orama.ts` helper that defines the searchable schema (title, handle, tags, vendor, collections) and memoizes the in-memory index per server process.
- Introduce `fetchAllProductsForSearch()` in `lib/shopify/product.ts` (or a sibling) to page through Shopify products and normalize them into the `SearchResult` shape (id, handle, title, thumbnail, price).
- Update `/api/search` to lazily build the Orama index on first request, refresh it every N minutes, and answer queries with highlighted, relevance-sorted matches under 100 ms.
- Wire the existing `useSearchProducts` + `SearchResults` UI to display the real payload (title, price, featured image) and surface empty/error states consistent with the catalog styling.

### Chunk 9 – PrintConfig Foundations

**Goal:** Provide print surface metadata per variant.  
**Tasks:** Wire Shopify metafields (`is_customizable`, `dimensions`, `position`, `previewImageUrl`) into the Storefront API responses, build a typed loader that returns `printSurfaces[]`, and validate units (mm) plus placement origin.  
**Done when:** Core apparel SKUs return accurate surfaces ready for the customizer.  
**Status:** ✅ Completed – Shopify metafields (`is_customizable`, `dimensions`, `position`, `previewImageUrl`) are exposed in Storefront queries, parsed via zod, and surfaced in the loader and PDP UI. Badge and customizer integration are functional; chunk 10 is underway.
**Plan:**

- Expand product/collection queries so every product exposes the `print_zone` metafields along with the `is_customizable` flag.
- Create `PrintSurface`/`PrintConfig` interfaces (with zod validation) and normalize the raw metafield values into `{ name, isCustomizable, widthMm, heightMm, originMm, previewImageUrl }`.
- Expose helpers such as `fetchPrintConfigByVariantId` so PDP + upcoming customizer chunk read the same data source.
- Add editor documentation describing how to duplicate an existing `print_zone` entry and update dimensions/position in millimeters.

### Chunk 10 – Customizer UI (V1)

**Goal:** Let users position artwork on the product mockup before any backend persistence.  
**Tasks:** Build `/customize/[handle]` with mockup overlay, drag/scale controls or mm inputs, presets for centering, basic DPI warnings, and in-browser image loading so we can iterate without storage dependencies.  
**Done when:** Users can choose a local file, see it on the mockup, and adjust placement using the PrintConfig metadata.  
**Status:** ⏳ Pending – kicks off immediately after PrintConfig foundations so the customizer becomes testable ASAP.

### Chunk 11 – Upload & Assets (Supabase)

**Goal:** Persist artwork once the customizer UX is stable.  
**Tasks:** Implement `POST /api/upload` with size/MIME checks, persist to Supabase storage, and record metadata in the `assets` table; optionally add a mock adapter fallback for local dev.  
**Done when:** Endpoint returns `{ key, assetId }` and stored files can be reloaded in the customizer.  
**Status:** ⏳ Pending – snaps into the existing customizer flow after V1 proves out with local files.

### Chunk 12 – Job Storage & Cart Binding

**Goal:** Persist customizer output and tie it to cart lines.  
**Tasks:** Insert `custom_jobs` records `{ jobId, variantId, surfaceId, assetId, transformJson, targetDpi }` and add cart properties `{ jobId, surfaceId }`.  
**Done when:** Customized cart items reference the saved job payload.  
**Status:** ⏳ Pending – follows immediately after uploads so cart lines can reference stored assets.

---

## Phase 5 – Supporting Enhancements (Deferred)

### Chunk 13 – Instant Add to Cart (Quick-Add)

**Goal:** Add non-custom products directly from grid.  
**Tasks:** Hover/Quick panel for size/color/variant; `addToCart` call without PDP; shared cart drawer context so Quick-Add opens the drawer after mutation.  
**Done when:** Quick-Add puts item into cart correctly.  
**Status:** 📅 Backlog – tackle after customizer milestones.

### Chunk 14 – Error Handling & Guardrails

**Goal:** User-friendly feedback.  
**Tasks:** Handle upload errors, low DPI, invalid margins, missing selections; add skeletons/loaders.  
**Done when:** All critical errors surface clear messages.  
**Status:** 📅 Deferred – revisit once high-priority flows are live.

### Chunk 15 – Order Tracking (No Login)

**Goal:** Track orders without customer accounts.  
**Tasks:** “Track order” page (email + order number → status from mirror); link to Shopify order status.  
**Done when:** Users can view their order status without logging in.  
**Status:** 📅 Backlog – scheduled after cart/custom work.

### Chunk 16 – Order Webhook & Mirror

**Goal:** Map orders to jobs.  
**Tasks:** `/api/webhooks/orders/create`, maintain `order_line_map`, admin list for open items.  
**Done when:** New orders recorded with linked jobId per line item.  
**Status:** 📅 Backlog – depends on Job Storage chunk.

---

## Notes on Architecture

- **Storage:** abstracted via adapter (Supabase → R2/S3 later).
- **Math:** isolated in `placement.ts` for tests and server export.
- **RECT only** in MVP; CYLINDER (mugs) in v2.
- **No server render yet:** 300 DPI exports handled post-order in v2.

---

## Suggested Folder Structure

```
/app
  /(shop)/collections/page.tsx
  /(shop)/products/[handle]/page.tsx
  /(shop)/customize/[handle]/page.tsx
  /api/upload/route.ts
  /api/webhooks/orders/create/route.ts
/lib
  shopify.ts
  placement.ts
  /storage/index.ts
  /storage/supabase-adapter.ts
/components
  ProductCard.tsx
  CartDrawer.tsx
  CustomizerCanvas.tsx
  CustomizerForm.tsx
```
