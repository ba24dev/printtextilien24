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

The customer‑account API credentials are also required for login/refresh endpoints; public (web) clients do **not** include a secret, so `SHOPIFY_CUSTOMER_API_CLIENT_SECRET` may be left blank and the code will fall back to a PKCE‑only flow.

The OAuth flow asks Shopify for a set of scopes. These must exactly match the
permissions granted to the Headless Customer Account API client in your
Shopify admin (`Headless → Kundenkonto‑API → Berechtigungen`). If you request
anything unapproved you’ll see the “requested scope is invalid” error and the
shopify page will display, preventing the redirect.

You can override the requested scopes via the `SHOPIFY_CUSTOMER_API_SCOPES`
environment variable (defaults to `customer_read_customers
customer_read_orders`). This is useful when debugging or when you change the
app’s allowed permissions.

> **Important:** most public Headless clients don’t surface `openid` or
> `email` in the permissions panel; if you include them and they aren’t
> actually granted, Shopify will return the “requested scope is invalid”
> error and block the redirect. Only list scopes that you have ticked in the
> Shopify admin.
>
> The value may be entered either as a space-separated list or a comma-
> separated list – the application will automatically convert commas to spaces
> and dedupe tokens. For example:
>
> ```env
> SHOPIFY_CUSTOMER_API_SCOPES="customer_read_customers,customer_write_customers customer_read_orders"
> # normalized to "customer_read_customers customer_write_customers customer_read_orders"
> ```
>
> With the current screenshot you shared the value should be:
>
> ```env
> SHOPIFY_CUSTOMER_API_SCOPES="customer_read_customers customer_read_orders customer_read_draft_orders customer_read_store_credit_accounts customer_read_markets customer_read_companies customer_read_subscription_contracts"
> ```
>
> (add more if you enable them later.)

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
