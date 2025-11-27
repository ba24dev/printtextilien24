import { useEffect, useState } from "react";

import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";

type Props = {
  scale: number;
  maxScale: number;
  minScale: number;
  baseScale: number | null;
  metadata: PrintCustomizationMetadata;
  mmPerPx: { x: number; y: number } | null;
  placedSizeMm: { width: number; height: number } | null;
  naturalSizeMm: { widthMm: number; heightMm: number } | null;
  surfaceSizeMm: { width: number; height: number } | null;
  maxPosMm: { x: number; y: number } | null;
  setPositionMm: (x: number, y: number) => void;
  onScaleChange: (value: number) => void;
  onFileSelect: (file: File | null) => void;
};

export function PlacementControls({
  scale,
  maxScale,
  minScale,
  baseScale,
  metadata,
  mmPerPx,
  placedSizeMm,
  naturalSizeMm,
  surfaceSizeMm,
  maxPosMm,
  setPositionMm,
  onScaleChange,
  onFileSelect,
}: Props) {
  const [widthInput, setWidthInput] = useState<string>("");
  const [isEditingWidth, setIsEditingWidth] = useState(false);

  const rawSliderValue = baseScale ? (scale / baseScale) * 100 : scale * 100;
  const rawSliderMin = baseScale ? (minScale / baseScale) * 100 : minScale;
  const rawSliderMax = baseScale ? (maxScale / baseScale) * 100 : maxScale;
  const sliderMin = Math.max(0, Math.ceil(rawSliderMin));
  const sliderMax = Math.max(sliderMin, Math.floor(rawSliderMax));
  const sliderValue = Math.min(sliderMax, Math.max(sliderMin, rawSliderValue));
  const divisor = baseScale || 1;
  const minWidthMm = naturalSizeMm ? naturalSizeMm.widthMm * (minScale / divisor) : null;
  const maxWidthMm = naturalSizeMm ? naturalSizeMm.widthMm * (maxScale / divisor) : null;

  useEffect(() => {
    if (!naturalSizeMm?.widthMm) return;
    if (!isEditingWidth) return;
    const timeout = setTimeout(() => {
      const targetWidth = Number(widthInput);
      if (!Number.isFinite(targetWidth) || targetWidth <= 0) return;
      const desiredScale = (targetWidth / naturalSizeMm.widthMm) * divisor;
      onScaleChange(desiredScale);
    }, 250);
    return () => clearTimeout(timeout);
  }, [divisor, isEditingWidth, naturalSizeMm?.widthMm, onScaleChange, widthInput]);

  const positionLabel = (() => {
    if (metadata.positionMm) {
      return `${Math.round(metadata.positionMm.x)} mm, ${Math.round(metadata.positionMm.y)} mm`;
    }
    return `${Math.round(metadata.xMm)}%, ${Math.round(metadata.yMm)}%`;
  })();

  return (
    <div className="grid w-full grid-cols-1 gap-3">
      <form id="placement-controls" className="flex flex-col gap-2">
        <label
          className="w-full flex flex-col items-center px-4 py-6 text-secondary-200 dark:bg-secondary-200 dark:text-secondary-800 rounded-lg shadow-lg tracking-wide uppercase border border-primary-500 cursor-pointer hover:bg-primary-200 hover:text-primary-800 transition-colors duration-300 ease-in-out"
          htmlFor="file_input"
        >
          <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className="mt-2 text-base leading-normal">Select a file</span>
          <input
            type="file"
            className="hidden"
            aria-describedby="file_input_help"
            id="file_input"
            accept="image/*"
            onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
          SVG, PNG, JPG (min. DPI 150).
        </p>

        <label className="text-xs" htmlFor="scale">
          Skalierung (% der Originalgroesse)
        </label>
        <input
          id="scale"
          type="range"
          min={sliderMin || 0}
          max={sliderMax || 0}
          step={1}
          value={Number.isFinite(sliderValue) ? sliderValue : 0}
          onChange={(e) => {
            const pct = Number(e.target.value);
            const desiredScale = baseScale ? (pct / 100) * baseScale : pct;
            onScaleChange(desiredScale);
          }}
          disabled={!maxScale}
        />
        {mmPerPx && naturalSizeMm ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-foreground/60">Breite (mm)</span>
            <input
              type="number"
              min={1}
              value={isEditingWidth ? widthInput : placedSizeMm?.width ? Math.round(placedSizeMm.width) : ""}
              onFocus={() => setIsEditingWidth(true)}
              onBlur={(e) => {
                setIsEditingWidth(false);
                setWidthInput(e.target.value);
              }}
              onChange={(e) => setWidthInput(e.target.value)}
              className="w-24 rounded border px-2 py-1 text-sm"
            />
            <span className="text-[11px] text-foreground/60">Min: {minWidthMm ? Math.round(minWidthMm) : 0} mm</span>
            <span className="text-[11px] text-foreground/60">Max: {maxWidthMm ? Math.round(maxWidthMm) : 0} mm</span>
          </div>
        ) : null}

        <div className="text-xs text-foreground/60">Position: {positionLabel}</div>

        <div className="text-xs text-foreground/60">
          Bildgroesse:{" "}
          {placedSizeMm ? `${Math.round(placedSizeMm.width)} x ${Math.round(placedSizeMm.height)} mm` : "N/A"}
        </div>
        {surfaceSizeMm ? (
          <div className="text-xs text-foreground/60">
            Flaeche: {Math.round(surfaceSizeMm.width)} x {Math.round(surfaceSizeMm.height)} mm
          </div>
        ) : null}
        {naturalSizeMm ? (
          <div className="text-[11px] text-foreground/60">
            Original: {Math.round(naturalSizeMm.widthMm)} x {Math.round(naturalSizeMm.heightMm)} mm
          </div>
        ) : null}
        {mmPerPx && maxPosMm ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-foreground/60">X-Pos (mm)</span>
              <input
                type="number"
                step="1"
                min={0}
                max={Math.max(0, Math.floor(maxPosMm.x))}
                value={Math.round(metadata.positionMm?.x ?? 0)}
                onChange={(e) => setPositionMm(Number(e.target.value) || 0, metadata.positionMm?.y ?? 0)}
                className="rounded border px-2 py-1 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-foreground/60">Y-Pos (mm)</span>
              <input
                type="number"
                step="1"
                min={0}
                max={Math.max(0, Math.floor(maxPosMm.y))}
                value={Math.round(metadata.positionMm?.y ?? 0)}
                onChange={(e) => setPositionMm(metadata.positionMm?.x ?? 0, Number(e.target.value) || 0)}
                className="rounded border px-2 py-1 text-sm"
              />
            </label>
          </div>
        ) : null}
      </form>
    </div>
  );
}
