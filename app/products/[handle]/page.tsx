import ProductView from "@/components/product/ProductView";
import { fetchProductWithPrintConfig } from "@/lib/shopify/product";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params:
    | {
        handle?: string | string[];
      }
    | Promise<{
        handle?: string | string[];
      }>;
}

function resolveHandle(raw: string | string[] | undefined): string | null {
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string") {
    return raw[0];
  }
  return null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const handle = resolveHandle(resolvedParams?.handle);
  if (!handle) {
    notFound();
  }

  const result = await fetchProductWithPrintConfig(handle);
  if (!result) {
    notFound();
  }

  return (
    <ProductView
      product={result.product}
      printSurfaces={result.printSurfaces}
    />
  );
}
