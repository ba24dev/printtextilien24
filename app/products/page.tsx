import { copy } from "@/config/copy";
import ProductGrid from "@/components/catalog/ProductGrid";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";
import { Suspense } from "react";

export default async function ProductsPage() {
  const collections = await fetchCollectionsWithProducts(20, 24);
  const visibleCollections = collections.filter(
    (collection) => !collection.handle.startsWith("hidden-")
  );

  return (
    <Suspense fallback={<div className="py-24 text-center">{copy.catalog.loading}</div>}>
      <ProductGrid collections={visibleCollections} />
    </Suspense>
  );
}
