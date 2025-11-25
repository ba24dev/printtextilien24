import {
  TEMPLATE_PHYSICAL_SIZES,
  TemplateSideKey,
  TemplateSizeKey,
} from "@/config/print-templates";
import { PrintSurface } from "@/lib/customizer/print-config";

export type Position = { x: number; y: number };

export const MAX_CANVAS_SIDE = 420;
export const DEFAULT_TEMPLATE_WIDTH = 360;

export function resolveTemplateSize(surface: PrintSurface) {
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

export function resolveSurfaceRect(surface: PrintSurface, canvasW: number, canvasH: number) {
  const widthPct = Math.max(surface.widthPct, 1);
  const heightPct = Math.max(surface.heightPct, 1);
  const width = (widthPct / 100) * canvasW;
  const height = (heightPct / 100) * canvasH;
  const x = (surface.offsetPct.x / 100) * canvasW;
  const y = (surface.offsetPct.y / 100) * canvasH;
  return { x, y, width, height };
}

export function resolveMmPerPx(
  surface: PrintSurface,
  templateSize: { width: number; height: number },
  templateSizeKey?: TemplateSizeKey | string | null
) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const wantedSide = normalize(surface.templateKey ?? surface.name ?? "");
  const wantedSize = templateSizeKey ? normalize(String(templateSizeKey)) : null;

  const sideEntry = Object.entries(TEMPLATE_PHYSICAL_SIZES).find(
    ([key]) => normalize(key) === wantedSide
  );
  let physical =
    sideEntry && wantedSize
      ? Object.entries(sideEntry[1]).find(([k]) => normalize(k) === wantedSize)?.[1]
      : null;

  if (!physical && sideEntry) {
    const map = sideEntry[1];
    physical = map.m ?? map.s ?? Object.values(map)[0] ?? null;
  }

  if (!physical) return null;
  return {
    x: physical.widthMm / templateSize.width,
    y: physical.heightMm / templateSize.height,
  };
}
