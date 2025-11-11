const DEFAULT_DPI = 300;

export const mmToPx = (mm: number, dpi: number = DEFAULT_DPI): number => {
  return (mm * dpi) / 25.4;
};

export const pxToMm = (px: number, dpi: number = DEFAULT_DPI): number => {
  return px * (25.4 / dpi);
};

export const validateDpi = (dpi: number): boolean => {
  return dpi >= 150 && dpi <= 1200;
};

export function isDpiValid(
  sourcePxWidth: number,
  sourcePxHeight: number,
  targetPxWidth: number,
  targetPxHeight: number
): boolean {
  return sourcePxWidth >= targetPxWidth && sourcePxHeight >= targetPxHeight;
}

export interface Insets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SurfaceMM {
  widthMm: number;
  heightMm: number;
  safeZone: Insets;
}

export type MarginsMM = Insets;

export function computePrintSize(
  surface: SurfaceMM,
  margins: MarginsMM,
  dpi: number = DEFAULT_DPI
) {
  const usableWidthMm =
    surface.widthMm - surface.safeZone.left - surface.safeZone.right;
  const usableHeightMm =
    surface.heightMm - surface.safeZone.top - surface.safeZone.bottom;

  const artworkWidthMm = usableWidthMm - (margins.left + margins.right);
  const artworkHeightMm = usableHeightMm - (margins.top + margins.bottom);

  return {
    artworkWidthMm,
    artworkHeightMm,
    artworkWidthPx: mmToPx(artworkWidthMm, dpi),
    artworkHeightPx: mmToPx(artworkHeightMm, dpi),
    centerXmm: surface.safeZone.left + margins.left + artworkWidthMm / 2,
    centerYmm: surface.safeZone.top + margins.top + artworkHeightMm / 2,
  };
}

export const isWithinSafeZone = (
  designWidthMm: number,
  designHeightMm: number,
  surface: SurfaceMM,
): boolean => {
    const usableWidthMm = surface.widthMm - surface.safeZone.left - surface.safeZone.right;
    const usableHeightMm = surface.heightMm - surface.safeZone.top - surface.safeZone.bottom;

    return designWidthMm <= usableWidthMm && designHeightMm <= usableHeightMm;
};

export const exampleSurface: SurfaceMM = {
  // Example: T-Shirt M-size surface
  widthMm: 510,
  heightMm: 710,
  safeZone: {
    left: 50,
    right: 50,
    top: 100,
    bottom: 100,
  },
};

export const exampleMargins: MarginsMM = {
  left: 100,
  right: 100,
  top: 150,
  bottom: 150,
};

const result = computePrintSize(exampleSurface, exampleMargins);
console.log("Computed Print Size:", result);
