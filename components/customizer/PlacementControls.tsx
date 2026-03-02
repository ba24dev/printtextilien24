import { copy } from "@/config/copy";

type AnchorKey =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type Props = {
  anchorName: string;
  onFileSelect: (file: File | null) => void;
  onAnchorChange: (anchor: AnchorKey) => void;
  onReset: () => void;
};

export function PlacementControls({
  anchorName,
  onFileSelect,
  onAnchorChange,
  onReset,
}: Props) {
  return (
    <div className="w-full grid grid-cols-2 col-span-2 gap-4">
      <form id="placement-controls" className="flex flex-col gap-2">
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
          <span className="mt-2 text-base leading-normal">
            {copy.customizer.uploadLabel}
          </span>
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
          className="mt-1 text-xs text-gray-500 dark:text-gray-300 whitespace-pre-line"
          id="file_input_help"
        >
          {copy.customizer.uploadHelp}
        </p>
        <p
          className="mt-1 text-xs text-gray-500 dark:text-gray-300 whitespace-pre-line"
          id="file_input_help"
        >
          {copy.customizer.scalingInfo}
        </p>
      </form>
      <div className="gap-3">
        <div className="grid grid-cols-3 gap-1 self-start px-2 py-1 text-xs">
          {[
            { key: "top-left", label: "🡤" },
            { key: "top-center", label: "🡡" },
            { key: "top-right", label: "🡥" },
            { key: "middle-left", label: "🡠" },
            { key: "center", label: "⊙" },
            { key: "middle-right", label: "🡢" },
            { key: "bottom-left", label: "🡧" },
            { key: "bottom-center", label: "🡣" },
            { key: "bottom-right", label: "🡦" },
          ].map((opt) => {
            const active = anchorName === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                className={`btn-outline ${
                  active ? "btn-primary text-white" : "border-foreground/20"
                }`}
                onClick={() => onAnchorChange(opt.key as AnchorKey)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="col-span-2">
        <button
          type="button"
          className="rounded border border-foreground/20 px-3 py-1 text-xs text-foreground/70 hover:border-foreground/40 hover:text-foreground w-full"
          onClick={onReset}
        >
          {copy.customizer.reset}
        </button>
      </div>
    </div>
  );
}
