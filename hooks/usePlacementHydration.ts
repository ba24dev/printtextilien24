import { useEffect, useRef, useState } from "react";

import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { Position } from "../utils/placement-utils";
import { trimTransparentPixels } from "@/utils/image-trim";

type HydrationParams = {
  initialMetadata?: PrintCustomizationMetadata | null;
  surfaceRect: { x: number; y: number; width: number; height: number };
  mmPerPx: { x: number; y: number } | null;
  setScale: (s: number) => void;
  setIsVector: (v: boolean) => void;
  setPos: (pos: Position) => void;
  setImageDataUrl: (url: string | null) => void;
  setImageSize: (size: { width: number; height: number }) => void;
  imgRef: React.MutableRefObject<HTMLImageElement | HTMLCanvasElement | null>;
};

/**
 * Custom React hook to hydrate placement metadata for an image on a surface.
 *
 * This hook initializes the image reference, scale, position, and image data URL
 * based on the provided initial metadata and surface rectangle. It ensures the image
 * is loaded and positioned correctly within the surface boundaries, converting
 * millimeter positions to pixel positions if necessary.
 *
 * @param initialMetadata - Metadata containing image data URL, scale, and position information.
 * @param surfaceRect - The rectangle representing the surface area for placement.
 * @param mmPerPx - Conversion factor from millimeters to pixels for x and y axes.
 * @param setScale - Setter function to update the image scale.
 * @param setPos - Setter function to update the image position.
 * @param setImageDataUrl - Setter function to update the image data URL.
 * @param setImageSize - Setter function to update the image size (width and height).
 * @param imgRef - Mutable ref object to hold the loaded image element.
 *
 * @remarks
 * - Only hydrates once per mount or metadata change.
 * - Ensures the image does not overflow the surface boundaries.
 * - Converts position from millimeters to pixels if available, otherwise uses percentage-based positioning.
 */
export function usePlacementHydration({
  initialMetadata,
  surfaceRect,
  mmPerPx,
  setScale,
  setIsVector,
  setPos,
  setImageDataUrl,
  setImageSize,
  imgRef,
}: HydrationParams) {
  const hydrated = useRef(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(Boolean(initialMetadata?.imageDataUrl));
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (hydrated.current) return;
    if (!initialMetadata || !initialMetadata.imageDataUrl) return;
    const isSvg =
      initialMetadata.imageDataUrl.startsWith("data:image/svg+xml") ||
      /\.svg(\?|$)/i.test(initialMetadata.imageDataUrl);
    setIsVector(isSvg);
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
      const max = Math.min(surfaceRect.width / finalSize.width, surfaceRect.height / finalSize.height);
      const desiredScale = Math.min(initialMetadata.scale || 1, max);
      setScale(desiredScale);

      const iw = finalSize.width * desiredScale;
      const ih = finalSize.height * desiredScale;

      const computePos = () => {
        if (initialMetadata.positionMm && mmPerPx) {
          const xPx = surfaceRect.x + initialMetadata.positionMm.x / mmPerPx.x;
          const yPx = surfaceRect.y + initialMetadata.positionMm.y / mmPerPx.y;
          return { x: xPx, y: yPx };
        }
        const xPx = surfaceRect.x + (initialMetadata.xMm / 100) * surfaceRect.width;
        const yPx = surfaceRect.y + (initialMetadata.yMm / 100) * surfaceRect.height;
        return { x: xPx, y: yPx };
      };

      const desiredPos = computePos();
      const minX = surfaceRect.x;
      const minY = surfaceRect.y;
      const maxX = surfaceRect.x + surfaceRect.width - iw;
      const maxY = surfaceRect.y + surfaceRect.height - ih;
      setPos({
        x: Math.min(Math.max(desiredPos.x, minX), maxX),
        y: Math.min(Math.max(desiredPos.y, minY), maxY),
      });
      setImageDataUrl(initialMetadata.imageDataUrl);
      hydrated.current = true;
      setIsHydrated(true);
      setIsHydrating(false);
    };
    img.src = initialMetadata.imageDataUrl;
  }, [
    initialMetadata,
    mmPerPx,
    surfaceRect,
    setScale,
    setPos,
    setImageDataUrl,
    setImageSize,
    imgRef,
  ]);

  return { isHydrating, isHydrated };
}
