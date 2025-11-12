"use client";

import { useProduct } from "@shopify/hydrogen-react";

export default function VariantSelector() {
  const { options, selectedOptions, setSelectedOption } = useProduct();

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option) => {
        if (!option?.name || !option.values || option.values.length === 0) {
          return null;
        }

        const optionName = option.name;

        return (
          <div key={optionName} className="space-y-2">
            <p className="text-sm.font-medium text-gray-700">{optionName}</p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions?.[optionName] === value;

                return (
                  <button
                    key={`${optionName}-${value}`}
                    type="button"
                    onClick={() => setSelectedOption(optionName, value)}
                    className={`rounded border px-3 py-2 text-sm transition ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-black"
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
