"use client";

import { copy } from "@/config/copy";
import { useProduct } from "@shopify/hydrogen-react";

function isVariantInStock(variant: {
  quantityAvailable?: number | null;
  availableForSale?: boolean | null;
}): boolean {
  const q = variant.quantityAvailable;
  if (q !== undefined && q !== null) {
    return q > 0;
  }
  return variant.availableForSale ?? true;
}

export default function VariantSelector() {
  const { options, selectedOptions, setSelectedOption, variants } = useProduct();

  if (!options?.length) {
    return null;
  }

  const variantList = Array.isArray(variants) ? variants : [];

  const isValueInStock = (optionName: string, value: string): boolean => {
    const matching = variantList.filter(
      (v): v is NonNullable<typeof v> =>
        v != null &&
        Array.isArray(v.selectedOptions) &&
        v.selectedOptions.some((o) => o?.name === optionName && o?.value === value),
    );
    if (matching.length === 0) return true;
    return matching.some(isVariantInStock);
  };

  return (
    <div className="space-y-6">
      {options.map((option) => {
        const optionName = option?.name;
        const values = option?.values ?? [];

        if (!optionName || !values.length) return null;

        return (
          <div
            key={optionName}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground/70">{optionName}</p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                if (!value) return null;

                const isSelected = selectedOptions?.[optionName] === value;
                const inStock = isValueInStock(optionName, value);

                return (
                  <button
                    key={`${optionName}-${value}`}
                    type="button"
                    disabled={!inStock}
                    aria-disabled={!inStock}
                    aria-label={
                      !inStock
                        ? `${value}: ${copy.product.outOfStockNotice}`
                        : undefined
                    }
                    onClick={() => setSelectedOption(optionName, value)}
                    className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                      isSelected ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
