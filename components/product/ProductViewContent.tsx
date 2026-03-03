"use client";

import { TemplateSizeKey } from "@/config/print-templates";
import { useCustomizationStorage } from "@/hooks/useCustomizationStorage";
import { useProduct } from "@shopify/hydrogen-react";
import { useMemo, useSyncExternalStore } from "react";

import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductCustomizationSection from "./ProductCustomizationSection";
import ProductDetails from "./ProductDetails";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import { ProductViewProps } from "./types";

export default function ProductViewContent({
  product,
  printSurfaces,
}: ProductViewProps) {
  const surfaces = printSurfaces ?? [];
  const { selectedVariant } = useProduct();
  const enableCustomization =
    process.env.NEXT_PUBLIC_ENABLE_CUSTOMIZATION === "true";
  const isClient = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
  const requiresCustomization = enableCustomization && surfaces.length > 0;
  const variantId = selectedVariant?.id;
  const templateSizeKey = inferTemplateSizeKey(selectedVariant);
  const storageKey = useMemo(() => {
    const productKey = product.id ?? product.handle ?? "product";
    const variantKey = variantId ?? "novariant";
    return `customization:${productKey}:${variantKey}`;
  }, [product.id, product.handle, variantId]);
  const { customization, customizationMap, initialMap, handleChange } =
    useCustomizationStorage(storageKey);

  return (
    <section className="dark:bg-primary-700/20 bg-primary-300/40 py-48 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <ProductBreadcrumbs product={product} />
        <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr]">
          {requiresCustomization && isClient ? (
            <div className="col-span-2 rounded-3xl border border-foreground/10 bg-background p-6 shadow-lg backdrop-blur lg:p-8">
              <ProductCustomizationSection
                key={storageKey}
                surfaces={surfaces}
                templateSizeKey={templateSizeKey}
                customizationMap={customizationMap}
                initialMap={initialMap}
                onChangeAction={handleChange}
                storageKey={storageKey}
              />
            </div>
          ) : null}
          <div className="lg:col-span-2 lg:row-span-3">
            <ProductGallery />
          </div>

          <div className="lg:row-span-2 lg:row-start-1 lg:col-start-3">
            <ProductInfo
              printSurfaces={printSurfaces}
              requiresCustomization={requiresCustomization}
              customization={customization}
            />
          </div>

          <div className="lg:col-span-1 lg:col-start-3 lg:row-start-3">
            <ProductDetails />
          </div>
        </div>
      </div>
    </section>
  );
}

function inferTemplateSizeKey(
  variant:
    | {
      selectedOptions?: Array<
        { name?: string | null; value?: string | null } | null | undefined
      >;
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
