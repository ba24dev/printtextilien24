"use client";

import { ShopifyProduct } from "@/lib/shopify/transport";
import { ProductProvider } from "@shopify/hydrogen-react";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductDetails from "./ProductDetails";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

interface ProductViewProps {
  product: ShopifyProduct;
}

export default function ProductView({ product }: ProductViewProps) {
  return (
    <ProductProvider data={product}>
      <section className="dark:bg-primary-700/20 bg-primary-300/40 py-48 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ProductBreadcrumbs product={product} />
          <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr]">
            <div className="lg:col-span-2 lg:row-span-3">
              <ProductGallery />
            </div>

            <div className="lg:row-span-2 lg:row-start-1 lg:col-start-3">
              <ProductInfo />
            </div>

            <div className="lg:col-span-1 lg:col-start-3 lg:row-start-3">
              <ProductDetails />
            </div>
          </div>
        </div>
      </section>
    </ProductProvider>
  );
}
