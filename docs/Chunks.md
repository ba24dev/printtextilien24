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

### Chunk 5 – Cart & Checkout
**Goal:** End-to-end cart.  
**Tasks:** Implement `CartProvider`, drawer/page, quantity update, remove line, checkout button.  
**Done when:** Cart lines render correctly; checkout opens Shopify.

### Chunk 6 – Search (Stub)
**Goal:** Basic search field.  
**Tasks:** `/api/search?q=` route (dummy), search input UI, prepare Orama integration.  
**Done when:** Search returns basic results.

---

## Phase 3 – Custom Features

### Chunk 7 – Instant Add to Cart (Quick-Add)
**Goal:** Add non-custom products directly from grid.  
**Tasks:** Hover/Quick panel for size/color/variant; `addToCart` call without PDP.  
**Done when:** Quick-Add puts item into cart correctly.

### Chunk 8 – PrintConfig (RECT surfaces)
**Goal:** Provide print areas per variant.  
**Tasks:** Define Metafield schema (RECT only), `getVariantPrintConfig(variantId)` loader, validation.  
**Done when:** T-shirt and hoodie return valid surfaces in mm with safe-zone.

### Chunk 9 – Upload & Assets (Supabase)
**Goal:** Upload and store image files.  
**Tasks:** `POST /api/upload` (size + MIME checks), `assets` table insert, private bucket.  
**Done when:** Upload returns `{ key, assetId }` and file stored privately.

### Chunk 10 – Customizer UI (V1)
**Goal:** Place artwork on mockup.  
**Tasks:** `/customize/[handle]` route with mockup overlay, drag/scale OR mm fields (top/bottom/left/right), “center” presets, DPI warning.  
**Done when:** User can upload and position image with correct preview.

### Chunk 11 – Job Storage & Cart Binding
**Goal:** Persist placement and link to cart.  
**Tasks:** Insert `custom_jobs` record `{ jobId, variantId, surfaceId, assetId, transformJson, targetDpi }`; add to cart with `line_item.properties = { jobId, surfaceId }`.  
**Done when:** Custom item in cart includes correct jobId reference.

### Chunk 12 – Order Webhook & Mirror
**Goal:** Map orders to jobs.  
**Tasks:** `/api/webhooks/orders/create`, maintain `order_line_map`, admin list for open items.  
**Done when:** New orders recorded with linked jobId per line item.

---

## Phase 4 – Design & Polish

### Chunk 13 – Theme & Layout
**Goal:** Base styling and layout.  
**Tasks:** Header/footer, grid, spacing, buttons, cart drawer style.  
**Done when:** Consistent layout across desktop and mobile.

### Chunk 14 – Error Handling & Guardrails
**Goal:** User-friendly feedback.  
**Tasks:** Handle upload errors, low DPI, invalid margins, missing selections; add skeletons/loaders.  
**Done when:** All critical errors show clear messages.

### Chunk 15 – Search with Orama (Active)
**Goal:** Real search integration.  
**Tasks:** Build Orama index from products, API endpoint, autocomplete UI.  
**Done when:** Relevant search results <100 ms.

### Chunk 16 – Order Tracking (No Login)
**Goal:** Track orders without customer accounts.  
**Tasks:** “Track order” page (email + order number → status from mirror); link to Shopify order status.  
**Done when:** Users can view their order status without logging in.

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
