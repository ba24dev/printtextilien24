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

## Development Plan

The development process is divided into chunks, as outlined in the `docs/Chunks.md` file. Each chunk represents a specific milestone or feature set.

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

Chunk 5 (Cart & Checkout) is now live. The site mounts a cart drawer fed by Hydrogen’s `CartProvider`, supports variant quantity changes and line removal, and links directly to Shopify checkout. Upcoming work moves on to Chunk 6 (Search Stub).

## Contributing

Contributions are welcome! Please follow the chunk-based development plan and ensure all code is well-documented and tested.

## License

This project is licensed under the MIT License.
