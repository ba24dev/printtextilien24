import { SEARCH_PAGE_SIZE } from "@/config/app-config";
import { SearchResult } from "../search/types";
import { shopifyRequest } from "./client";
import { PRODUCT_BY_HANDLE_QUERY, SEARCH_PRODUCTS_QUERY } from "./queries";
import { ProductByHandleResult, ShopifyProduct } from "./transport";
import { MoneyV2 } from "@shopify/hydrogen-react/storefront-api-types";
import { PrintSurface } from "../customizer/print-config";
import { extractPrintSurfacesFromProduct } from "./transformers";

/**
 * Fetches a Shopify product by its handle.
 *
 * @param handle - The unique handle of the product to fetch.
 * @returns A promise that resolves to the Shopify product if found, or `null` if not found.
 *
 * @remarks
 * This function uses the `shopifyRequest` utility to query the Shopify API
 * with the `PRODUCT_BY_HANDLE_QUERY`. The query fetches the product details,
 * including images (up to 10) and variants (up to 50).
 *
 * @example
 * ```typescript
 * const product = await fetchProductByHandle("example-handle");
 * if (product) {
 *   console.log("Product found:", product);
 * } else {
 *   console.log("Product not found.");
 * }
 * ```
 */
export async function fetchProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyRequest<ProductByHandleResult>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle, imagesFirst: 10, variantsFirst: 50 },
    cache: "force-cache",
  });

  return data.productByHandle;
}

/**
 * Represents a product node in a search query.
 *
 * @interface SearchProductsNode
 *
 * @property {string} id - The unique identifier of the product.
 * @property {string} handle - The handle (URL-friendly name) of the product.
 * @property {string} title - The title or name of the product.
 * @property {string | null} vendor - The vendor or brand of the product, or `null` if not available.
 * @property {string[]} tags - A list of tags associated with the product.
 * @property {{ nodes: { title: string }[] }} collections - The collections the product belongs to, represented as an array of objects containing collection titles.
 * @property {{ minVariantPrice: MoneyV2 }} priceRange - The price range of the product, including the minimum variant price.
 * @property {{ url: string | null } | null} featuredImage - The featured image of the product, represented as an object containing the image URL, or `null` if no image is available.
 */
interface SearchProductsNode {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  tags: string[];
  collections: { nodes: { title: string }[] };
  priceRange: { minVariantPrice: MoneyV2 };
  featuredImage: { url: string | null } | null;
}

/**
 * Represents the result of a product search query.
 *
 * @property products - Contains the list of products and pagination information.
 * @property products.edges - An array of edges, where each edge contains a cursor and a product node.
 * @property products.edges[].cursor - A unique identifier for the current edge in the pagination.
 * @property products.edges[].node - The product node containing detailed product information.
 * @property products.pageInfo - Information about the pagination state.
 * @property products.pageInfo.hasNextPage - Indicates whether there are more pages of products to fetch.
 * @property products.pageInfo.endCursor - The cursor pointing to the end of the current page, or `null` if there are no more pages.
 */
interface SearchProductsResult {
  products: {
    edges: { cursor: string; node: SearchProductsNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

/**
 * Fetches all products for search purposes from the Shopify API, up to a specified limit.
 *
 * This function retrieves product data in paginated requests and aggregates the results
 * into a single array of `SearchResult` objects. The function stops fetching more products
 * once the specified limit is reached or there are no more products to fetch.
 *
 * @param limit - The maximum number of products to fetch. Defaults to 500.
 * @returns A promise that resolves to an array of `SearchResult` objects containing product details.
 *
 * @throws Will throw an error if the Shopify API request fails.
 */
export async function fetchAllProductsForSearch(
  limit = 500
): Promise<SearchResult[]> {
  let cursor: string | null = null;
  const products: SearchResult[] = [];

  do {
    const data: SearchProductsResult =
      await shopifyRequest<SearchProductsResult>({
        query: SEARCH_PRODUCTS_QUERY,
        variables: { first: SEARCH_PAGE_SIZE, after: cursor },
        cache: "no-store",
      });

    for (const edge of data.products.edges) {
      const node = edge.node;

      products.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        imageUrl: node.featuredImage?.url ?? null,
        price: node.priceRange.minVariantPrice,
        vendor: node.vendor,
        tags: node.tags,
        collections: node.collections.nodes.map(
          (collectionNode) => collectionNode.title
        ),
      });

      if (products.length >= limit) {
        return products;
      }
    }

    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (cursor);

  return products;
}

/**
 * Represents a product with its associated print configuration.
 *
 * @interface ProductWithPrintConfig
 *
 * @property {ShopifyProduct} product - The Shopify product details.
 * @property {PrintSurface[]} printSurfaces - A list of print surfaces associated with the product.
 */
export interface ProductWithPrintConfig {
  product: ShopifyProduct;
  printSurfaces: PrintSurface[];
}

/**
 * Fetches a product by its handle and enriches it with print configuration details.
 *
 * @param handle - The unique handle of the product to fetch.
 * @returns A promise that resolves to an object containing the product and its print surfaces,
 *          or `null` if the product could not be found.
 */
export async function fetchProductWithPrintConfig(
  handle: string
): Promise<ProductWithPrintConfig | null> {
  const product = await fetchProductByHandle(handle);
  if (!product) return null;

  return {
    product,
    printSurfaces: extractPrintSurfacesFromProduct(product),
  };
}
