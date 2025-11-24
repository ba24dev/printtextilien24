import { fetchProductByHandle, fetchProductWithPrintConfig } from "@/lib/shopify/product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow debug in non-production or when explicitly enabled.
  const isProd = process.env.NODE_ENV === "production";
  const debugEnabled = process.env.SHOPIFY_DEBUG === "true";
  if (isProd && !debugEnabled) {
    return NextResponse.json({ error: "Debug endpoints disabled in production" }, { status: 404 });
  }

  const handle = request.nextUrl.searchParams.get("handle") ?? "";
  if (!handle) {
    return NextResponse.json({ error: "missing handle query param" }, { status: 400 });
  }

  const printConfig = ["1", "true"].includes(
    (request.nextUrl.searchParams.get("printConfig") ?? "").toLowerCase()
  );

  try {
    if (printConfig) {
      const productWithConfig = await fetchProductWithPrintConfig(handle);
      return NextResponse.json({ handle, product: productWithConfig });
    }

    const product = await fetchProductByHandle(handle);
    return NextResponse.json({ handle, product });
  } catch (error) {
    console.error("[api/debug/product] failed", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
