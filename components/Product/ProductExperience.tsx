"use client";

import { ProductProvider } from "@shopify/hydrogen-react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import { ShopifyProduct } from "@/lib/shopify/transport";
import { normaliseProduct } from "@/lib/shopify/transformers";

interface ProductExperienceProps {
  product: ShopifyProduct;
}

export default function ProductExperience({ product }: ProductExperienceProps) {
  const sanitizedProduct = normaliseProduct(product);
  return (
    <ProductProvider data={sanitizedProduct}>
      <div className="container mx-auto grid gap-12 py-12 md:grid-cols-2">
        <ProductGallery />
        <ProductInfo />
      </div>
    </ProductProvider>
  );
}
