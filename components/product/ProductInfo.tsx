"use client";

import { copy } from "@/config/copy";
import { AddToCartButton, Money, useProduct } from "@shopify/hydrogen-react";
import { ShoppingCart } from "lucide-react";
import VariantSelector from "./VariantSelector";

export default function ProductInfo() {
  const { product, selectedVariant } = useProduct();

  if (!product) return null;

  const price = selectedVariant?.price ?? product.priceRange?.minVariantPrice ?? null;
  const available = selectedVariant?.availableForSale ?? false;

  return (
    <aside className="rounded-3xl border border-foreground/10 bg-background p-6 shadow-lg backdrop-blur lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{product.title}</h1>
          {product.vendor ? (
            <p className="mt-2 text-sm text-foreground/60">
              {copy.product.byLabel} {product.vendor}
            </p>
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
