"use client";

import { copy } from "@/config/copy";
import { useCatalogViewModel } from "@/hooks/useCatalogViewModel";
import { CollectionSummary } from "@/lib/shopify/types";
import { SORT_OPTIONS } from "../../lib/catalog/utils";
import CollectionFilters from "./CollectionFilters";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  collections: CollectionSummary[];
}

export default function ProductGrid({ collections }: ProductGridProps) {
  const { activeCollection, handleCollectionChange, products, sortValue, setSortValue } =
    useCatalogViewModel(collections);

  return (
    <section className="dark:bg-primary-700/20 bg-primary-300/40 py-48 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 grid-cols-[200px_1fr]">
          <CollectionFilters
            collections={collections}
            activeCollection={activeCollection}
            onCollectionChange={handleCollectionChange}
            sortValue={sortValue}
            onSortChange={setSortValue}
            sortOptions={SORT_OPTIONS}
          />

          <main>
            {products.length === 0 ? (
              <p className="text-sm text-foreground/60">{copy.catalog.noProducts}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
