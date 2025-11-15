"use client";

import FeaturedProducts from "@/components/marketing/FeaturedProducts";
import Hero from "@/components/marketing/Hero";
import ProductCarousel from "@/components/marketing/ProductCarousel";
import { fetchCollectionByHandle } from "@/lib/shopify/collection";
import { CollectionSummary } from "@/lib/shopify/types";
import { useEffect, useState } from "react";

const FEATURED_COLLECTION_HANDLE = "hidden-homepage-featured-items";
const CAROUSEL_COLLECTION_HANDLE = "hidden-homepage-carousel";

export default function HomePage() {
  const [featuredCollection, setFeaturedCollection] = useState<CollectionSummary | null>(null);
  const [carouselCollection, setCarouselCollection] = useState<CollectionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredData, carouselData] = await Promise.all([
          fetchCollectionByHandle(FEATURED_COLLECTION_HANDLE),
          fetchCollectionByHandle(CAROUSEL_COLLECTION_HANDLE),
        ]);

        setFeaturedCollection(featuredData);
        setCarouselCollection(carouselData);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="px-6 py-12 text-sm text-foreground/70">Loading homepage…</div>;
  }

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <Hero />
      {featuredCollection ? <FeaturedProducts collection={featuredCollection} /> : null}

      {carouselCollection ? <ProductCarousel collection={carouselCollection} /> : null}
    </main>
  );
}
