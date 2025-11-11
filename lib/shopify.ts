import { createStorefrontClient } from "@shopify/hydrogen-react";

const shopifyClient = createStorefrontClient({
    storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL!,
    storefrontApiVersion: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION!,
    publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN!,
});

export default shopifyClient;

export type Product = {
    id: string;
    title: string;
    handle: string;
    priceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };
    featuredImage: {
        url: string;
        altText: string | null;
    } | null;
};

export type Collection = {
    id: string;
    title: string;
    handle: string;
    products: Product[];
};

type ProductEdge = {
    node: Product;
};

type CollectionEdge = {
    node: Collection & { products: { edges: ProductEdge[] } };
};

type CollectionsResponse = {
    collections: {
        edges: CollectionEdge[];
    };
};

export async function fetchCollectionsWithProducts(): Promise<Collection[]> {
    const query = `
        query GetCollections {
            collections(first: 10) {
                edges {
                    node {
                        id
                        title
                        products(first: 5) {
                            edges {
                                node {
                                    id
                                    title
                                    handle
                                    priceRange {
                                        minVariantPrice {
                                            amount
                                            currencyCode
                                        }
                                    }
                                    featuredImage {
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const headers = shopifyClient.getPublicTokenHeaders();
    const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`Error fetching collections: ${response.statusText}`);
    }

    const { data }: { data: CollectionsResponse } = await response.json();
    return data.collections.edges.map((edge) => ({
        ...edge.node,
        products: edge.node.products.edges.map((productEdge) => productEdge.node),
    }));
}
