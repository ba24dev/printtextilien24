"use client";

import { useCallback, useEffect, useRef } from "react";

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
  resetKey?: string;
  onResetRequestAction?: () => void;
};

export function CustomizerSurface({
  surface,
  templateSizeKey,
  initialCustomization,
  onChangeAction,
}: CustomizerSurfaceProps) {
  const placement = usePrintPlacement(
    surface,
    templateSizeKey,
    initialCustomization?.metadata ?? null
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastPayloadRef = useRef<{
    metadata: PrintCustomizationMetadata;
    attributes: { key: string; value: string }[];
  } | null>(null);
  const userInteractedRef = useRef(false);
  const metadataRef = useRef<PrintCustomizationMetadata | null>(null);
  const prevInitRef = useRef<typeof initialCustomization>(initialCustomization);

  useEffect(() => {
    metadataRef.current = placement.metadata;
  }, [placement.metadata]);

  useEffect(() => {
    if (!onChangeAction) return;
    if (placement.isHydrating) return;
    if (!userInteractedRef.current) return;
    const hasCurrentImage = Boolean(placement.metadata.imageDataUrl);
    const hasInitialImage = Boolean(
      initialCustomization?.metadata?.imageDataUrl
    );
    const hasCurrentAttrs = (placement.attributes?.length ?? 0) > 0;
    const hasInitialAttrs = (initialCustomization?.attributes?.length ?? 0) > 0;
    const hasData =
      hasCurrentImage || hasInitialImage || hasCurrentAttrs || hasInitialAttrs;
    if (!hasData) return;
    lastPayloadRef.current = {
      metadata: placement.metadata,
      attributes: placement.attributes,
    };
    console.log("[CustomizerSurface] change queued", surface.name, {
      metadata: placement.metadata,
      attributes: placement.attributes,
    });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (lastPayloadRef.current) onChangeAction(lastPayloadRef.current);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    placement.metadata,
    placement.attributes,
    onChangeAction,
    placement.isHydrating,
    initialCustomization?.metadata?.imageDataUrl,
    initialCustomization?.attributes?.length,
    initialCustomization?.attributes,
    surface.name,
  ]);

  const handleScaleChange = (value: number) => {
    userInteractedRef.current = true;
    placement.onScaleChange(value);
  };

  const handlePositionMm = (x: number, y: number) => {
    userInteractedRef.current = true;
    placement.setPositionMm(x, y);
  };

  const handleFileSelect = (file: File | null) => {
    userInteractedRef.current = true;
    placement.onFileSelect(file);
  };

  const handleAnchor = (key: string) => {
    userInteractedRef.current = true;
    placement.setAnchor(key as any);
  };

  const handleReset = useCallback(() => {
    userInteractedRef.current = false;
    lastPayloadRef.current = null;
    placement.resetPlacement();
    const base = metadataRef.current;
    if (onChangeAction && base) {
      onChangeAction({
        metadata: { ...base, imageDataUrl: null, scale: 1 },
        attributes: [],
      });
    }
  }, [onChangeAction, placement]);

  useEffect(() => {
    const prev = prevInitRef.current;
    // If we have no stored customization for this key/variant, reset the canvas once when it changes
    if (!initialCustomization && prev !== initialCustomization) {
      handleReset();
    }
    prevInitRef.current = initialCustomization;
  }, [initialCustomization, handleReset]);

  return (
    <>
      <CanvasPreview
        surface={surface}
        canvasRef={placement.canvasRef}
        width={placement.canvasW}
        height={placement.canvasH}
        onMouseDown={placement.onMouseDown}
        onMouseMove={placement.onMouseMove}
        onMouseUp={placement.onMouseUp}
        className="rounded bg-white shadow"
      />

      <PlacementControls
        scale={placement.scale}
        maxScale={placement.maxScale}
        metadata={placement.metadata}
        mmPerPx={placement.mmPerPx}
        placedSizeMm={placement.placedSizeMm}
        naturalSizeMm={placement.naturalSizeMm}
        surfaceSizeMm={placement.surfaceSizeMm}
        maxPosMm={placement.maxPosMm}
        minScale={placement.minScale}
        baseScale={placement.baseScale}
        anchor={placement.anchor}
        anchorName={placement.anchor}
        setPositionMm={handlePositionMm}
        onAnchorChange={handleAnchor}
        onScaleChange={handleScaleChange}
        onFileSelect={handleFileSelect}
      />
      <div className="mt-3 text-right">
        <button
          type="button"
          className="rounded border border-foreground/20 px-3 py-1 text-xs text-foreground/70 hover:border-foreground/40 hover:text-foreground"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </>
  );
}
