"use client";

import { copy } from "@/config/copy";
import { AddToCartButton, Money, useProduct } from "@shopify/hydrogen-react";
import { ShoppingCart } from "lucide-react";
import VariantSelector from "./VariantSelector";
import { PrintSurface } from "@/lib/customizer/print-config";

interface ProductInfoProps {
  printSurfaces?: PrintSurface[];
}

export default function ProductInfo({ printSurfaces = [] }: ProductInfoProps) {
  const { product, selectedVariant } = useProduct();
  if (!product) return null;

  console.log("ProductInfo printSurfaces:", printSurfaces);
  const hasPrintSurfaces = printSurfaces.length > 0;
  const price =
    selectedVariant?.price ?? product.priceRange?.minVariantPrice ?? null;
  const available = selectedVariant?.availableForSale ?? false;

  return (
    <aside className="rounded-3xl border border-foreground/10 bg-background p-6 shadow-lg backdrop-blur lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            {product.title}
          </h1>
          {product.vendor ? (
            <p className="mt-2 text-sm text-foreground/60">
              {copy.product.byLabel} {product.vendor}
            </p>
          ) : null}
          {hasPrintSurfaces ? (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
              Customizable
            </span>
          ) : null}
        </div>

        {price ? (
          <div className="text-2xl font-semibold text-primary-200">
            <Money data={price} />
          </div>
        ) : null}

        <VariantSelector />

        {selectedVariant ? (
          <AddToCartButton
            variantId={selectedVariant.id}
            disabled={!available}
            className="group mt-8 btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {available ? copy.product.addToCart : copy.product.soldOut}
          </AddToCartButton>
        ) : null}
      </div>
    </aside>
  );
}
