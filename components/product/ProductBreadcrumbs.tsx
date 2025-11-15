"use client";

import { copy } from "@/config/copy";
import { ShopifyProduct } from "@/lib/shopify/transport";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductBreadcrumbsProps {
  product: ShopifyProduct;
}

export default function ProductBreadcrumbs({ product }: ProductBreadcrumbsProps) {
  const collections =
    product.collections?.nodes?.filter((node) => node && !node.handle?.startsWith("hidden")) ?? [];

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs text-foreground/60"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/products"
            className="font-medium transition hover:text-primary-200"
          >
            {copy.header.nav[1].label}
          </Link>
        </li>

        {collections.map((collection) => (
          <li
            key={collection.id}
            className="flex items-center gap-2"
          >
            <ChevronRight className="h-3 w-3 text-foreground/30" />
            <Link
              href={`/products?collection=${encodeURIComponent(collection.handle ?? "")}`}
              className="font-medium transition hover:text-primary-200"
            >
              {collection.title}
            </Link>
          </li>
        ))}

        <li className="flex items-center gap-2 text-foreground/80">
          <ChevronRight className="h-3 w-3 text-foreground/30" />
          <span>{product.title}</span>
        </li>
      </ol>
    </nav>
  );
}
