import { searchProducts } from "@/lib/search/orama";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  try {
    const results = await searchProducts(query);
    return NextResponse.json({ query, results });
  } catch (error) {
    console.error("[api/search] failed", error);
    return NextResponse.json({ query, results: [] }, { status: 500 });
  }
}
