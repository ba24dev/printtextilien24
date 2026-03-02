# Printshop MVP

This repository contains the source code for the Printshop MVP, a textile printshop built using Next.js 16 and Hydrogen React. The project is designed to be lightweight, modular, and easily extendable.

## Tech Stack

- **Framework**: Next.js 16, React 18, TypeScript
- **Shopify Integration**: Hydrogen React, GraphQL API
- **Database**: Supabase (Postgres)
- **Storage**: Supabase Storage (with future support for R2/S3 via adapter)
- **UI/State Management**: Konva, Zustand/Jotai, React Hook Form
- **Validation**: Zod
- **Search**: Orama
- **Hosting**: Vercel
- **Copy management**: All user-facing strings live in `config/copy.ts` for easy edits

## Development Plan

The development process is divided into chunks, as outlined in the `docs/Chunks.md` file. Each chunk represents a specific milestone or feature set.

## Key Features

- Auto-scrolling homepage carousel sourced from the "Hidden" showcase collection.
- Featured collection spotlight with curated merchandising copy.
- `/products` catalogue with collection filters, deep-linkable selection, and price sorting.
- Product detail page mosaic gallery with structured purchase panel and highlights section.
- Customizer V1 with file upload, anchor presets, drag/resize handles, and a delete control; debug controls gated by `ENABLE_PLACEMENT_DEBUG` and copy pulled from `config/copy.ts`.

> **Note:** personalisation/customization features are currently disabled in
> the UI. Links and form elements have been removed and the feature will be
> re-enabled in a future release.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (preferred) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies (pnpm preferred):
   ```bash
   pnpm install
   # or
   npm install
   ```

### Environment Setup

Copy `.env.example` to `.env.local` and provide your project values:

- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`
- `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN`
- `NEXT_PUBLIC_SHOPIFY_PRIVATE_STOREFRONT_API_TOKEN` (for server routes)
- `NEXT_PUBLIC_SHOPIFY_REVALIDATION_SECRET`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION`
- `NEXT_PUBLIC_SHOPIFY_COUNTRY_ISO_CODE` / `NEXT_PUBLIC_SHOPIFY_LANGUAGE_ISO_CODE`
- `NEXT_PUBLIC_ENABLE_CUSTOMIZATION` (set to `true` to re-enable personalization UI; defaults to `false` for disabled mode)

The customer‑account API credentials are also required for login/refresh endpoints; public (web) clients do **not** include a secret, so `SHOPIFY_CUSTOMER_API_CLIENT_SECRET` may be left blank and the code will fall back to a PKCE‑only flow.

The authorization step builds a URL using a space-separated list of scopes
that is sourced entirely from the `SHOPIFY_CUSTOMER_API_SCOPES` environment
variable. The value you set here will be passed verbatim to Shopify when the
user is redirected, so it must correspond to whatever permissions the
Customer Account API client has been granted in the Shopify admin.

There are two distinct permission models in use by Shopify at the moment:

- **Granular scopes** such as `customer_read_customers` /
  `customer_write_orders` which correspond to the checkboxes under
  _Headless → Kundenkonto‑API → Berechtigungen_. These are used by public
  storefront clients and are the original flow the app was written for.
- The newer **composite GraphQL scope** `customer-account-api:full` (plus
  optional `openid email` for OIDC) which some docs reference. This requires a
  confidential or web client that has that single scope enabled.

The code in this repo accepts either style and will log a warning if you
request an unknown scope.

`SHOPIFY_CUSTOMER_API_SCOPES` may be written with spaces or commas; the app
normalizes the string by converting commas to spaces and removing duplicates.
For example:

```env
SHOPIFY_CUSTOMER_API_SCOPES="customer_read_customers,customer_write_customers customer_read_orders"
# normalized to "customer_read_customers customer_write_customers customer_read_orders"
```

A realistic value using the granular model looks like:

```env
SHOPIFY_CUSTOMER_API_SCOPES="customer_read_customers customer_read_orders \
  customer_read_draft_orders customer_read_store_credit_accounts \
  customer_read_markets customer_read_companies \
  customer_read_subscription_contracts"
```

(or simply `customer-account-api:full` if you’re using the newer GraphQL
client type).

When the login handler runs it prints the full authorization URL to the
terminal; if Shopify rejects the request the logged URL lets you inspect the
exact scopes that were sent and adjust the env variable accordingly.

This architecture keeps all token configuration in environment files; the
example file below demonstrates the shape of the variable along with the rest
of the required secrets.

- `SUPABASE_URL` / `SUPABASE_ANON_KEY`

Tokens should remain in environment files; non-secret storefront metadata can be elevated to a config module later if needed.

### Development

Start the development server:

```bash
pnpm dev
```

Lint the project:

```bash
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Current Milestone

Chunk 10 (Customizer UI V1) is complete with local uploads, anchor presets, drag/resize/delete controls, copy centralization, and debug gating. Next up: Chunk 11 (Upload & Assets) followed by Chunk 12 (Job Storage & Cart Binding).

## Copy & Localization

All UI text is centralized in `config/copy.ts`. Update values there to change labels such as upload instructions, sort options, headers, and helper text without touching component code.

## Contributing

Contributions are welcome! Please follow the chunk-based development plan and ensure all code is well-documented and tested.

## License

This project is licensed under the MIT License.
