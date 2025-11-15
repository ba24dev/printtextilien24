import { SearchResponse, SearchResult } from "@/lib/search/types";
import { NextRequest, NextResponse } from "next/server";

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "gid://shopify/Product/1",
    handle: "t-shirt-knilch-quadrat",
    title: "T-Shirt Knilch Quadrat",
    imageUrl: "https://placehold.co/160x160.png?text=T-Shirt",
    price: { amount: "16.90", currencyCode: "EUR" },
  },
  {
    id: "gid://shopify/Product/2",
    handle: "knilche-pullover-heather-grey",
    title: "Knilche Pullover Heather Grey",
    imageUrl: "https://placehold.co/160x160.png?text=Pullover",
    price: { amount: "24.90", currencyCode: "EUR" },
  },
  {
    id: "gid://shopify/Product/3",
    handle: "polo-shirt-kinder",
    title: "Polo Shirt Kinder",
    imageUrl: "https://placehold.co/160x160.png?text=Polo",
    price: { amount: "17.50", currencyCode: "EUR" },
  },
];

function filterResults(query: string): SearchResult[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return MOCK_RESULTS.filter((item) => item.title.toLowerCase().includes(lowerQuery));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const results = filterResults(query);
  const payload: SearchResponse = { query, results };

  return NextResponse.json(payload);
}
