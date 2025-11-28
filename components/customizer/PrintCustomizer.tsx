"use client";

import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { useState } from "react";
import { CustomizerSurface } from "./CustomizerSurface";
import { SurfaceSelector } from "./SurfaceSelector";

export interface PrintCustomizerProps {
  surfaces: PrintSurface[];
  templateSizeKey?: string | null;
  initialCustomizationMap?: Record<
    string,
    {
      metadata: PrintCustomizationMetadata;
      attributes: { key: string; value: string }[];
    }
  >;
  onChangeAction?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
  resetKey?: string;
}

export default function PrintCustomizer({
  surfaces,
  templateSizeKey,
  initialCustomizationMap = {},
  onChangeAction,
  resetKey,
}: PrintCustomizerProps) {
  const [selected, setSelected] = useState(0);
  const surface = surfaces[selected];

  return (
    <div className="flex flex-col gap-4">
      <SurfaceSelector
        surfaces={surfaces}
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <CustomizerSurface
        key={`${resetKey ?? "reset"}:${surface.name}`}
        surface={surface}
        templateSizeKey={templateSizeKey}
        initialCustomization={initialCustomizationMap[surface.name] ?? null}
        onChangeAction={onChangeAction}
        resetKey={resetKey}
      />
    </div>
  );
}
