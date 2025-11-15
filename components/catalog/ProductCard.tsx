import { ProductSummary } from "@/lib/shopify/types";
import { Money } from "@shopify/hydrogen-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
    product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group shrink-0 overflow-hidden rounded-3xl border border-primary-900/30 bg-primary-700 shadow-lg backdrop-blur transition hover:border-primary-500/60"
        >
            <div className="relative h-48 w-full bg-primary-900/20">
                {product.featuredImage?.url ? (
                    <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText ?? product.title}
                        fill
                        sizes="16rem"
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <Image
                        src="https://placehold.co/256x192.png?text=Printshop"
                        alt={product.title}
                        fill
                        sizes="16rem"
                        className="object-cover"
                    />
                )}
            </div>
            <div className="flex flex-col gap-2 p-4">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</h3>
                <p className="text-xs text-foreground/60 line-clamp-2">
                    {product.description ?? "Premium blank ready for your artwork."}
                </p>
                <div className="mt-3 text-sm font-semibold text-foreground">
                    <Money data={product.priceRange.minVariantPrice} />
                </div>
            </div>
        </Link>
    );
}
