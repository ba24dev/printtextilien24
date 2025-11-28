import { useEffect } from "react";

import { PrintSurface } from "@/lib/customizer/print-config";
import { Position } from "@/utils/placement-utils";

type Params = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  imgRef: React.MutableRefObject<HTMLImageElement | HTMLCanvasElement | null>;
  bgRef: React.MutableRefObject<HTMLImageElement | null>;
  surface: PrintSurface;
  surfaceRect: { x: number; y: number; width: number; height: number };
  canvasW: number;
  canvasH: number;
  imageDataUrl: string | null;
  pos: Position;
  scale: number;
};

/**
 * Custom React hook for rendering images and backgrounds onto a canvas element.
 *
 * This hook draws a background image (if provided), a main image at a specified position and scale,
 * and overlays a dashed rectangle representing the surface area. It handles loading the background image
 * asynchronously and updates the canvas whenever relevant dependencies change.
 *
 * @param params - The parameters for the canvas renderer.
 * @param params.canvasRef - Ref to the canvas DOM element.
 * @param params.imgRef - Ref to the main image DOM element.
 * @param params.bgRef - Ref to the background image DOM element.
 * @param params.surface - Object containing surface properties, including preview image URL.
 * @param params.surfaceRect - Rectangle defining the surface area to be highlighted.
 * @param params.canvasW - Width of the canvas.
 * @param params.canvasH - Height of the canvas.
 * @param params.imageDataUrl - Data URL of the main image to be rendered.
 * @param params.pos - Position `{ x, y }` where the main image should be drawn.
 * @param params.scale - Scale factor for the main image.
 *
 * @remarks
 * - The hook uses `useEffect` to update the canvas whenever dependencies change.
 * - The background image is loaded asynchronously if a preview image URL is provided.
 * - The dashed rectangle is drawn to visually indicate the surface area.
 */
export function useCanvasRenderer({
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
}: Params) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (surface.previewImageUrl) {
        const bg = bgRef.current;
        if (bg) {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (img && imageDataUrl) {
        const iw = img.width * scale;
        const ih = img.height * scale;
        ctx.drawImage(img, pos.x, pos.y, iw, ih);
      }

      ctx.save();
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#444";
      ctx.strokeRect(surfaceRect.x, surfaceRect.y, surfaceRect.width, surfaceRect.height);
      ctx.restore();
    };

    if (surface.previewImageUrl && !bgRef.current) {
      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.onload = () => {
        bgRef.current = bg;
        drawAll();
      };
      bg.src = surface.previewImageUrl;
      return () => {
        // no-op cleanup
      };
    }

    drawAll();
  }, [
    surface.previewImageUrl,
    imageDataUrl,
    pos,
    scale,
    canvasW,
    canvasH,
    surfaceRect,
    surface,
    canvasRef,
    imgRef,
    bgRef,
  ]);
}
