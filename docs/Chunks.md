# Project Blueprint - Next.js Printshop MVP

This document outlines the development chunks for the printshop MVP across five phases: setup, Shopify integration, custom features, design/polish, and deferred enhancements.

---

## Phase 1 - Project Setup

### Chunk 1 - Bootstrap & Config

**Goal:** Next 16 + TypeScript running, environment validated.  
**Tasks:** Init Next.js with TS/ESLint/Prettier, create `config.ts` with zod validation, prepare `.env.sample`.  
**Done when:** `npm run dev` starts and config logs missing ENV keys clearly.  
**Status:** Completed.

### Chunk 2 - Base Libraries & Structure

**Goal:** Core modules in place.  
**Tasks:** `lib/shopify.ts`, storage adapter skeleton, `lib/placement.ts` (mm/px utils, safe-zone, DPI check), folder structure under `/app` and `/components`.  
**Done when:** Storefront API call works and upload API endpoint exists.  
**Status:** Completed.

---

## Phase 2 - Shopify Integration (Shopping Experience)

### Chunk 3 - Catalog & Collections

**Goal:** Homepage with categories and highlighted products.  
**Tasks:** Query collections/products, display via `ProductCard`.  
**Done when:** Homepage shows product grid and categories.  
**Status:** Completed.

### Chunk 4 - Product Detail Page (PDP)

**Goal:** Functional PDP with variant selection.  
**Tasks:** `/products/[handle]` route, variant switcher, price, images, add to cart.  
**Done when:** PDP adds correct variant to cart.  
**Status:** Completed (Hydrogen `ProductProvider`, variant selectors, add-to-cart for selected variant).

### Chunk 5 - Cart & Checkout

**Goal:** End-to-end cart.  
**Tasks:** Implement `CartProvider`, drawer/page, quantity update, remove line, checkout button.  
**Done when:** Cart lines render correctly; checkout opens Shopify.  
**Status:** Completed.

### Chunk 6 - Search (Stub)

**Goal:** Basic search field.  
**Tasks:** `/api/search?q=` route (dummy), search input UI, prepare Orama integration.  
**Done when:** Search returns basic results.  
**Status:** Completed (mocked products, debounced header search, PDP links).

---

## Phase 3 - Design & Polish

### Chunk 7 - Theme & Layout

**Goal:** Base styling and layout.  
**Tasks:** Header/footer, grid, spacing, buttons, cart drawer style.  
**Done when:** Consistent layout across desktop and mobile.  
**Status:** Completed (marquee carousel, featured spotlight, filterable catalogue layout, PDP mosaic gallery and purchase panel).

---

## Phase 4 - Immediate Backlog (High Priority)

### Chunk 8 - Search with Orama

**Goal:** Real search integration.  
**Tasks:** Build Orama index from products, `/api/search` endpoint, autocomplete + result list in header.  
**Done when:** Relevant search results return quickly and link to PDPs.  
**Status:** Completed (live Shopify products indexed, streaming results, header autocomplete with images/titles/prices and empty/error states).

### Chunk 9 - PrintConfig Foundations

**Goal:** Provide print surface metadata per variant.  
**Tasks:** Wire Shopify metafields (`is_customizable`, `dimensions`, `position`, `previewImageUrl`) into Storefront API responses, typed loader returning `printSurfaces[]`, validate units and origin.  
**Done when:** Core apparel SKUs return accurate surfaces ready for the customizer.  
**Status:** Completed (metafields exposed, zod-parsed, loader + PDP badge/customizer integration).

### Chunk 10 - Customizer UI (V1)

**Goal:** Let users position artwork on the product mockup before any backend persistence.  
**Tasks:** `/customize/[handle]` with mockup overlay, drag/scale controls or mm inputs, centering presets, DPI warnings, in-browser image loading.  
**Done when:** Users can choose a local file, see it on the mockup, and adjust placement using the PrintConfig metadata.  
**Status:** Completed (local uploads, anchor presets, drag-to-move, resize handles, delete control, copy in `config/copy.ts`, debug controls gated via `ENABLE_PLACEMENT_DEBUG`). Guardrails/persistence are tracked in later chunks.

### Chunk 11 - Upload & Assets (Supabase)

**Goal:** Persist artwork once the customizer UX is stable.  
**Tasks:** `POST /api/upload` with size/MIME checks, persist to Supabase storage, record metadata in `assets`; optional mock adapter for local dev.  
**Done when:** Endpoint returns `{ key, assetId }` and stored files can be reloaded in the customizer.  
**Status:** Pending.

### Chunk 12 - Job Storage & Cart Binding

**Goal:** Persist customizer output and tie it to cart lines.  
**Tasks:** Insert `custom_jobs` records `{ jobId, variantId, surfaceId, assetId, transformJson, targetDpi }`; add cart properties `{ jobId, surfaceId }`.  
**Done when:** Customized cart items reference the saved job payload.  
**Status:** Pending.

### Chunk 13 - Contact Form & Messaging

**Goal:** Provide users with a way to reach support directly from the storefront.
**Tasks:** Build `/contact` page with a name/email/message form; implement `/api/contact` route
that validates input and dispatches email via SMTP (nodemailer); add environment variables,
copy entries and optional eRecht24 integration for automated legal texts; hide the
deprecated mailto page.
**Done when:** Form submits successfully, server returns appropriate status, and notifications appear on screen.
**Status:** In progress (UI + API implemented, tests added).

**Goal:** Add non-custom products directly from grid.  
**Tasks:** Hover/Quick panel for size/color/variant; `addToCart` without PDP; shared cart drawer context so Quick-Add opens the drawer.  
**Status:** Backlog.

### Chunk 14 - Error Handling & Guardrails

**Goal:** User-friendly feedback.  
**Tasks:** Handle upload errors, low DPI, invalid margins, missing selections; add skeletons/loaders.  
**Status:** Deferred.

### Chunk 15 - Order Tracking (No Login)

**Goal:** Track orders without customer accounts.  
**Tasks:** "Track order" page (email + order number + status), link to Shopify order status.  
**Status:** Backlog.

### Chunk 16 - Order Webhook & Mirror

**Goal:** Map orders to jobs.  
**Tasks:** `/api/webhooks/orders/create`, maintain `order_line_map`, admin list for open items.  
**Status:** Backlog (depends on Job Storage).

---

## Notes on Architecture

- Storage: abstracted via adapter (Supabase; R2/S3 later).
  \*- Math: isolated in `placement.ts` for tests and server export.
- MVP targets rectangular surfaces; cylindrical (mugs) in v2.
- No server render yet: 300 DPI exports handled post-order in v2.

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
