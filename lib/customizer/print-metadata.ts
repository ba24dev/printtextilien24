import { PrintSurface } from "./print-config";

export interface PrintCustomizationMetadata {
  surfaceName: string;
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

/**
 * Builds metadata for a print customization, including positional and sizing information
 * in millimeters or as percentages, depending on the provided conversion factors.
 *
 * @param surface - The print surface containing the name and other relevant properties.
 * @param placement - The placement input specifying position, scale, and image data.
 * @param mmPerPx - Optional conversion factors for millimeters per pixel in x and y directions.
 *                  If provided and canvas dimensions are valid, positions and sizes are calculated in millimeters.
 *                  Otherwise, positions are returned as percentages relative to the canvas size.
 * @returns An object containing metadata for the print customization, including surface name,
 *          position (in mm or %), scale, image data URL, and optional position and surface size in millimeters.
 */
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

/**
 * Builds an array of key-value attributes for print customization metadata.
 *
 * If the provided metadata contains an `imageDataUrl`, the function returns an array
 * with a single object where the key is `"printCustomization"` and the value is the
 * stringified JSON representation of the metadata. If `imageDataUrl` is not present,
 * an empty array is returned.
 *
 * @param metadata - The print customization metadata to process.
 * @returns An array of key-value objects representing the print customization attributes.
 */
export function buildPrintCustomizationAttributes(
  metadata: PrintCustomizationMetadata
): { key: string; value: string }[] {
  if (!metadata.imageDataUrl) return [];
  return [{ key: "printCustomization", value: JSON.stringify(metadata) }];
}
