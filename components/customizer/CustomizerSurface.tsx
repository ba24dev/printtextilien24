"use client";

import { useCallback, useEffect, useRef } from "react";

import { ENABLE_PLACEMENT_DEBUG } from "@/config/app-config";
import { usePrintPlacement } from "@/hooks/usePrintPlacement";
import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { CanvasPreview } from "./CanvasPreview";
import { PlacementDebugControls } from "./PlacementDebugControls";
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
      <div className="grid grid-cols-2 gap-4">
        <CanvasPreview
          surface={surface}
          canvasRef={placement.canvasRef}
          width={placement.canvasW}
          height={placement.canvasH}
          onMouseDown={placement.onMouseDown}
          onMouseMove={placement.onMouseMove}
          onMouseUp={placement.onMouseUp}
          onResizeStart={(corner, x, y) => {
            userInteractedRef.current = true;
            placement.onResizeStart(corner as any, x, y);
          }}
          imageRect={placement.placedRectPx}
          hasImage={Boolean(placement.imageDataUrl)}
          className="items-center justify-self-center col-span-2"
        />
        <PlacementControls
          anchorName={placement.anchor}
          onAnchorChange={handleAnchor}
          onFileSelect={handleFileSelect}
          onReset={handleReset}
        />
        {ENABLE_PLACEMENT_DEBUG ? (
          <div className="mt-2">
            <PlacementDebugControls
              scale={placement.scale}
              maxScale={placement.maxScale}
              minScale={placement.minScale}
              baseScale={placement.baseScale}
              metadata={placement.metadata}
              mmPerPx={placement.mmPerPx}
              placedSizeMm={placement.placedSizeMm}
              naturalSizeMm={placement.naturalSizeMm}
              surfaceSizeMm={placement.surfaceSizeMm}
              maxPosMm={placement.maxPosMm}
              setPositionMm={handlePositionMm}
              onScaleChange={handleScaleChange}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
