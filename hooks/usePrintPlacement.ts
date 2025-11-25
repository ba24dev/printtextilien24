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

export function usePrintPlacement(
  surface: PrintSurface,
  templateSizeKey?: TemplateSizeKey | string | null,
  initialMetadata?: PrintCustomizationMetadata | null
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const imgStart = useRef<Position | null>(null);

  const { templateSize, canvasW, canvasH } = useMemo(() => resolveTemplateSize(surface), [surface]);
  const surfaceRect = useMemo(
    () => resolveSurfaceRect(surface, canvasW, canvasH),
    [surface, canvasW, canvasH]
  );

  const [pos, setPos] = useState<Position>(() => ({ x: surfaceRect.x, y: surfaceRect.y }));

  const maxScale = useMemo(() => {
    if (!imageSize) return 0;
    return Math.min(surfaceRect.width / imageSize.width, surfaceRect.height / imageSize.height);
  }, [imageSize, surfaceRect.height, surfaceRect.width]);

  const mmPerPx = useMemo(
    () => resolveMmPerPx(surface, templateSize, templateSizeKey),
    [surface, templateSize, templateSizeKey]
  );

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
      ? { width: surfaceRect.width * mmPerPx.x, height: surfaceRect.height * mmPerPx.y }
      : null;

  const naturalSizeMm =
    mmPerPx && imageSize
      ? { width: imageSize.width * mmPerPx.x, height: imageSize.height * mmPerPx.y }
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
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setImageDataUrl(url);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImageSize({ width: img.width, height: img.height });
        const fitScale = Math.min(surfaceRect.width / img.width, surfaceRect.height / img.height);
        setScale(fitScale);
        const startX = surfaceRect.x + (surfaceRect.width - img.width * fitScale) / 2;
        const startY = surfaceRect.y + (surfaceRect.height - img.height * fitScale) / 2;
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
    const clamped = Math.min(Math.max(next, 0), maxScale);
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

  const attributes = useMemo(() => buildPrintCustomizationAttributes(metadata), [metadata]);

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
  };
}
