import { shopifyRequest } from "./client";
import { COLLECTION_BY_HANDLE_QUERY, COLLECTIONS_QUERY } from "./queries";
import { mapCollectionEdge } from "./transformers";
import { CollectionByHandleResult, CollectionsResult } from "./transport";
import { CollectionSummary } from "./types";

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
