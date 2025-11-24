import ProductView from "@/components/product/ProductView";
import { fetchProductWithPrintConfig } from "@/lib/shopify/product";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    handle?: string | string[];
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  if (!handle || typeof handle !== "string") {
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
