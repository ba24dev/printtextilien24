import { shopifyRequest } from "@/lib/shopify/client";
import { NextRequest, NextResponse } from "next/server";

// The Storefront API doesn't support metafields(...) with identifiers in all API
// versions used by storefront clients. Instead request a small set of candidate
// metafields via separate `metafield(namespace:key)` fields and return whichever
// are present.
const PRODUCT_METAFIELDS_QUERY = `#graphql
  query ProductMetafields($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      metafield_print_zone: metafield(namespace: "custom", key: "print") {
        id
        namespace
        key
        type
        value
        reference { ... on Metaobject { id handle } }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle") ?? "";
  if (!handle) {
    return NextResponse.json({ error: "missing handle query param" }, { status: 400 });
  }

  // Only allow debug in non-production or when explicitly enabled.
  const isProd = process.env.NODE_ENV === "production";
  const debugEnabled = process.env.SHOPIFY_DEBUG === "true";
  if (isProd && !debugEnabled) {
    return NextResponse.json({ error: "Debug endpoints disabled in production" }, { status: 404 });
  }

  try {
    // Query the storefront for a small set of candidate metafield aliases.
    const data = await shopifyRequest<Record<string, unknown>>({
      query: PRODUCT_METAFIELDS_QUERY,
      variables: { handle },
      cache: "no-store",
    });

    const product = (data.productByHandle as Record<string, unknown> | undefined) ?? null;
    if (!product) {
      return NextResponse.json({ handle, metafields: null });
    }

    // Return the single metafield alias we requested (keep response shape simple)
    const found: Array<Record<string, unknown>> = [];
    const mf = product["metafield_print_zone"] as Record<string, unknown> | undefined;
    if (mf) found.push({ alias: "metafield_print_zone", ...(mf as Record<string, unknown>) });

    // Extract concise variant matches for quick inspection
    const variantMatches: Array<{
      variantId: string;
      alias: string;
      value?: unknown;
      referenceHandle?: string;
    }> = [];
    const variantEdges =
      ((product["variants"] as Record<string, unknown> | undefined)?.["edges"] as
        | Array<Record<string, unknown>>
        | undefined) ?? [];
    for (const edge of variantEdges) {
      const node = edge?.node as Record<string, unknown> | undefined;
      if (!node) continue;
      const variantId = (node["id"] as string) ?? (node["legacyResourceId"] as string) ?? null;
      const vmf = node["metafield_print_zone"] as Record<string, unknown> | undefined;
      if (vmf) {
        const value = vmf["value"] as unknown;
        const reference = vmf["reference"] as Record<string, unknown> | undefined;
        const referenceHandle = (reference?.["handle"] as string | undefined) ?? undefined;
        variantMatches.push({
          variantId: variantId ?? "",
          alias: "metafield_print_zone",
          value,
          referenceHandle,
        });
      }
    }

    return NextResponse.json({ handle, found, variantMatches, raw: product });
  } catch (err) {
    console.error("[api/debug/product-metafields] failed", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
