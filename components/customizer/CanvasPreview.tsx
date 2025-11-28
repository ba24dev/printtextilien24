import React from "react";

import { PrintSurface } from "@/lib/customizer/print-config";

type Props = {
  surface: PrintSurface;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  onMouseDown: (clientX: number, clientY: number) => void;
  onMouseMove: (clientX: number, clientY: number) => void;
  onMouseUp: () => void;
  onResizeStart?: (
    corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    clientX: number,
    clientY: number
  ) => void;
  imageRect?: { x: number; y: number; width: number; height: number } | null;
  hasImage?: boolean;
  [key: string]: unknown;
};

export function CanvasPreview({
  surface,
  canvasRef,
  width,
  height,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onResizeStart,
  imageRect,
  hasImage,
  ...restProps
}: Props) {
  const handles: {
    key: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    left: number;
    top: number;
  }[] =
    imageRect && hasImage
      ? [
          { key: "top-left", left: imageRect.x, top: imageRect.y },
          {
            key: "top-right",
            left: imageRect.x + imageRect.width,
            top: imageRect.y,
          },
          {
            key: "bottom-left",
            left: imageRect.x,
            top: imageRect.y + imageRect.height,
          },
          {
            key: "bottom-right",
            left: imageRect.x + imageRect.width,
            top: imageRect.y + imageRect.height,
          },
        ]
      : [];

  return (
    <div {...restProps}>
      <div
        className="relative"
        style={{ width, height }}
        onMouseMove={(e) => onMouseMove(e.clientX, e.clientY)}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <canvas
          width={width}
          height={height}
          ref={canvasRef}
          onMouseDown={(e) => onMouseDown(e.clientX, e.clientY)}
          aria-label={`Preview for ${surface.name}`}
          className="absolute left-0 top-0 rounded bg-transparent shadow"
        />
        {imageRect && hasImage ? (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute border-2 border-dashed border-sky-400"
              style={{
                left: imageRect.x,
                top: imageRect.y,
                width: imageRect.width,
                height: imageRect.height,
              }}
            />
            {handles.map((h) => (
              <button
                key={h.key}
                type="button"
                className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-sky-400 shadow pointer-events-auto ${
                  h.key === "top-left" || h.key === "bottom-right"
                    ? "cursor-nwse-resize"
                    : "cursor-nesw-resize"
                }`}
                style={{ left: h.left, top: h.top }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onResizeStart?.(h.key, e.clientX, e.clientY);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
