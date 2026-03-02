export type TemplatePhysicalSize = {
  widthMm: number;
  heightMm: number;
};

export type TemplateSizeKey = "xs" | "s" | "m" | "l" | "xl" | "2xl";

export type TemplateSideKey = "t-shirt-front" | "t-shirt-back";

export type TemplateSideMap = Record<TemplateSizeKey, TemplatePhysicalSize>;

export type TemplatePhysicalSizeMap = Record<TemplateSideKey, TemplateSideMap>;

/**
 * A mapping of print template names to their physical sizes for various garment sizes.
 *
 * Each template (e.g., "tshirt-back", "tshirt-front") contains size keys (e.g., xs, s, m, l, xl, 2xl),
 * which map to an object specifying the width and height in millimeters.
 *
 * Example usage:
 * ```typescript
 * const size = TEMPLATE_PHYSICAL_SIZES["tshirt-back"].m;
 * // size: { widthMm: number, heightMm: number }
 * ```
 *
 * @remarks
 * This map is used to determine the printable area for each template and garment size.
 */
export const TEMPLATE_PHYSICAL_SIZES: TemplatePhysicalSizeMap = {
  "t-shirt-back": {
    xs: { widthMm: 470, heightMm: 700 },
    s: { widthMm: 520, heightMm: 740 },
    m: { widthMm: 560, heightMm: 770 },
    l: { widthMm: 610, heightMm: 810 },
    xl: { widthMm: 640, heightMm: 840 },
    "2xl": { widthMm: 680, heightMm: 870 },
  },
  "t-shirt-front": {
    xs: { widthMm: 470, heightMm: 700 },
    s: { widthMm: 520, heightMm: 740 },
    m: { widthMm: 560, heightMm: 770 },
    l: { widthMm: 610, heightMm: 810 },
    xl: { widthMm: 640, heightMm: 840 },
    "2xl": { widthMm: 680, heightMm: 870 },
  },
};

/**
 * Retrieves the physical size configuration for a given template side and size.
 *
 * @param side - The key representing the template side (e.g., front, back). Can be a `TemplateSideKey`, `string`, `null`, or `undefined`.
 * @param size - The key representing the template size (e.g., small, medium, large). Can be a `TemplateSizeKey`, `string`, `null`, or `undefined`.
 * @returns The corresponding `TemplatePhysicalSize` object if both side and size are valid and found; otherwise, returns `null`.
 */
export function getTemplatePhysicalSize(
  side: TemplateSideKey | string | null | undefined,
  size: TemplateSizeKey | string | null | undefined
): TemplatePhysicalSize | null {
  if (!side || !size) return null;

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedSide = normalize(String(side));
  const normalizedSize = normalize(String(size));

  const sideEntry = Object.entries(TEMPLATE_PHYSICAL_SIZES).find(
    ([key]) => normalize(key) === normalizedSide
  );
  if (!sideEntry) return null;

  const sizeEntry = Object.entries(sideEntry[1]).find(([key]) => normalize(key) === normalizedSize);

  return sizeEntry ? sizeEntry[1] : null;
}
