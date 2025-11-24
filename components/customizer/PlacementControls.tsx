import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";

type Props = {
  scale: number;
  maxScale: number;
  metadata: PrintCustomizationMetadata;
  onScaleChange: (value: number) => void;
  onFileSelect: (file: File | null) => void;
};

export function PlacementControls({
  scale,
  maxScale,
  metadata,
  onScaleChange,
  onFileSelect,
}: Props) {
  const positionLabel = (() => {
    if (metadata.positionMm) {
      return `${Math.round(metadata.positionMm.x)} mm, ${Math.round(metadata.positionMm.y)} mm`;
    }
    return `${Math.round(metadata.xMm)}%, ${Math.round(metadata.yMm)}%`;
  })();

  return (
    <div className="grid w-full grid-cols-1 gap-3">
      <form
        id="placement-controls"
        className="flex flex-col gap-2"
      >
        <label
          className="w-full flex flex-col items-center px-4 py-6 text-secondary-200 dark:bg-secondary-200 dark:text-secondary-800 rounded-lg shadow-lg tracking-wide uppercase border border-primary-500 cursor-pointer hover:bg-primary-200 hover:text-primary-800 transition-colors duration-300 ease-in-out"
          htmlFor="file_input"
        >
          <svg
            className="w-8 h-8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
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
        <p
          className="mt-1 text-sm text-gray-500 dark:text-gray-300"
          id="file_input_help"
        >
          SVG, PNG, JPG (min. DPI 150).
        </p>

        <label
          className="text-xs"
          htmlFor="scale"
        >
          Skalierung
        </label>
        <input
          id="scale"
          type="range"
          min={0}
          max={maxScale || 0}
          step={0.01}
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          disabled={!maxScale}
        />

        <div className="text-xs text-foreground/60">Position: {positionLabel}</div>
      </form>
    </div>
  );
}
