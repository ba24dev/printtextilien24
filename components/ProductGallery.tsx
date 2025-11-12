"use client";

import { useProduct } from "@shopify/hydrogen-react";
import Image from "next/image";

export default function ProductGallery() {
  const { product } = useProduct();

  const images = product?.images?.nodes || [];
  const primaryImage = images[0] ?? null;

  if (!product || !primaryImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={primaryImage?.url ?? "https://placehold.co/600x600.png"}
          alt={primaryImage.altText ?? product.title ?? "Product image"}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image?.id ?? image?.url}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.altText ?? product.title ?? "Product image"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 33vw"
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
