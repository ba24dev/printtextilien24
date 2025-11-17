import { SEARCH_PAGE_SIZE } from "@/config/app-config";
import { SearchResult } from "../search/types";
import { shopifyRequest } from "./client";
import { PRODUCT_BY_HANDLE_QUERY, SEARCH_PRODUCTS_QUERY } from "./queries";
import { ProductByHandleResult, ShopifyProduct } from "./transport";
import { MoneyV2 } from "@shopify/hydrogen-react/storefront-api-types";

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

interface SearchProductsResult {
  products: {
    edges: { cursor: string; node: SearchProductsNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

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
