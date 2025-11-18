import { z } from "zod";

const numberPairSchema = z
  .string()
  .transform((value) => {
    const matches = value.match(/[-+]?\d+(\.\d+)?/g);
    if (!matches || matches.length < 2) {
      return [];
    }
    return matches.slice(0, 2).map((numeric) => Number(numeric));
  })
  .refine(
    (parts) => parts.length === 2 && parts.every((n) => Number.isFinite(n)),
    {
      message: "Expected two numeric values",
    }
  );

const rawPrintSurfaceSchema = z.object({
  name: z.string().min(1),
  isCustomizable: z
    .string()
    .optional()
    .transform((value) => value?.toLowerCase() === "true"),
  dimensions: numberPairSchema,
  position: numberPairSchema,
  previewImageUrl: z.string().url().optional(),
});

export interface PrintSurface {
  name: string;
  isCustomizable: boolean;
  widthMm: number;
  heightMm: number;
  originMm: { x: number; y: number };
  previewImageUrl?: string;
}

export function parsePrintZone(raw: {
  name?: string | null;
  isCustomizable?: string | null;
  dimensions?: string | null;
  position?: string | null;
  previewImageUrl?: string | null;
}): PrintSurface | null {
  if (!raw.name || !raw.dimensions || !raw.position) return null;

  const parsed = rawPrintSurfaceSchema.parse({
    name: raw.name,
    isCustomizable: raw.isCustomizable ?? undefined,
    dimensions: raw.dimensions,
    position: raw.position,
    previewImageUrl: raw.previewImageUrl ?? undefined,
  });

  const [widthMm, heightMm] = parsed.dimensions;
  const [xMm, yMm] = parsed.position;

  return {
    name: parsed.name,
    isCustomizable: parsed.isCustomizable ?? true,
    widthMm,
    heightMm,
    originMm: { x: xMm, y: yMm },
    previewImageUrl: parsed.previewImageUrl,
  };
}
