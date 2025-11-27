import { useCallback, useMemo, useRef, useState } from "react";

import { PRINT_CONFIG } from "@/config/app-config";
import { TemplateSizeKey } from "@/config/print-templates";
import { PrintSurface } from "@/lib/customizer/print-config";
import {
  PrintCustomizationMetadata,
  buildPrintCustomizationAttributes,
  buildPrintCustomizationMetadata,
} from "@/lib/customizer/print-metadata";
import {
  Position,
  resolveMmPerPx,
  resolveSurfaceRect,
  resolveTemplateSize,
} from "@/utils/placement-utils";
import { computePlacedSizeMm, computeScales, clampPosition } from "@/utils/placement-scaling";
import { trimTransparentPixels } from "@/utils/image-trim";
import { isBitmapUploadValid } from "@/utils/print-validation";
import { useCanvasRenderer } from "./useCanvasRenderer";
import { usePlacementHydration } from "./usePlacementHydration";

export function usePrintPlacement(
  surface: PrintSurface,
  templateSizeKey?: TemplateSizeKey | string | null,
  initialMetadata?: PrintCustomizationMetadata | null
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isVector, setIsVector] = useState(false);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const imgStart = useRef<Position | null>(null);
  const { minPhysicalSizeMm } = PRINT_CONFIG;

  // Error state for upload/validation
  const [error, setError] = useState<string | null>(null);

  const { templateSize, canvasW, canvasH } = useMemo(
    () => resolveTemplateSize(surface),
    [surface]
  );
  const surfaceRect = useMemo(
    () => resolveSurfaceRect(surface, canvasW, canvasH),
    [surface, canvasW, canvasH]
  );

  const [pos, setPos] = useState<Position>(() => ({
    x: surfaceRect.x,
    y: surfaceRect.y,
  }));

  const mmPerPx = useMemo(
    () => resolveMmPerPx(surface, templateSize, templateSizeKey),
    [surface, templateSize, templateSizeKey]
  );

  const { naturalSizeMm, baseScale, minScale, maxScale } = useMemo(
    () =>
      computeScales({
        imageSize,
        mmPerPx,
        surfaceRect,
        isVector,
      }),
    [imageSize, isVector, mmPerPx, surfaceRect]
  );

  const placedSizePx = useMemo(() => {
    if (!imageSize) return null;
    return { width: imageSize.width * scale, height: imageSize.height * scale };
  }, [imageSize, scale]);

  const placedSizeMm = useMemo(
    () =>
      computePlacedSizeMm({
        naturalSizeMm,
        baseScale,
        mmPerPx,
        placedSizePx,
        scale,
      }),
    [baseScale, mmPerPx, naturalSizeMm, placedSizePx, scale]
  );

  const surfaceSizeMm =
    mmPerPx && surfaceRect.width > 0 && surfaceRect.height > 0
      ? {
          width: surfaceRect.width * mmPerPx.x,
          height: surfaceRect.height * mmPerPx.y,
        }
      : null;

  const maxPosMm =
    mmPerPx && placedSizePx
      ? {
          x: (surfaceRect.width - placedSizePx.width) * mmPerPx.x,
          y: (surfaceRect.height - placedSizePx.height) * mmPerPx.y,
        }
      : null;

  const resetPlacement = useCallback(() => {
    setImageDataUrl(null);
    setImageSize(null);
    setScale(1);
    setPos({ x: surfaceRect.x, y: surfaceRect.y });
    imgRef.current = null;
  }, [surfaceRect.x, surfaceRect.y]);

  useCanvasRenderer({
    canvasRef,
    imgRef,
    bgRef,
    surface,
    surfaceRect,
    canvasW,
    canvasH,
    imageDataUrl,
    pos,
    scale,
  });

  const { isHydrating, isHydrated } = usePlacementHydration({
    initialMetadata,
    surfaceRect,
    mmPerPx,
    setScale,
    setPos,
    setImageDataUrl,
    setImageSize,
    imgRef,
  });

  function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    const isSvg = file.type === "image/svg+xml";
    setIsVector(isSvg);
    if (!isSvg && !file.type.startsWith("image/")) {
      setError("Unsupported file type. Only PNG, JPG, SVG allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setImageDataUrl(url);
      const img = new Image();
      img.onload = () => {
        let finalImg = img;
        let finalSize = { width: img.width, height: img.height };
        if (isSvg) {
          const trimmed = trimTransparentPixels(img);
          finalImg = trimmed.image;
          finalSize = { width: trimmed.width, height: trimmed.height };
        }
        imgRef.current = finalImg;
        setImageSize({ width: finalSize.width, height: finalSize.height });
        if (!isSvg && !isBitmapUploadValid(img.width, img.height)) {
          setError(
            "Image too small. At configured DPI it would be smaller than minimum print size."
          );
          return;
        }
        const fitScale = Math.min(surfaceRect.width / finalSize.width, surfaceRect.height / finalSize.height);
        const minScaleForImage =
          mmPerPx && finalSize.width > 0 && finalSize.height > 0
            ? Math.max(
                minPhysicalSizeMm / (finalSize.width * mmPerPx.x),
                minPhysicalSizeMm / (finalSize.height * mmPerPx.y)
              )
            : 0;
        const localBase = computeScales({
          imageSize: finalSize,
          mmPerPx,
          surfaceRect,
          isVector: isSvg,
        }).baseScale;
        // For SVGs, treat natural size as surface-fit; for bitmaps, use DPI-based preferred scale.
        const preferredScale = isSvg ? fitScale : localBase ?? fitScale;
        const maxAllowedScale = isSvg
          ? fitScale
          : localBase
          ? Math.min(fitScale, localBase)
          : fitScale;
        const initialScale = Math.min(
          Math.max(preferredScale, minScaleForImage || 0),
          maxAllowedScale || preferredScale
        );
        setScale(initialScale);
        const startX =
          surfaceRect.x + (surfaceRect.width - finalSize.width * initialScale) / 2;
        const startY =
          surfaceRect.y + (surfaceRect.height - finalSize.height * initialScale) / 2;
        setPos({ x: startX, y: startY });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function handleMouseDown(clientX: number, clientY: number) {
    setDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    imgStart.current = { x: pos.x, y: pos.y };
  }

  function handleMouseMove(clientX: number, clientY: number) {
    if (!dragging || !dragStart.current || !imgStart.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const newX = imgStart.current.x + dx;
    const newY = imgStart.current.y + dy;
    const img = imgRef.current;
    if (!img) return;
    const iw = img.width * scale;
    const ih = img.height * scale;
    const minX = surfaceRect.x;
    const minY = surfaceRect.y;
    const maxX = surfaceRect.x + surfaceRect.width - iw;
    const maxY = surfaceRect.y + surfaceRect.height - ih;
    const nextX = Math.min(Math.max(newX, minX), maxX);
    const nextY = Math.min(Math.max(newY, minY), maxY);
    if (nextX === pos.x && nextY === pos.y) return;
    setPos({ x: nextX, y: nextY });
  }

  function endDrag() {
    setDragging(false);
    dragStart.current = null;
    imgStart.current = null;
  }

  function handleScaleChange(next: number) {
    if (!imageSize) {
      setScale(next);
      return;
    }
    const lowerBound = minScale || 0;
    const clamped = Math.min(Math.max(next, lowerBound), maxScale || next);
    if (Math.abs(clamped - scale) < 1e-4) return;
    if (clamped !== scale) setScale(clamped);
    setPos((p) =>
      clampPosition({
        pos: p,
        surfaceRect,
        imageSize,
        scale: clamped,
      })
    );
  }

  function setPositionMm(xMm: number, yMm: number) {
    if (!mmPerPx) return;
    const desiredX = surfaceRect.x + xMm / mmPerPx.x;
    const desiredY = surfaceRect.y + yMm / mmPerPx.y;
    if (!imageSize) {
      setPos({ x: desiredX, y: desiredY });
      return;
    }
    setPos(
      clampPosition({
        pos: { x: desiredX, y: desiredY },
        surfaceRect,
        imageSize,
        scale,
      })
    );
  }

  const metadata: PrintCustomizationMetadata = useMemo(
    () =>
      buildPrintCustomizationMetadata(
        surface,
        {
          pos: {
            x: pos.x - surfaceRect.x,
            y: pos.y - surfaceRect.y,
          },
          scale,
          imageDataUrl,
          canvas: { width: surfaceRect.width, height: surfaceRect.height },
        },
        mmPerPx ?? undefined
      ),
    [surface, pos, scale, imageDataUrl, surfaceRect, mmPerPx]
  );

  const attributes = useMemo(
    () => buildPrintCustomizationAttributes(metadata),
    [metadata]
  );

  return {
    canvasRef,
    canvasW,
    canvasH,
    scale,
    maxScale,
    minScale,
    baseScale,
    metadata,
    attributes,
    mmPerPx,
    placedSizeMm,
    naturalSizeMm,
    surfaceSizeMm,
    surfaceRect,
    maxPosMm,
    isHydrating,
    isHydrated,
    resetPlacement,
    setPositionMm,
    onScaleChange: handleScaleChange,
    onFileSelect: handleFile,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: endDrag,
    error,
  };
}
