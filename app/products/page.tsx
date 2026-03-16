import { copy } from "@/config/copy";
import ProductGrid from "@/components/catalog/ProductGrid";
import { filterCollectionsByCustomerTags } from "@/lib/catalog/access";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const customerTags = await resolveCustomerTagsFromCookieStore(cookieStore);
  const collections = await fetchCollectionsWithProducts(20, 24);
  const visibleCollections = filterCollectionsByCustomerTags(collections, customerTags);

  return (
    <Suspense fallback={<div className="py-24 text-center">{copy.catalog.loading}</div>}>
      <ProductGrid collections={visibleCollections} />
    </Suspense>
  );
}
