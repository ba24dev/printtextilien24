"use client";

import { copy } from "@/config/copy";
import { CollectionSummary } from "@/lib/shopify/types";
import { Dispatch, SetStateAction } from "react";
import { SortKey, SortOption } from "../../lib/catalog/utils";
import InteractionButton from "../ui/InteractionButton";

interface ColletionFiltersProps {
  collections: CollectionSummary[];
  activeCollection: string;
  onCollectionChange: (handle: string) => void;
  sortValue: SortKey;
  onSortChange: Dispatch<SetStateAction<SortKey>>;
  sortOptions: SortOption[];
}

export default function CollectionFilters({
  collections,
  activeCollection,
  onCollectionChange,
  sortValue,
  onSortChange,
  sortOptions,
}: ColletionFiltersProps) {
  return (
    <aside className="space-y-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
        {copy.catalog.collectionsTitle}
      </div>
      <div className="space-y-2 mb-6">
        <InteractionButton
          key={"all"}
          id={"all"}
          handle={"all"}
          label={copy.catalog.allCollectionsLabel}
          activeHandle={activeCollection}
          setActiveAction={onCollectionChange}
        />
        {collections.map((collection) => (
          <InteractionButton
            key={collection.id}
            handle={collection.handle}
            label={collection.title}
            activeHandle={activeCollection}
            setActiveAction={onCollectionChange}
          />
        ))}
      </div>
      <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
        {copy.catalog.sortTitle}
      </div>
      <div className="space-y-2 mb-6">
        {sortOptions.map((option) => (
          <InteractionButton
            key={option.value}
            handle={option.value}
            label={option.label}
            activeHandle={sortValue}
            setActiveAction={(value) => onSortChange(value as SortKey)}
          />
        ))}
      </div>
    </aside>
  );
}
