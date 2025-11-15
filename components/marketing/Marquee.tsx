"use client";

import { MARQUEE_DUPLICATION_FACTOR, MARQUEE_SCROLL_SPEED } from "@/config/app-config";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { buildMarqueeItems } from "@/lib/catalog/marquee";
import { CollectionSummary } from "@/lib/shopify/types";
import { useMemo, useRef } from "react";
import ProductCard from "../catalog/ProductCard";

interface MarqueeProps {
  collection: CollectionSummary;
}

export default function Marquee({ collection }: MarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => buildMarqueeItems(collection.products, MARQUEE_DUPLICATION_FACTOR),
    [collection.products]
  );

  const { pause, play } = useMarqueeAnimation(trackRef, {
    itemCount: items.length,
    duplicationFactor: MARQUEE_DUPLICATION_FACTOR,
    speedPxPerSecond: MARQUEE_SCROLL_SPEED,
  });

  return (
    <div
      ref={viewportRef}
      className="relative overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocus={pause}
      onBlur={play}
    >
      <div
        ref={trackRef}
        className="flex w-max pb-10 gap-6 will-change-transform"
      >
        {items.map(({ product, key }) => (
          <ProductCard
            key={key}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
