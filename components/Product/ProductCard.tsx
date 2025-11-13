import { ProductSummary } from "@/lib/shopify/types";
import { Money } from "@shopify/hydrogen-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.featuredImage;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block space-y-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title ?? "Product image"}
            fill
            loading="eager"
            priority={false}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold text-gray-900">{product.title}</h3>

      <div className="text-sm text-gray-600">
        <Money data={product.priceRange.minVariantPrice} />
      </div>
    </Link>
  );
}
