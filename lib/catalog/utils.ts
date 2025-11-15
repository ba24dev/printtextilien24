import { ProductSummary } from "@/lib/shopify/types";
import type { ReadonlyURLSearchParams } from "next/navigation";

export type SortKey = "relevance" | "price-asc" | "price-desc";

export interface SortOption {
  label: string;
  value: SortKey;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export function getCollectionHandleFromQuery(
  searchParams: ReadonlyURLSearchParams,
  collectionMap: Map<string, unknown>
) {
  const handle = searchParams.get("collection");
  if (!handle) return "all";
  return collectionMap.has(handle) ? handle : "all";
}

export function dedupeProducts(collections: { products: ProductSummary[] }[]) {
  const map = new Map<string, ProductSummary>();
  collections.forEach((collection) => {
    collection.products.forEach((product) => {
      if (!map.has(product.id)) {
        map.set(product.id, product);
      }
    });
  });
  return Array.from(map.values());
}

export function sortProducts(products: ProductSummary[], sortKey: SortKey) {
  if (sortKey === "price-asc") {
    return [...products].sort((a, b) => getPrice(a) - getPrice(b));
  }

  if (sortKey === "price-desc") {
    return [...products].sort((a, b) => getPrice(b) - getPrice(a));
  }

  return products;
}

export function getPrice(product: ProductSummary): number {
  return parseFloat(product.priceRange.minVariantPrice.amount);
}
