"use client";

import { TemplateSizeKey } from "@/config/print-templates";
import { useCustomizationStorage } from "@/hooks/useCustomizationStorage";
import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { ShopifyProduct } from "@/lib/shopify/transport";
import { AddToCartButton, ProductProvider, useProduct } from "@shopify/hydrogen-react";
import { useMemo, useSyncExternalStore } from "react";
import PrintCustomizer from "../customizer/PrintCustomizer";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductDetails from "./ProductDetails";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

interface ProductViewProps {
  product: ShopifyProduct;
  printSurfaces?: PrintSurface[];
}

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

function ProductViewContent({ product, printSurfaces }: ProductViewProps) {
  const surfaces = printSurfaces ?? [];
  const { selectedVariant } = useProduct();
  const requiresCustomization = surfaces.length > 0;
  const variantId = selectedVariant?.id;
  const templateSizeKey = inferTemplateSizeKey(selectedVariant);
  const storageKey = useMemo(() => {
    const productKey = product.id ?? product.handle ?? "product";
    const variantKey = variantId ?? "novariant";
    return `customization:${productKey}:${variantKey}`;
  }, [product.id, product.handle, variantId]);

  return (
    <section className="dark:bg-primary-700/20 bg-primary-300/40 py-48 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <ProductBreadcrumbs product={product} />
        <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr]">
          <div className="col-span-2 rounded-3xl border border-foreground/10 bg-background p-6 shadow-lg backdrop-blur lg:p-8">
            {requiresCustomization ? (
              <ProductCustomizationSection
                key={storageKey}
                surfaces={surfaces}
                variantId={variantId}
                templateSizeKey={templateSizeKey}
                storageKey={storageKey}
              />
            ) : null}
          </div>
          <div className="lg:col-span-2 lg:row-span-3">
            <ProductGallery />
          </div>

          <div className="lg:row-span-2 lg:row-start-1 lg:col-start-3">
            <ProductInfo printSurfaces={printSurfaces} />
          </div>

          <div className="lg:col-span-1 lg:col-start-3 lg:row-start-3">
            <ProductDetails />
          </div>
        </div>
      </div>
    </section>
  );
}

export type CustomizationState = {
  metadata: PrintCustomizationMetadata;
  attributes: { key: string; value: string }[];
};

function inferTemplateSizeKey(
  variant:
    | {
        selectedOptions?: Array<{ name?: string | null; value?: string | null } | null | undefined>;
      }
    | null
    | undefined
): TemplateSizeKey | null {
  const options = variant?.selectedOptions;
  if (!Array.isArray(options)) return null;

  const sizeOpt = options.find((opt) => {
    const name = opt?.name?.toLowerCase() ?? null;
    return name ? ["size", "größe"].includes(name) : false;
  });
  const value = sizeOpt?.value ?? null;
  if (!value) return null;

  const raw = value.toLowerCase().replace(/\s+/g, "");
  const map: Record<string, TemplateSizeKey> = {
    xs: "xs",
    s: "s",
    m: "m",
    l: "l",
    xl: "xl",
    "2xl": "2xl",
    xxl: "2xl",
  };
  return map[raw] ?? null;
}

function ProductCustomizationSection({
  surfaces,
  variantId,
  templateSizeKey,
  storageKey,
}: {
  surfaces: PrintSurface[];
  variantId?: string;
  templateSizeKey?: string | null;
  storageKey: string;
}) {
  const { customization, customizationMap, initialMap, hasCustomization, handleChange } =
    useCustomizationStorage(storageKey);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const initialForCustomizer = Object.keys(customizationMap).length > 0 ? customizationMap : initialMap;

  if (!isHydrated) return null;

  return (
    <div>
      <PrintCustomizer
        surfaces={surfaces}
        templateSizeKey={templateSizeKey}
        initialCustomizationMap={initialForCustomizer}
        onChangeAction={handleChange}
      />
      <div className="mt-4 flex items-center gap-4" suppressHydrationWarning>
        {variantId ? (
          <AddToCartButton
            variantId={variantId}
            disabled={!hasCustomization}
            attributes={customization?.attributes ?? []}
            className="btn-primary disabled:opacity-60"
          >
            Add to cart with customization
          </AddToCartButton>
        ) : (
          <button
            className="btn-primary disabled:opacity-60"
            disabled
          >
            Variante auswählen
          </button>
        )}
        {!hasCustomization ? (
          <span className="text-xs text-foreground/70">
            Bitte ein Bild hochladen und platzieren, bevor du den Artikel in den Warenkorb legst.
          </span>
        ) : null}
      </div>
    </div>
  );
}
