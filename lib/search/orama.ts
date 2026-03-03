import { INDEX_TTL_MS, SEARCH_LIMIT } from "@/config/app-config";
import { create, insertMultiple, Orama, Results, search } from "@orama/orama";
import { CurrencyCode } from "@shopify/hydrogen-react/storefront-api-types";
import { fetchAllProductsForSearch } from "../shopify/product";
import { SearchResult } from "./types";

const searchProductSchema = {
  id: "string",
  handle: "string",
  title: "string",
  tagsText: "string",
  collectionsText: "string",
  vendorText: "string",
  priceAmount: "number",
  priceCurrency: "string",
  imageUrl: "string",
} as const;

type SearchProductSchema = typeof searchProductSchema;

interface SearchProductDocument {
  id: string;
  handle: string;
  title: string;
  tagsText: string;
  collectionsText: string;
  vendorText: string;
  priceAmount: number;
  priceCurrency: CurrencyCode;
  imageUrl: string | null;
}

let cachedIndex: Orama<SearchProductSchema> | null = null;
let cachedAt = 0;

async function buildIndex(): Promise<Orama<SearchProductSchema>> {
  // `create` is synchronous; no need to await its return value.
  const index = create({
    schema: searchProductSchema,
  });

  const products = await fetchAllProductsForSearch();

  await insertMultiple(
    index,
    products
      .map<SearchProductDocument>((product) => ({
        id: product.id,
        handle: product.handle,
        title: product.title,
        tagsText: (product.tags ?? []).join(" "),
        collectionsText: (product.collections ?? []).join(" "),
        vendorText: product.vendor ?? "",
        priceAmount: Number(product.price?.amount ?? 0),
        priceCurrency: (product.price?.currencyCode ?? "EUR") as CurrencyCode,
        imageUrl: product.imageUrl,
      }))
      // Orama schema treats "string" as non-null, so convert nulls to empty strings when inserting.
      .map((doc) => ({ ...doc, imageUrl: doc.imageUrl ?? "" })),
  );

  cachedIndex = index;
  cachedAt = Date.now();
  return index;
}

async function getIndex(): Promise<Orama<SearchProductSchema>> {
  if (!cachedIndex || Date.now() - cachedAt > INDEX_TTL_MS) {
    return buildIndex();
  }
  return cachedIndex;
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  const index = await getIndex();
  const result: Results<SearchProductDocument> = await search(index, {
    term: trimmedQuery,
    properties: ["title", "handle", "tagsText", "collectionsText", "vendorText"],
    limit: SEARCH_LIMIT,
  });

  return result.hits.map<SearchResult>(({ document }) => ({
    id: document.id,
    handle: document.handle,
    title: document.title,
    imageUrl: document.imageUrl,
    price: {
      amount: document.priceAmount.toFixed(2),
      currencyCode: document.priceCurrency,
    },
  }));
}
