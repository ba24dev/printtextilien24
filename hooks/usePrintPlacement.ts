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

type AnchorName =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type AnchorState = AnchorName | "custom";

function anchorToPos(params: {
  anchor: AnchorName;
  surfaceRect: { x: number; y: number; width: number; height: number };
  placedWidth: number;
  placedHeight: number;
}) {
  const { anchor, surfaceRect, placedWidth, placedHeight } = params;
  const xMap: Record<AnchorName, number> = {
    "top-left": surfaceRect.x,
    "middle-left": surfaceRect.x,
    "bottom-left": surfaceRect.x,
    "top-center": surfaceRect.x + (surfaceRect.width - placedWidth) / 2,
    center: surfaceRect.x + (surfaceRect.width - placedWidth) / 2,
    "bottom-center": surfaceRect.x + (surfaceRect.width - placedWidth) / 2,
    "top-right": surfaceRect.x + surfaceRect.width - placedWidth,
    "middle-right": surfaceRect.x + surfaceRect.width - placedWidth,
    "bottom-right": surfaceRect.x + surfaceRect.width - placedWidth,
  };

  const yMap: Record<AnchorName, number> = {
    "top-left": surfaceRect.y,
    "top-center": surfaceRect.y,
    "top-right": surfaceRect.y,
    "middle-left": surfaceRect.y + (surfaceRect.height - placedHeight) / 2,
    center: surfaceRect.y + (surfaceRect.height - placedHeight) / 2,
    "middle-right": surfaceRect.y + (surfaceRect.height - placedHeight) / 2,
    "bottom-left": surfaceRect.y + surfaceRect.height - placedHeight,
    "bottom-center": surfaceRect.y + surfaceRect.height - placedHeight,
    "bottom-right": surfaceRect.y + surfaceRect.height - placedHeight,
  };

  return { x: xMap[anchor], y: yMap[anchor] };
}

