# Printshop MVP – Tech Stack

This document lists the technologies and core libraries used for the Next.js Printshop MVP.

---

## Framework & Language
- **Next.js 16** – App Router, React 18, Node runtime.
- **TypeScript** – full typing across backend and frontend.
- **Tailwind v4** - utility-first CSS framework

---

## Shopify Integration
- **@shopify/hydrogen-react** – prebuilt hooks and components for Storefront API, cart, money formatting, Shop Pay button.
- **GraphQL** – Shopify Storefront API queries and mutations.
- **Customer Accounts (Shopify-hosted)** – for login-free order tracking or optional headless authentication later.

---

## Data & Storage
- **Supabase (EU region)** – Postgres database + Storage for MVP.
- **Storage Adapter Layer** – allows future switch to Cloudflare R2 or AWS S3.
- **@aws-sdk/client-s3** – used in R2/S3 adapter implementation.

**Tables:**
- `assets` – stores metadata for uploaded images.
- `custom_jobs` – user print placements and transforms.
- `order_line_map` – links Shopify orders to job IDs.

---

## File Uploads
- **Supabase Storage** (server-side upload via API route).
- Optional future upgrade: **presigned URLs** for R2/S3 direct uploads.
- Validation: PNG/JPG only, max 25–50 MB, DPI check.

---

## Customizer & Placement
- **Konva / react-konva** – canvas for live preview and positioning.
- **zod** – validation for print area schema, transforms, and ENV config.
- **Placement Engine (`lib/placement.ts`)** – conversions (mm ↔ px), DPI checks, safe-zone clamps, and presets.

---

## State & Forms
- **zustand** or **jotai** – lightweight state management for UI.
- **react-hook-form** – controlled inputs for mm distances and presets.

---

## Search
- **@orama/orama** – in-memory full-text search (fast, local).
- Later: optional upgrade to Algolia or Elasticsearch via adapter pattern.

---

## Deployment & Runtime
- **Vercel** – Next.js hosting (Node runtime for server routes).
- **Supabase EU Project** – data storage (GDPR-friendly).
- **Private Buckets & Signed URLs** – no public access to uploads.

---

## Optional / Future
- **Cloudflare R2** – scalable object storage with zero egress fees.
- **Wasabi / Backblaze B2** – alternative low-cost S3-compatible storage.
- **Sharp** – server-side image composition for 300 DPI production exports (phase 2).
- **Sentry / Logflare** – telemetry and error tracking.
- **Worker Queue (BullMQ / Cloudflare Queues)** – async export jobs (phase 2).

---

## Summary

| Layer | Technology |
|--------|-------------|
| Framework | Next.js 16, React 18, TypeScript |
| Shopify | Hydrogen React, GraphQL API |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage → R2/S3 (adapter) |
| UI/State | Konva, Zustand/Jotai, React Hook Form |
| Validation | Zod |
| Search | Orama |
| Hosting | Vercel (Node runtime) |
| Future | Sharp, Cloudflare R2, Worker Queue |

---

**Goal:** keep the MVP lightweight, modular, and easily switchable across providers (storage, search, render).