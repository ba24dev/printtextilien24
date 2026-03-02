"use client";

import { PrintSurface } from "@/lib/customizer/print-config";

import PrintCustomizer from "../customizer/PrintCustomizer";
import { CustomizationState } from "./types";

type Props = {
  surfaces: PrintSurface[];
  templateSizeKey?: string | null;
  customizationMap: Record<string, CustomizationState>;
  initialMap: Record<string, CustomizationState>;
  onChangeAction: (data: CustomizationState) => void;
  storageKey: string;
};

export default function ProductCustomizationSection({
  surfaces,
  templateSizeKey,
  customizationMap,
  initialMap,
  onChangeAction,
  storageKey,
}: Props) {
  const initialForCustomizer =
    Object.keys(customizationMap).length > 0 ? customizationMap : initialMap;

  return (
    <div>
      <PrintCustomizer
        surfaces={surfaces}
        templateSizeKey={templateSizeKey}
        initialCustomizationMap={initialForCustomizer}
        onChangeAction={onChangeAction}
        resetKey={storageKey}
      />
    </div>
  );
}
