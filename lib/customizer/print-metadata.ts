import { PrintSurface } from "./print-config";

export interface PrintCustomizationMetadata {
  surfaceName: string;
  // legacy property names kept for compatibility; values are percentages unless mm data available
  xMm: number;
  yMm: number;
  scale: number;
  imageDataUrl: string | null;
  positionMm?: { x: number; y: number };
  surfaceSizeMm?: { width: number; height: number };
}

type PlacementInput = {
  pos: { x: number; y: number };
  scale: number;
  imageDataUrl: string | null;
  canvas: { width: number; height: number };
};

export function buildPrintCustomizationMetadata(
  surface: PrintSurface,
  placement: PlacementInput,
  mmPerPx?: { x: number; y: number }
): PrintCustomizationMetadata {
  const toPctX = (px: number) => (px / placement.canvas.width) * 100;
  const toPctY = (px: number) => (px / placement.canvas.height) * 100;

  const mmPos =
    mmPerPx && placement.canvas.width > 0 && placement.canvas.height > 0
      ? {
          x: placement.pos.x * mmPerPx.x,
          y: placement.pos.y * mmPerPx.y,
        }
      : null;
  const surfaceSizeMm =
    mmPerPx && placement.canvas.width > 0 && placement.canvas.height > 0
      ? {
          width: placement.canvas.width * mmPerPx.x,
          height: placement.canvas.height * mmPerPx.y,
        }
      : null;

  return {
    surfaceName: surface.name,
    xMm: mmPos ? mmPos.x : toPctX(placement.pos.x),
    yMm: mmPos ? mmPos.y : toPctY(placement.pos.y),
    scale: placement.scale,
    imageDataUrl: placement.imageDataUrl,
    positionMm: mmPos ?? undefined,
    surfaceSizeMm: surfaceSizeMm ?? undefined,
  };
}

export function buildPrintCustomizationAttributes(
  metadata: PrintCustomizationMetadata
): { key: string; value: string }[] {
  if (!metadata.imageDataUrl) return [];
  return [{ key: "printCustomization", value: JSON.stringify(metadata) }];
}
