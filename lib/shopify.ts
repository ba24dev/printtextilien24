import { GraphQLClient } from 'graphql-request';

const SHOPIFY_API_URL = process.env.NEXT_PUBLIC_API_URL;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

if (!SHOPIFY_API_URL || !SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error('Missing Shopify environment variables');
}

export const shopifyClient = new GraphQLClient(SHOPIFY_API_URL, {
  headers: {
    'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    'Content-Type': 'application/json',
  },
});

export const fetchShopifyData = async <T, V extends Record<string, unknown>>(query: string, variables?: V): Promise<T> => {
    try {
        return await shopifyClient.request<T>(query, variables);
    } catch (error) {
        console.error('Error fetching Shopify data:', error);
        throw new Error('Failed to fetch Shopify data');
    }
};

