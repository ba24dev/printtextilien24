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
    { metadata: PrintCustomizationMetadata; attributes: { key: string; value: string }[] }
  >;
  onChangeAction?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
}

export default function PrintCustomizer({
  surfaces,
  templateSizeKey,
  initialCustomizationMap = {},
  onChangeAction,
}: PrintCustomizerProps) {
  const [selected, setSelected] = useState(0);
  const surface = surfaces[selected];

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <CustomizerSurface
        key={surface.name}
        surface={surface}
        templateSizeKey={templateSizeKey}
        initialCustomization={initialCustomizationMap[surface.name] ?? null}
        onChangeAction={onChangeAction}
      />

      <SurfaceSelector
        surfaces={surfaces}
        selectedIndex={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
