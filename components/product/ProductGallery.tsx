"use client";

import { copy } from "@/config/copy";
import { useProduct } from "@shopify/hydrogen-react";
import Image from "next/image";

export default function ProductGallery() {
  const { product } = useProduct();
  const images = product?.images?.nodes ?? [];

  const [primary, second, third, fourth] = images;
  const fallback = {
    url: "https://placehold.co/800x1000.png?text=Printtextilien24",
    altText: product?.title ?? "Product image",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
      <GalleryImage
        image={primary ?? fallback}
        className="lg:row-span-2 rounded-3xl"
        priority
      />
      <GalleryImage
        image={second ?? fallback}
        className="aspect-3/2 rounded-3xl max-lg:hidden"
      />
      <GalleryImage
        image={third ?? fallback}
        className="aspect-3/2 rounded-3xl max-lg:hidden"
      />
      <GalleryImage
        image={fourth ?? fallback}
        className="lg:col-span-2 aspect-5/2 rounded-3xl"
      />
    </div>
  );
}

interface GalleryImageProps {
  image: { url?: string | null; altText?: string | null };
  className?: string;
  priority?: boolean;
}

function GalleryImage({ image, className, priority }: GalleryImageProps) {
  if (!image?.url) return null;

  return (
    <div className={`relative overflow-hidden bg-surface/40 ${className ?? ""}`}>
      <Image
        src={image.url}
        alt={image.altText ?? copy.catalog.productFallbackTitle}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition duration-700 ease-out hover:scale-105"
      />
    </div>
  );
}
