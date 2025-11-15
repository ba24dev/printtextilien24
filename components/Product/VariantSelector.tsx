"use client";

import { useProduct } from "@shopify/hydrogen-react";

export default function VariantSelector() {
    const { options, selectedOptions, setSelectedOption } = useProduct();

    if (!options?.length) {
        return null;
    }

    return (
        <div className="space-y-6">
            {options.map((option) => {
                const optionName = option?.name;
                const values = option?.values ?? [];

                if (!optionName || !values.length) return null;

                return (
                    <div key={optionName} className="space-y-3">
                        <p className="text-sm font-medium text-foreground/70">{optionName}</p>
                        <div className="flex flex-wrap gap-2">
                            {values.map((value) => {
                                if (!value) return null;

                                const isSelected = selectedOptions?.[optionName] === value;

                                return (
                                    <button
                                        key={`${optionName}-${value}`}
                                        type="button"
                                        onClick={() => setSelectedOption(optionName, value)}
                                        className={`rounded-full border px-4 py-2 text-sm transition ${
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
