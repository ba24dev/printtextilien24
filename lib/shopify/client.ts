import { createStorefrontClient } from "@shopify/hydrogen-react";

// Support both NEXT_PUBLIC_* env names and non-public fallbacks so local envs
// or CI can use either naming convention without editing code.
const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL ?? process.env.SHOPIFY_STOREFRONT_URL;
const STOREFRONT_API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ??
  process.env.SHOPIFY_STOREFRONT_API_VERSION ??
  "2025-10";
const STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN ??
  process.env.SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN;

if (!STOREFRONT_URL || !STOREFRONT_TOKEN) {
  throw new Error(
    "Missing Shopify Storefront configuration. Set NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL and NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN (or SHOPIFY_STOREFRONT_URL / SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN)."
  );
}

const shopifyClient = createStorefrontClient({
  storeDomain: STOREFRONT_URL,
  storefrontApiVersion: STOREFRONT_API_VERSION,
  publicStorefrontToken: STOREFRONT_TOKEN,
});

const SHOPIFY_API_URL = shopifyClient.getStorefrontApiUrl();
const SHOPIFY_HEADERS = {
  "Content-Type": "application/json",
  ...shopifyClient.getPublicTokenHeaders(),
};

type GraphQLRequestOptions = {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
};

export async function shopifyRequest<T>({
  query,
  variables,
  cache = "no-store",
}: GraphQLRequestOptions): Promise<T> {
  const response = await fetch(SHOPIFY_API_URL, {
    method: "POST",
    headers: SHOPIFY_HEADERS,
    body: JSON.stringify({ query, variables }),
    cache,
    next: { revalidate: cache === "no-store" ? 0 : undefined },
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    const errorMessages = payload.errors.map((err: { message: string }) => err.message).join("\n");
    throw new Error(`Shopify GraphQL errors:\n${errorMessages}`);
  }

  return payload.data as T;
}
