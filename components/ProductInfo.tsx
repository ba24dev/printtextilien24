"use client";

import { Money, useProduct } from "@shopify/hydrogen-react";
import { AddToCartButton } from "@shopify/hydrogen-react";
import VariantSelector from "./VariantSelector";

export default function ProductInfo() {
  const { product, selectedVariant } = useProduct();

  if (!product || !selectedVariant) {
    return null;
  }

  const price = selectedVariant.price ?? product.priceRange?.minVariantPrice;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{product.title}</h1>
        <div
          className="prose prose-sm mt-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? "" }}
        />
      </div>

      {price && (
        <div className="text-2xl font-medium">
          <Money data={price} />
        </div>
      )}

      <VariantSelector />

      <AddToCartButton
        variantId={selectedVariant.id}
        disabled={!selectedVariant.availableForSale}
        className="mt-4 inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedVariant.availableForSale ? "Add to Cart" : "Sold Out"}
      </AddToCartButton>
    </div>
  );
}
