import { shopifyRequest } from "./client";
import { COLLECTION_BY_HANDLE_QUERY, COLLECTIONS_QUERY } from "./queries/collections";
import { mapCollectionEdge } from "./transformers";
import { CollectionByHandleResult, CollectionsResult } from "./transport";
import { CollectionSummary } from "./types";

/**
 * Fetches a list of Shopify collections along with a limited number of products for each collection.
 *
 * @param collectionsFirst - The maximum number of collections to fetch. Defaults to 10.
 * @param productsFirst - The maximum number of products to fetch per collection. Defaults to 8.
 * @returns A promise that resolves to an array of `CollectionSummary` objects, each representing a collection and its products.
 */
export async function fetchCollectionsWithProducts(
  collectionsFirst: number = 10,
  productsFirst: number = 8
): Promise<CollectionSummary[]> {
  const data = await shopifyRequest<CollectionsResult>({
    query: COLLECTIONS_QUERY,
    variables: { collectionsFirst, productsFirst },
    cache: "force-cache",
  });

  if (!data?.collections) {
    return [];
  }

  return data.collections.edges.map(mapCollectionEdge);
}

/**
 * Fetches a Shopify collection by its handle and returns a summary of the collection.
 *
 * @param handle - The unique handle identifying the collection.
 * @param productsFirst - The number of products to fetch from the collection (default is 8).
 * @returns A promise that resolves to a `CollectionSummary` object if the collection is found, or `null` otherwise.
 */
export async function fetchCollectionByHandle(
  handle: string,
  productsFirst: number = 8
): Promise<CollectionSummary | null> {
  const data = await shopifyRequest<CollectionByHandleResult>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, productsFirst },
    cache: "force-cache",
  });

  if (!data?.collection) return null;

  return mapCollectionEdge({
    node: {
      id: data.collection.id,
      title: data.collection.title,
      handle: data.collection.handle,
      products: data.collection.products,
    },
  });
}
