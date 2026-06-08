import FeaturedProducts from "@/components/marketing/FeaturedProducts";
import Hero from "@/components/marketing/Hero";
import ProductCarousel from "@/components/marketing/ProductCarousel";
import { isProductVisibleForCustomerByCollections } from "@/lib/catalog/access";
import { fetchCollectionByHandle } from "@/lib/shopify/collection";
import { CollectionSummary } from "@/lib/shopify/types";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { cookies } from "next/headers";

const FEATURED_COLLECTION_HANDLE = "hidden-homepage-featured-items";
const CAROUSEL_COLLECTION_HANDLE = "hidden-homepage-carousel";

function filterHomeCollectionByAccess(
  collection: CollectionSummary | null,
  customerTags: string[]
): CollectionSummary | null {
  if (!collection) return null;

  const visibleProducts = collection.products.filter((product) =>
    isProductVisibleForCustomerByCollections(product.collections, customerTags)
  );

  if (visibleProducts.length === 0) return null;

  return {
    ...collection,
    products: visibleProducts,
  };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const customerTags = await resolveCustomerTagsFromCookieStore(cookieStore);

  const [featuredData, carouselData] = await Promise.all([
    fetchCollectionByHandle(FEATURED_COLLECTION_HANDLE),
    fetchCollectionByHandle(CAROUSEL_COLLECTION_HANDLE),
  ]);

  const featuredCollection = filterHomeCollectionByAccess(featuredData, customerTags);
  const carouselCollection = filterHomeCollectionByAccess(carouselData, customerTags);

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <Hero />
      {featuredCollection ? <FeaturedProducts collection={featuredCollection} /> : null}

      {carouselCollection ? <ProductCarousel collection={carouselCollection} /> : null}
    </main>
  );
}
