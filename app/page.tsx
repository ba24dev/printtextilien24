"use client";

import ProductCard from "@/components/ProductCard";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";
import { CollectionSummary } from "@/lib/shopify/types";
import React, { useEffect, useState } from "react";

const HomePage: React.FC = () => {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCollectionsWithProducts();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {collections.map((collection) => (
        <div key={collection.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{collection.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
