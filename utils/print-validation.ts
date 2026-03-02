import { PRINT_CONFIG } from "@/config/app-config";

const mmPerInch = 25.4;

export function getMaxPhysicalSizeMm(
  widthPx: number,
  heightPx: number
): { widthMm: number; heightMm: number } {
  const { desiredDpi } = PRINT_CONFIG;
  return {
    widthMm: (widthPx / desiredDpi) * mmPerInch,
    heightMm: (heightPx / desiredDpi) * mmPerInch,
  };
}

export function isBitmapUploadValid(
  widthPx: number,
  heightPx: number
): boolean {
  const { minPhysicalSizeMm } = PRINT_CONFIG;
  const { widthMm, heightMm } = getMaxPhysicalSizeMm(widthPx, heightPx);
  return widthMm >= minPhysicalSizeMm && heightMm >= minPhysicalSizeMm;
}

export function isPlacementValid(
  imageWidthPx: number,
  imageHeightPx: number,
  targetWidthMm: number,
  targetHeightMm: number
): { valid: boolean; reason?: string; warning?: string } {
  const { desiredDpi, minPhysicalSizeMm } = PRINT_CONFIG;
  const maxWidthMm = (imageWidthPx / desiredDpi) * mmPerInch;
  const maxHeightMm = (imageHeightPx / desiredDpi) * mmPerInch;

  if (targetWidthMm < minPhysicalSizeMm || targetHeightMm < minPhysicalSizeMm) {
    return {
      valid: false,
      reason: `Print size too small. Minimum: ${minPhysicalSizeMm}×${minPhysicalSizeMm} mm.`,
    };
  }

  if (targetWidthMm > maxWidthMm || targetHeightMm > maxHeightMm) {
    return {
      valid: false,
      reason: `Image too small for this size. Max at ${desiredDpi} DPI: ${maxWidthMm.toFixed(
        1
      )}×${maxHeightMm.toFixed(1)} mm.`,
    };
  }

  // Optional warning for low effective PPI
  const effectivePpiX = imageWidthPx / (targetWidthMm / mmPerInch);
  const effectivePpiY = imageHeightPx / (targetHeightMm / mmPerInch);
  if (effectivePpiX < 150 || effectivePpiY < 150) {
    return {
      valid: true,
      warning: `Effective PPI is low (${Math.round(effectivePpiX)}×${Math.round(
        effectivePpiY
      )}). For best quality, use ~${desiredDpi} DPI.`,
    };
  }

  return { valid: true };
}
