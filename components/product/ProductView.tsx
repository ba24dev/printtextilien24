"use client";

import { ProductProvider } from "@shopify/hydrogen-react";

import ProductViewContent from "./ProductViewContent";
import { ProductViewProps } from "./types";

export default function ProductView({ product, printSurfaces = [] }: ProductViewProps) {
  return (
    <ProductProvider data={product}>
      <ProductViewContent
        key={product.id ?? product.handle ?? "product-view"}
        product={product}
        printSurfaces={printSurfaces}
      />
    </ProductProvider>
  );
}
