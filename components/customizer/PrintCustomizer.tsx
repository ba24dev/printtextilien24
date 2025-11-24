"use client";

import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { useEffect, useState } from "react";
import { CanvasPreview } from "./CanvasPreview";
import { usePrintPlacement } from "../../hooks/usePrintPlacement";
import { PlacementControls } from "./PlacementControls";
import { SurfaceSelector } from "./SurfaceSelector";

interface PrintCustomizerProps {
  surfaces: PrintSurface[];
  templateSizeKey?: string | null;
  onChange?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
}

// Minimal customizer: upload, drag, scale, and AddToCart with attributes.
export default function PrintCustomizer({
  surfaces,
  templateSizeKey,
  onChange,
}: PrintCustomizerProps) {
  return (
    <CustomizerInner
      surfaces={surfaces}
      templateSizeKey={templateSizeKey}
      onChange={onChange}
    />
  );
}

interface CustomizerInnerProps {
  surfaces: PrintSurface[];
  templateSizeKey?: string | null;
  onChange?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
}

function CustomizerInner({ surfaces, templateSizeKey, onChange }: CustomizerInnerProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <CustomizerSurface
        key={selected}
        surface={surfaces[selected]}
        templateSizeKey={templateSizeKey}
        onChange={onChange}
      />

      <SurfaceSelector
        surfaces={surfaces}
        selectedIndex={selected}
        onSelect={setSelected}
      />
    </div>
  );
}

function CustomizerSurface({
  surface,
  templateSizeKey,
  onChange,
}: {
  surface: PrintSurface;
  templateSizeKey?: string | null;
  onChange?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
}) {
  const {
    canvasRef,
    canvasW,
    canvasH,
    scale,
    maxScale,
    metadata,
    attributes,
    onScaleChange,
    onFileSelect,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = usePrintPlacement(surface, templateSizeKey);

  useEffect(() => {
    if (onChange) onChange({ metadata, attributes });
  }, [metadata, attributes, onChange]);

  return (
    <>
      <CanvasPreview
        surface={surface}
        canvasRef={canvasRef}
        width={canvasW}
        height={canvasH}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="rounded bg-white shadow"
      />

      <PlacementControls
        scale={scale}
        maxScale={maxScale}
        metadata={metadata}
        onScaleChange={onScaleChange}
        onFileSelect={onFileSelect}
      />
    </>
  );
}
