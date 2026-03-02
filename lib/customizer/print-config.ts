/**
 * Parses a string or null value into a tuple of two numbers.
 *
 * The function first attempts to parse the input as JSON. If the result is an array
 * with at least two elements, it converts the first two elements to numbers and returns
 * them as a tuple if both are finite numbers.
 *
 * If JSON parsing fails or does not yield a valid pair, the function falls back to
 * extracting the first two integer-like substrings from the input using a regular expression.
 * These are then converted to numbers and returned as a tuple if both are finite.
 *
 * @param raw - The input string or null to parse.
 * @returns A tuple of two numbers if parsing succeeds, or `null` otherwise.
 */
function parseNumberPair(raw?: string | null): [number, number] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      const a = Number(parsed[0]);
      const b = Number(parsed[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) return [a, b];
    }
  } catch {}

  const matches = String(raw).match(/-?\d+/g);
  if (!matches || matches.length < 2) return null;
  const [a, b] = matches.slice(0, 2).map((s) => Number(s));
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b];
}

export interface PrintSurface {
  name: string;
  isCustomizable: boolean;

  // percentages 0..100
  widthPct: number;
  heightPct: number;

  // offset as percentage from top-left
  offsetPct: { x: number; y: number };
  previewImageUrl?: string | null;
  templateSize?: { width: number; height: number } | null;
  templateKey?: string | null;
}

/**
 * Parses a raw print zone configuration object and returns a normalized `PrintSurface` object.
 *
 * This function extracts and validates the print zone's name, customizable status, dimensions,
 * offset, preview image URL, template size, and template key. Dimensions and offsets are interpreted
 * as percentages (0..100) and clamped to valid ranges. Template size is clamped between 360 and 800.
 * Returns `null` if required fields are missing or invalid.
 *
 * @param raw - The raw print zone configuration object, possibly containing string values for
 *              name, isCustomizable, dimensions, offset, previewImageUrl, templateSize, and templateKey.
 * @returns A normalized `PrintSurface` object if parsing succeeds, or `null` if required fields are missing or invalid.
 */
export function parsePrintZone(raw: {
  name?: string | null;
  isCustomizable?: string | null;
  dimensions?: string | null;
  offset?: string | null;
  previewImageUrl?: string | null;
  templateSize?: string | null;
  templateKey?: string | null;
}): PrintSurface | null {
  if (!raw.name) return null;

  const dims = parseNumberPair(raw.dimensions ?? null);
  const offs = parseNumberPair(raw.offset ?? null);
  if (!dims || !offs) return null;
  const templateDims = parseNumberPair(raw.templateSize ?? null);

  // Interpret values as percentages (0..100). Clamp defensively.
  const widthPct = Math.min(Math.max(dims[0], 0), 100);
  const heightPct = Math.min(Math.max(dims[1], 0), 100);
  const offsetX = Math.min(Math.max(offs[0], 0), 100);
  const offsetY = Math.min(Math.max(offs[1], 0), 100);

  const isCustomizable = String(raw.isCustomizable ?? "true").toLowerCase() === "true";
  const templateSize =
    templateDims && templateDims[0] > 0 && templateDims[1] > 0
      ? {
          width: Math.min(Math.max(templateDims[0], 360), 800),
          height: Math.min(Math.max(templateDims[1], 360), 800),
        }
      : null;

  return {
    name: String(raw.name),
    isCustomizable,
    widthPct,
    heightPct,
    offsetPct: { x: offsetX, y: offsetY },
    previewImageUrl: raw.previewImageUrl ?? null,
    templateSize,
    templateKey: raw.templateKey ?? null,
  };
}
