import { PrintSurface } from "@/lib/customizer/print-config";

type Props = {
  surfaces: PrintSurface[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function SurfaceSelector({ surfaces, selectedIndex, onSelect }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="text-sm font-medium"
        htmlFor="surface-select"
      >
        Druckfläche
      </label>
      <select
        id="surface-select"
        value={selectedIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="ml-2 rounded-md border px-2 py-1 text-sm"
      >
        {surfaces.map((s, i) => (
          <option
            key={s.name ?? i}
            value={i}
            className="bg-secondary-800"
          >
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
