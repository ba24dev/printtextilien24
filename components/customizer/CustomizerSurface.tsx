"use client";

import { useEffect, useRef } from "react";

import { usePrintPlacement } from "@/hooks/usePrintPlacement";
import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { CanvasPreview } from "./CanvasPreview";
import { PlacementControls } from "./PlacementControls";

type CustomizerSurfaceProps = {
  surface: PrintSurface;
  templateSizeKey?: string | null;
  initialCustomization?: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  } | null;
  onChangeAction?: (data: {
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  }) => void;
};

export function CustomizerSurface({
  surface,
  templateSizeKey,
  initialCustomization,
  onChangeAction,
}: CustomizerSurfaceProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastPayloadRef = useRef<
    { metadata: PrintCustomizationMetadata; attributes: { key: string; value: string }[] } | null
  >(null);
  const {
    canvasRef,
    canvasW,
    canvasH,
    scale,
    maxScale,
    metadata,
    attributes,
    mmPerPx,
    placedSizeMm,
    naturalSizeMm,
    surfaceSizeMm,
    maxPosMm,
    isHydrating,
    setPositionMm,
    onScaleChange,
    onFileSelect,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = usePrintPlacement(surface, templateSizeKey, initialCustomization?.metadata ?? null);

  useEffect(() => {
    if (!onChangeAction) return;
    if (isHydrating) return;
    const hasData =
      (metadata.imageDataUrl ?? initialCustomization?.metadata?.imageDataUrl) ||
      (attributes && attributes.length > 0) ||
      (initialCustomization?.attributes && initialCustomization.attributes.length > 0);
    if (!hasData) return;
    lastPayloadRef.current = { metadata, attributes };
    console.log("[CustomizerSurface] change queued", surface.name, {
      metadata,
      attributes,
    });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (lastPayloadRef.current) onChangeAction(lastPayloadRef.current);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [metadata, attributes, onChangeAction]);

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
        mmPerPx={mmPerPx}
        placedSizeMm={placedSizeMm}
        naturalSizeMm={naturalSizeMm}
        surfaceSizeMm={surfaceSizeMm}
        maxPosMm={maxPosMm}
        setPositionMm={setPositionMm}
        onScaleChange={onScaleChange}
        onFileSelect={onFileSelect}
      />
    </>
  );
}
