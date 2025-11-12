import { shopifyRequest } from "./client";
import { COLLECTIONS_QUERY } from "./queries";
import { mapCollectionEdge } from "./transformers";
import { CollectionsResult } from "./transport";
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
