import { useCallback, useMemo, useRef, useState } from "react";

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
import { useCanvasRenderer } from "./useCanvasRenderer";
import { usePlacementHydration } from "./usePlacementHydration";

import { isBitmapUploadValid } from "@/utils/print-validation";

import { PRINT_CONFIG } from "@/config/app-config";

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
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const imgStart = useRef<Position | null>(null);

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

  const maxScale = useMemo(() => {
    if (!imageSize || !mmPerPx) return 0;
    // Calculate max scale so placed size in mm does not exceed image's physical size at desired DPI
    const mmPerInch = 25.4;
    const { desiredDpi } = PRINT_CONFIG;
    const maxWidthMm = (imageSize.width / desiredDpi) * mmPerInch;
    const maxHeightMm = (imageSize.height / desiredDpi) * mmPerInch;
    // What scale would make placed size == max physical size?
    const scaleByWidth = maxWidthMm / (imageSize.width * mmPerPx.x);
    const scaleByHeight = maxHeightMm / (imageSize.height * mmPerPx.y);
    // Also limit by surface size (fit-to-surface)
    const fitSurfaceScale = Math.min(
      surfaceRect.width / imageSize.width,
      surfaceRect.height / imageSize.height
    );
    // Final max scale: cannot exceed physical print size, nor surface fit
    return Math.min(scaleByWidth, scaleByHeight, fitSurfaceScale);
  }, [imageSize, surfaceRect.height, surfaceRect.width, mmPerPx]);

  const placedSizePx = useMemo(() => {
    if (!imageSize) return null;
    return { width: imageSize.width * scale, height: imageSize.height * scale };
  }, [imageSize, scale]);

  const placedSizeMm =
    mmPerPx && placedSizePx
      ? {
          width: placedSizePx.width * mmPerPx.x,
          height: placedSizePx.height * mmPerPx.y,
        }
      : null;

  const surfaceSizeMm =
    mmPerPx && surfaceRect.width > 0 && surfaceRect.height > 0
      ? {
          width: surfaceRect.width * mmPerPx.x,
          height: surfaceRect.height * mmPerPx.y,
        }
      : null;

  const naturalSizeMm =
    mmPerPx && imageSize
      ? {
          width: imageSize.width * mmPerPx.x,
          height: imageSize.height * mmPerPx.y,
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
        imgRef.current = img;
        setImageSize({ width: img.width, height: img.height });
        if (!isSvg && !isBitmapUploadValid(img.width, img.height)) {
          setError(
            "Image too small. At configured DPI it would be smaller than minimum print size."
          );
          return;
        }
        // Calculate max scale as above
        const mmPerInch = 25.4;
        const { desiredDpi } = PRINT_CONFIG;
        const maxWidthMm = (img.width / desiredDpi) * mmPerInch;
        const maxHeightMm = (img.height / desiredDpi) * mmPerInch;
        const mmPerPxX = mmPerPx ? mmPerPx.x : 1;
        const mmPerPxY = mmPerPx ? mmPerPx.y : 1;
        const scaleByWidth = maxWidthMm / (img.width * mmPerPxX);
        const scaleByHeight = maxHeightMm / (img.height * mmPerPxY);
        const fitSurfaceScale = Math.min(
          surfaceRect.width / img.width,
          surfaceRect.height / img.height
        );
        const maxAllowedScale = Math.min(
          scaleByWidth,
          scaleByHeight,
          fitSurfaceScale
        );
        setScale(maxAllowedScale);
        const startX =
          surfaceRect.x + (surfaceRect.width - img.width * maxAllowedScale) / 2;
        const startY =
          surfaceRect.y +
          (surfaceRect.height - img.height * maxAllowedScale) / 2;
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
    // Clamp scale so placed size does not exceed image's max physical size
    const mmPerInch = 25.4;
    const { desiredDpi } = PRINT_CONFIG;
    const maxWidthMm = (imageSize.width / desiredDpi) * mmPerInch;
    const maxHeightMm = (imageSize.height / desiredDpi) * mmPerInch;
    const mmPerPxX = mmPerPx ? mmPerPx.x : 1;
    const mmPerPxY = mmPerPx ? mmPerPx.y : 1;
    const scaleByWidth = maxWidthMm / (imageSize.width * mmPerPxX);
    const scaleByHeight = maxHeightMm / (imageSize.height * mmPerPxY);
    const fitSurfaceScale = Math.min(
      surfaceRect.width / imageSize.width,
      surfaceRect.height / imageSize.height
    );
    const maxAllowedScale = Math.min(
      scaleByWidth,
      scaleByHeight,
      fitSurfaceScale
    );
    const clamped = Math.min(Math.max(next, 0), maxAllowedScale);
    const iw = imageSize.width * clamped;
    const ih = imageSize.height * clamped;
    const minX = surfaceRect.x;
    const minY = surfaceRect.y;
    const maxX = surfaceRect.x + surfaceRect.width - iw;
    const maxY = surfaceRect.y + surfaceRect.height - ih;
    if (clamped !== scale) setScale(clamped);
    setPos((p) => ({
      x: Math.min(Math.max(p.x, minX), maxX),
      y: Math.min(Math.max(p.y, minY), maxY),
    }));
  }

  function setPositionMm(xMm: number, yMm: number) {
    if (!mmPerPx) return;
    const desiredX = surfaceRect.x + xMm / mmPerPx.x;
    const desiredY = surfaceRect.y + yMm / mmPerPx.y;
    if (!imageSize) {
      setPos({ x: desiredX, y: desiredY });
      return;
    }
    const iw = imageSize.width * scale;
    const ih = imageSize.height * scale;
    const minX = surfaceRect.x;
    const minY = surfaceRect.y;
    const maxX = surfaceRect.x + surfaceRect.width - iw;
    const maxY = surfaceRect.y + surfaceRect.height - ih;
    setPos({
      x: Math.min(Math.max(desiredX, minX), maxX),
      y: Math.min(Math.max(desiredY, minY), maxY),
    });
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