export function usePrintPlacement(
  surface: PrintSurface,
  templateSizeKey?: TemplateSizeKey | string | null,
  initialMetadata?: PrintCustomizationMetadata | null
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isVector, setIsVector] = useState(false);
  const [scale, setScale] = useState(1);
  const [anchor, setAnchor] = useState<AnchorState>("center");
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const imgStart = useRef<Position | null>(null);
  const resizeHandle = useRef<AnchorName | null>(null);
  const resizeStart = useRef<{
    mouse: Position;
    pos: Position;
    scale: number;
    imageSize: { width: number; height: number };
  } | null>(null);
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

  const placedRectPx = useMemo(() => {
    if (!imageSize) return null;
    return { x: pos.x, y: pos.y, width: imageSize.width * scale, height: imageSize.height * scale };
  }, [imageSize, pos.x, pos.y, scale]);

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
    resizeHandle.current = null;
    resizeStart.current = null;
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
    setIsVector,
    setPos,
    setImageDataUrl,
    setImageSize,
    imgRef,
  });

  function applyAnchor(
    nextAnchor: AnchorName,
    targetScale?: number,
    imageSizeOverride?: { width: number; height: number }
  ) {
    const size = imageSizeOverride ?? imageSize;
    if (!size) {
      setAnchor(nextAnchor);
      return;
    }
    const s = targetScale ?? scale;
    const placedWidth = size.width * s;
    const placedHeight = size.height * s;
    const desiredPos = anchorToPos({
      anchor: nextAnchor,
      surfaceRect,
      placedWidth,
      placedHeight,
    });
    setPos(
      clampPosition({
        pos: desiredPos,
        surfaceRect,
        imageSize: size,
        scale: s,
      })
    );
    setAnchor(nextAnchor);
  }

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
      setAnchor("center");
      const img = new Image();
      img.onload = () => {
        let finalImg: HTMLImageElement | HTMLCanvasElement = img;
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
        // Default placement: center anchor on surface
        applyAnchor("center", initialScale, finalSize);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: clientX, y: clientY };
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [canvasRef]
  );

  function handleMouseDown(clientX: number, clientY: number) {
    if (!placedRectPx) return;
    const local = toLocal(clientX, clientY);
    const inside =
      local.x >= placedRectPx.x &&
      local.x <= placedRectPx.x + placedRectPx.width &&
      local.y >= placedRectPx.y &&
      local.y <= placedRectPx.y + placedRectPx.height;
    if (!inside) return;
    setDragging(true);
    dragStart.current = local;
    imgStart.current = { x: pos.x, y: pos.y };
  }

  function handleMouseMove(clientX: number, clientY: number) {
    const local = toLocal(clientX, clientY);
    if (resizeHandle.current && resizeStart.current && imageSize) {
      const start = resizeStart.current;
      const handle = resizeHandle.current;
      const dx = local.x - start.mouse.x;
      const dy = local.y - start.mouse.y;
      const startRect = {
        x: start.pos.x,
        y: start.pos.y,
        width: start.imageSize.width * start.scale,
        height: start.imageSize.height * start.scale,
      };
      const dirX = handle.includes("left") ? -1 : 1;
      const dirY = handle.includes("top") ? -1 : 1;
      const nextWidth = startRect.width + dx * dirX;
      const nextHeight = startRect.height + dy * dirY;
      if (nextWidth <= 1 || nextHeight <= 1) return;
      const scaleFactor = Math.min(nextWidth / startRect.width, nextHeight / startRect.height);
      if (scaleFactor <= 0) return;
      const desiredScale = start.scale * scaleFactor;
      const lowerBound = minScale || 0;
      const upperBound = maxScale || desiredScale;
      const clampedScale = Math.min(Math.max(desiredScale, lowerBound), upperBound);
      const newWidth = imageSize.width * clampedScale;
      const newHeight = imageSize.height * clampedScale;
      const fixedRight = startRect.x + startRect.width;
      const fixedBottom = startRect.y + startRect.height;
      const newX = handle.includes("left") ? fixedRight - newWidth : startRect.x;
      const newY = handle.includes("top") ? fixedBottom - newHeight : startRect.y;
      const clampedPos = clampPosition({
        pos: { x: newX, y: newY },
        surfaceRect,
        imageSize,
        scale: clampedScale,
      });
      if (Math.abs(clampedScale - scale) > 1e-4) {
        setScale(clampedScale);
      }
      setPos(clampedPos);
      setAnchor("custom");
      return;
    }

    if (!dragging || !dragStart.current || !imgStart.current) return;
    const dx = local.x - dragStart.current.x;
    const dy = local.y - dragStart.current.y;
    const newX = imgStart.current.x + dx;
    const newY = imgStart.current.y + dy;
    const img = imgRef.current;
    if (!img) return;
    const clamped = clampPosition({
      pos: { x: newX, y: newY },
      surfaceRect,
      imageSize: { width: img.width, height: img.height },
      scale,
    });
    if (clamped.x === pos.x && clamped.y === pos.y) return;
    setPos(clamped);
    setAnchor("custom");
  }

  function endDrag() {
    setDragging(false);
    dragStart.current = null;
    imgStart.current = null;
    resizeHandle.current = null;
    resizeStart.current = null;
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
    if (anchor === "custom") {
      setPos(
        clampPosition({
          pos,
          surfaceRect,
          imageSize,
          scale: clamped,
        })
      );
    } else {
      applyAnchor(anchor, clamped);
    }
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
    anchor,
    maxScale,
    minScale,
    baseScale,
    metadata,
    attributes,
    mmPerPx,
    placedSizeMm,
    placedRectPx,
    imageDataUrl,
    naturalSizeMm,
    surfaceSizeMm,
    surfaceRect,
    maxPosMm,
    isHydrating,
    isHydrated,
    resetPlacement,
    setPositionMm,
    setAnchor: (a: AnchorState | AnchorName) => {
      if (a === "custom") {
        setAnchor("custom");
        return;
      }
      applyAnchor(a);
    },
    onScaleChange: handleScaleChange,
    onFileSelect: handleFile,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: endDrag,
    onResizeStart: (handle: AnchorName, clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !imageSize) return;
      const localMouse = { x: clientX - rect.left, y: clientY - rect.top };
      resizeHandle.current = handle;
      resizeStart.current = {
        mouse: localMouse,
        pos,
        scale,
        imageSize,
      };
      setAnchor("custom");
      setDragging(false);
    },
    error,
  };
}
