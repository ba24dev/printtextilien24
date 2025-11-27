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
import { useCanvasRenderer } from "./useCanvasRenderer";
import { usePlacementHydration } from "./usePlacementHydration";

import {
  getMaxPhysicalSizeMm,
  isBitmapUploadValid,
} from "@/utils/print-validation";

function trimTransparentPixels(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { image: img, width: img.width, height: img.height };
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { image: img, width: img.width, height: img.height };
  }

  const trimmedW = maxX - minX + 1;
  const trimmedH = maxY - minY + 1;
  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = trimmedW;
  trimmedCanvas.height = trimmedH;
  const tctx = trimmedCanvas.getContext("2d");
  if (!tctx) return { image: img, width: img.width, height: img.height };
  tctx.putImageData(ctx.getImageData(minX, minY, trimmedW, trimmedH), 0, 0);
  const trimmedImg = new Image();
  trimmedImg.src = trimmedCanvas.toDataURL();
  return { image: trimmedImg, width: trimmedW, height: trimmedH };
}

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
  const { desiredDpi, minPhysicalSizeMm } = PRINT_CONFIG;

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

  const naturalSizeMm = useMemo(() => {
    if (!imageSize || !mmPerPx) return null;
    if (isVector) {
      return {
        widthMm: surfaceRect.width * mmPerPx.x,
        heightMm: surfaceRect.height * mmPerPx.y,
      };
    }
    return getMaxPhysicalSizeMm(imageSize.width, imageSize.height);
  }, [imageSize, isVector, mmPerPx, surfaceRect.height, surfaceRect.width]);

  const baseScale = useMemo(() => {
    if (!mmPerPx) return null;
    if (isVector && imageSize) {
      return Math.min(surfaceRect.width / imageSize.width, surfaceRect.height / imageSize.height);
    }
    // Scale that renders the bitmap at its natural physical size (based on desired DPI).
    return 25.4 / desiredDpi / mmPerPx.x;
  }, [desiredDpi, imageSize, isVector, mmPerPx, surfaceRect.height, surfaceRect.width]);

  const minScale = useMemo(() => {
    if (!mmPerPx || !imageSize) return 0;
    const minScaleX = minPhysicalSizeMm / (imageSize.width * mmPerPx.x);
    const minScaleY = minPhysicalSizeMm / (imageSize.height * mmPerPx.y);
    return Math.max(minScaleX, minScaleY, 0);
  }, [imageSize, minPhysicalSizeMm, mmPerPx]);

  const maxScale = useMemo(() => {
    if (!imageSize) return 0;
    const fitScale = Math.min(surfaceRect.width / imageSize.width, surfaceRect.height / imageSize.height);
    if (isVector) return fitScale;
    if (baseScale) return Math.min(fitScale, baseScale);
    return fitScale;
  }, [baseScale, imageSize, isVector, surfaceRect.height, surfaceRect.width]);

  const placedSizePx = useMemo(() => {
    if (!imageSize) return null;
    return { width: imageSize.width * scale, height: imageSize.height * scale };
  }, [imageSize, scale]);

  const placedSizeMm = useMemo(() => {
    if (naturalSizeMm && baseScale) {
      const factor = scale / baseScale;
      return {
        width: naturalSizeMm.widthMm * factor,
        height: naturalSizeMm.heightMm * factor,
      };
    }
    if (mmPerPx && placedSizePx) {
      return {
        width: placedSizePx.width * mmPerPx.x,
        height: placedSizePx.height * mmPerPx.y,
      };
    }
    return null;
  }, [baseScale, mmPerPx, naturalSizeMm, placedSizePx, scale]);

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
        // For SVGs, treat natural size as surface-fit; for bitmaps, use DPI-based preferred scale.
        const preferredScale = isSvg ? fitScale : baseScale ?? fitScale;
        const maxAllowedScale = isSvg
          ? fitScale
          : baseScale
          ? Math.min(fitScale, baseScale)
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
