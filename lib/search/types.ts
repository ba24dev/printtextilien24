import { MoneyV2 } from "@shopify/hydrogen-react/storefront-api-types";

export interface SearchResult {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  price?: MoneyV2;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
