import ProductGrid from "@/components/catalog/ProductGrid";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";
import { Suspense } from "react";

export default async function ProductsPage() {
  const collections = await fetchCollectionsWithProducts(20, 24);
  const visibleCollections = collections.filter(
    (collection) => !collection.handle.startsWith("hidden-")
  );

  // ProductGrid is a client component that uses next/navigation hooks
  // (useSearchParams). When rendering from a server component it must be
  // wrapped in a Suspense boundary so the App Router can handle the client
  // transition without prerender errors.
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading products…</div>}>
      <ProductGrid collections={visibleCollections} />
    </Suspense>
  );
}
