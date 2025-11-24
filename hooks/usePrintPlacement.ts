import { useEffect, useMemo, useRef, useState } from "react";

import {
  TEMPLATE_PHYSICAL_SIZES,
  TemplateSideKey,
  TemplateSizeKey,
  getTemplatePhysicalSize,
} from "@/config/print-templates";
import { PrintSurface } from "@/lib/customizer/print-config";
import {
  PrintCustomizationMetadata,
  buildPrintCustomizationAttributes,
  buildPrintCustomizationMetadata,
} from "@/lib/customizer/print-metadata";

type Position = { x: number; y: number };

const MAX_CANVAS_SIDE = 420;
const DEFAULT_TEMPLATE_WIDTH = 360;

function resolveTemplateSize(surface: PrintSurface) {
  const widthPct = Math.max(surface.widthPct, 1);
  const heightPct = Math.max(surface.heightPct, 1);
  const tpl = surface.templateSize ?? {
    width: DEFAULT_TEMPLATE_WIDTH,
    height: Math.round((DEFAULT_TEMPLATE_WIDTH * heightPct) / widthPct),
  };
  const scale = Math.min(1, MAX_CANVAS_SIDE / Math.max(tpl.width, tpl.height));
  return {
    templateSize: tpl,
    canvasW: Math.round(tpl.width * scale),
    canvasH: Math.round(tpl.height * scale),
  };
}

function resolveSurfaceRect(surface: PrintSurface, canvasW: number, canvasH: number) {
  const widthPct = Math.max(surface.widthPct, 1);
  const heightPct = Math.max(surface.heightPct, 1);
  const width = (widthPct / 100) * canvasW;
  const height = (heightPct / 100) * canvasH;
  const x = (surface.offsetPct.x / 100) * canvasW;
  const y = (surface.offsetPct.y / 100) * canvasH;
  return { x, y, width, height };
}

function resolveMmPerPx(
  surface: PrintSurface,
  templateSize: { width: number; height: number },
  templateSizeKey?: TemplateSizeKey | string | null
) {
  const sideKey = (surface.templateKey ?? surface.name ?? null) as TemplateSideKey | null;
  let physical = getTemplatePhysicalSize(
    surface.templateKey ?? surface.name ?? null,
    templateSizeKey ?? null
  );

  if (!physical && sideKey && TEMPLATE_PHYSICAL_SIZES[sideKey]) {
    const map = TEMPLATE_PHYSICAL_SIZES[sideKey];
    physical = map.m ?? map.s ?? Object.values(map)[0] ?? null;
  }
  if (!physical) return null;
  return {
    x: physical.widthMm / templateSize.width,
    y: physical.heightMm / templateSize.height,
  };
}

export function usePrintPlacement(
  surface: PrintSurface,
  templateSizeKey?: TemplateSizeKey | string | null
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const imgStart = useRef<Position | null>(null);

  const { templateSize, canvasW, canvasH } = useMemo(() => resolveTemplateSize(surface), [surface]);

  const surfaceRect = useMemo(
    () => resolveSurfaceRect(surface, canvasW, canvasH),
    [surface, canvasW, canvasH]
  );

  const [pos, setPos] = useState<Position>(() => ({ x: surfaceRect.x, y: surfaceRect.y }));

  const maxScale = useMemo(() => {
    if (!imageSize) return 0;
    return Math.min(surfaceRect.width / imageSize.width, surfaceRect.height / imageSize.height);
  }, [imageSize, surfaceRect.height, surfaceRect.width]);

  const mmPerPx = useMemo(
    () => resolveMmPerPx(surface, templateSize, templateSizeKey),
    [surface, templateSize, templateSizeKey]
  );

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
      return;
    }

    drawAll();
  }, [surface.previewImageUrl, imageDataUrl, pos, scale, canvasW, canvasH, surfaceRect]);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setImageDataUrl(url);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImageSize({ width: img.width, height: img.height });
        const fitScale = Math.min(surfaceRect.width / img.width, surfaceRect.height / img.height);
        setScale(fitScale);
        const startX = surfaceRect.x + (surfaceRect.width - img.width * fitScale) / 2;
        const startY = surfaceRect.y + (surfaceRect.height - img.height * fitScale) / 2;
        setPos({ x: startX, y: startY });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function handleMouseDown(clientX: number, clientY: number) {
    setDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    imgStart.current = { x: pos.x, y: pos.y };
  }

  function handleMouseMove(clientX: number, clientY: number) {
    if (!dragging || !dragStart.current || !imgStart.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const newX = imgStart.current.x + dx;
    const newY = imgStart.current.y + dy;
    const img = imgRef.current;
    if (!img) return;
    const iw = img.width * scale;
    const ih = img.height * scale;
    const minX = surfaceRect.x;
    const minY = surfaceRect.y;
    const maxX = surfaceRect.x + surfaceRect.width - iw;
    const maxY = surfaceRect.y + surfaceRect.height - ih;
    const nextX = Math.min(Math.max(newX, minX), maxX);
    const nextY = Math.min(Math.max(newY, minY), maxY);
    if (nextX === pos.x && nextY === pos.y) return;
    setPos({ x: nextX, y: nextY });
  }

  function endDrag() {
    setDragging(false);
    dragStart.current = null;
    imgStart.current = null;
  }

  function handleScaleChange(next: number) {
    if (!imageSize) {
      setScale(next);
      return;
    }
    const clamped = Math.min(Math.max(next, 0), maxScale);
    const iw = imageSize.width * clamped;
    const ih = imageSize.height * clamped;
    const minX = surfaceRect.x;
    const minY = surfaceRect.y;
    const maxX = surfaceRect.x + surfaceRect.width - iw;
    const maxY = surfaceRect.y + surfaceRect.height - ih;
    if (clamped !== scale) setScale(clamped);
    setPos((p) => ({
      x: Math.min(Math.max(p.x, minX), maxX),
      y: Math.min(Math.max(p.y, minY), maxY),
    }));
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

  const attributes = useMemo(() => buildPrintCustomizationAttributes(metadata), [metadata]);

  return {
    canvasRef,
    canvasW,
    canvasH,
    scale,
    maxScale,
    metadata,
    attributes,
    onScaleChange: handleScaleChange,
    onFileSelect: handleFile,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: endDrag,
  };
}
