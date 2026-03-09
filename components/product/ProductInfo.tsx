"use client";

import { copy } from "@/config/copy";
import { CustomizationState } from "@/hooks/useCustomizationStorage";
import { PrintSurface } from "@/lib/customizer/print-config";
import { AddToCartButton, Money, useProduct } from "@shopify/hydrogen-react";
import { ShoppingCart } from "lucide-react";
import { useSyncExternalStore } from "react";
import VariantSelector from "./VariantSelector";

interface ProductInfoProps {
  printSurfaces?: PrintSurface[];
  requiresCustomization?: boolean;
  customization?: CustomizationState | null;
}

export default function ProductInfo({
  printSurfaces = [],
  requiresCustomization = false,
  customization = null,
}: ProductInfoProps) {
  const { product, selectedVariant } = useProduct();

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!product) return null;

  const enableCustomization =
    process.env.NEXT_PUBLIC_ENABLE_CUSTOMIZATION === "true";
  const hasPrintSurfaces = printSurfaces.length > 0;
  const price =
    selectedVariant?.price ?? product.priceRange?.minVariantPrice ?? null;
  const available = selectedVariant?.availableForSale ?? false;
  const hasCustomization = (customization?.attributes.length ?? 0) > 0;
  const attributes = customization?.attributes ?? [];

  const needsCustomizationBlocker =
    enableCustomization &&
    requiresCustomization &&
    hasPrintSurfaces &&
    (!isHydrated || !hasCustomization);

  return (
    <aside className="site-border-radius border border-foreground/10 bg-background p-6 shadow-lg backdrop-blur lg:p-8">
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
          {enableCustomization && hasPrintSurfaces ? (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
              {copy.product.customizableBadge}
            </span>
          ) : null}
        </div>

        {enableCustomization && hasPrintSurfaces ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground/70">
              {copy.product.printSurfacesTitle}
            </h3>
            <ul className="mt-2 flex gap-3">
              {printSurfaces.map((s, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {s.previewImageUrl ? (
                    // preview is external image url; keep it small
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.previewImageUrl}
                      alt={copy.product.previewAlt(s.name)}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/5 text-xs text-foreground/60">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {s.name}
                    </div>
                    <div className="text-xs text-foreground/60">
                      {Math.round(s.widthPct)}% x {Math.round(s.heightPct)}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {price ? (
          <div className="text-2xl font-semibold text-primary-200">
            <Money data={price} />
          </div>
        ) : null}

        <VariantSelector />

        {selectedVariant ? (
          <AddToCartButton
            variantId={selectedVariant.id}
            disabled={!available || needsCustomizationBlocker}
            attributes={attributes}
            className="group mt-8 btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {!available
              ? copy.product.soldOut
              : needsCustomizationBlocker
                ? copy.product.uploadRequired
                : copy.product.addToCart}
          </AddToCartButton>
        ) : null}
      </div>
    </aside>
  );
}
