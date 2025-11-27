import { PRINT_CONFIG } from "@/config/app-config";
import { getMaxPhysicalSizeMm } from "@/utils/print-validation";

type Size = { width: number; height: number };
type MmPerPx = { x: number; y: number };

type ScaleResult = {
  naturalSizeMm: { widthMm: number; heightMm: number } | null;
  baseScale: number | null;
  minScale: number;
  maxScale: number;
};

export function computeScales(params: {
  imageSize: Size | null;
  mmPerPx: MmPerPx | null;
  surfaceRect: { width: number; height: number };
  isVector: boolean;
}): ScaleResult {
  const { desiredDpi, minPhysicalSizeMm } = PRINT_CONFIG;
  const { imageSize, mmPerPx, surfaceRect, isVector } = params;
  if (!imageSize || !mmPerPx) {
    return { naturalSizeMm: null, baseScale: null, minScale: 0, maxScale: 0 };
  }

  const fitScale = Math.min(
    surfaceRect.width / imageSize.width,
    surfaceRect.height / imageSize.height
  );

  const naturalSizeMm = isVector
    ? {
        widthMm: surfaceRect.width * mmPerPx.x,
        heightMm: surfaceRect.height * mmPerPx.y,
      }
    : getMaxPhysicalSizeMm(imageSize.width, imageSize.height);

  const baseScale = isVector ? fitScale : 25.4 / desiredDpi / mmPerPx.x;

  const minScaleX = minPhysicalSizeMm / (imageSize.width * mmPerPx.x);
  const minScaleY = minPhysicalSizeMm / (imageSize.height * mmPerPx.y);
  const minScale = Math.max(minScaleX, minScaleY, 0);

  const maxScale = isVector ? fitScale : Math.min(fitScale, baseScale);

  return { naturalSizeMm, baseScale, minScale, maxScale };
}

export function computePlacedSizeMm(params: {
  naturalSizeMm: { widthMm: number; heightMm: number } | null;
  baseScale: number | null;
  mmPerPx: MmPerPx | null;
  placedSizePx: Size | null;
  scale: number;
}): { width: number; height: number } | null {
  const { naturalSizeMm, baseScale, mmPerPx, placedSizePx, scale } = params;
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
}

export function clampPosition(params: {
  pos: { x: number; y: number };
  surfaceRect: { x: number; y: number; width: number; height: number };
  imageSize: Size;
  scale: number;
}) {
  const { pos, surfaceRect, imageSize, scale } = params;
  const iw = imageSize.width * scale;
  const ih = imageSize.height * scale;
  const minX = surfaceRect.x;
  const minY = surfaceRect.y;
  const maxX = surfaceRect.x + surfaceRect.width - iw;
  const maxY = surfaceRect.y + surfaceRect.height - ih;
  return {
    x: Math.min(Math.max(pos.x, minX), maxX),
    y: Math.min(Math.max(pos.y, minY), maxY),
  };
}
