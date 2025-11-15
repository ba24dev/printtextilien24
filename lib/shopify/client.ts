import { createStorefrontClient } from "@shopify/hydrogen-react";

const shopifyClient = createStorefrontClient({
    storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL!,
    storefrontApiVersion: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION!,
    publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN!,
});

const SHOPIFY_API_URL = shopifyClient.getStorefrontApiUrl();
const SHOPIFY_HEADERS = {
    "Content-Type": "application/json",
    ...shopifyClient.getPublicTokenHeaders(),
}

type GraphQLRequestOptions = {
    query: string;
    variables?: Record<string, unknown>;
    cache?: RequestCache;
}

export async function shopifyRequest<T>({ query, variables, cache = 'no-store' }: GraphQLRequestOptions): Promise<T> {
    const response = await fetch(SHOPIFY_API_URL, {
        method: "POST",
        headers: SHOPIFY_HEADERS,
        body: JSON.stringify({ query, variables }),
        cache,
        next: { revalidate: cache === 'no-store' ? 0 : undefined },
    });

    if (!response.ok) {
     throw new Error(`Shopify request failed: ${response.status} ${response.statusText}`);
  }

    const payload = await response.json();

    if (payload.errors?.length) {
        const errorMessages = payload.errors.map((err: { message: string }) => err.message).join('\n');
        throw new Error(`Shopify GraphQL errors:\n${errorMessages}`);
    }

    return payload.data as T;
}