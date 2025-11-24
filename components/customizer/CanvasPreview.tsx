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
  ...restProps
}: Props) {
  return (
    <div {...restProps}>
      <canvas
        width={width}
        height={height}
        ref={canvasRef}
        onMouseDown={(e) => onMouseDown(e.clientX, e.clientY)}
        onMouseMove={(e) => onMouseMove(e.clientX, e.clientY)}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        aria-label={`Preview for ${surface.name}`}
        className="rounded bg-white shadow"
      />
    </div>
  );
}
