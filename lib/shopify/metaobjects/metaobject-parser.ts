import { parsePrintZone, PrintSurface } from "../../customizer/print-config";
import { PrintZoneMetafield, ShopifyProduct } from "../transport";
import {
  DIMENSION_KEYS,
  HEIGHT_KEYS,
  IS_CUSTOMIZABLE_KEYS,
  NAME_KEYS,
  OFFSET_KEYS,
  TEMPLATE_SIZE_KEYS,
  WIDTH_KEYS,
} from "./metaobject-fields";

type UnknownRecord = Record<string, unknown>;

/**
 * Retrieves the first non-null string value from the specified keys in the given object.
 *
 * For each key in `keys`, this function checks if the corresponding value in `obj` is a string.
 * If not, it checks if the value is an object with a string property named `value`.
 * Returns the first found string, or `null` if none are found or if `obj` is undefined.
 *
 * @param obj - The object to search for string values.
 * @param keys - An array of keys to check in the object.
 * @returns The first found string value, or `null` if none are found.
 */
function getField(obj: UnknownRecord | undefined, keys: readonly string[]): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k] as unknown;
    if (v == null) continue;
    if (typeof v === "string") return v;
    const maybe = v as UnknownRecord | undefined;
    if (maybe && typeof maybe.value === "string") return maybe.value;
  }
  return null;
}

/**
 * Retrieves the preview image URL from a nested metaobject node structure.
 *
 * Traverses the following property path within the provided node:
 * `previewImage.reference.image.url`.
 *
 * @param node - The metaobject node containing preview image information.
 * @returns The preview image URL as a string if available, otherwise `null`.
 */
function getPreviewImageUrl(node: UnknownRecord): string | null {
  const preview = node["previewImage"] as UnknownRecord | undefined;
  const reference = preview?.["reference"] as UnknownRecord | undefined;
  const image = reference?.["image"] as UnknownRecord | undefined;
  const url = image?.["url"] as unknown;
  return typeof url === "string" ? url : null;
}

/**
 * Parses an array of metaobject nodes and converts them into an array of `PrintSurface` objects.
 *
 * Each node is expected to contain fields representing surface properties such as name, dimensions,
 * offset, and preview image URL. The function attempts to extract these fields using helper functions
 * and constructs a `PrintSurface` object for each valid node.
 *
 * @param nodes - An array of metaobject nodes to parse, or `undefined`. Each node should be an object
 *                containing relevant surface data.
 * @returns An array of `PrintSurface` objects parsed from the input nodes. Returns an empty array if
 *          the input is `undefined` or empty.
 */
export function parseMetaobjectsToSurfaces(nodes: unknown[] | undefined): PrintSurface[] {
  if (!nodes || nodes.length === 0) return [];

  const out: PrintSurface[] = [];
  for (const raw of nodes) {
    const node = raw as UnknownRecord;
    const name = getField(node, NAME_KEYS) ?? null;
    const isCustomizable = getField(node, IS_CUSTOMIZABLE_KEYS) ?? "true";
    let dimensions = getField(node, DIMENSION_KEYS);
    if (!dimensions) {
      const w = getField(node, WIDTH_KEYS);
      const h = getField(node, HEIGHT_KEYS);
      if (w && h) dimensions = `${w} ${h}`;
    }

    const offset = getField(node, OFFSET_KEYS) ?? null;
    const previewUrl = getPreviewImageUrl(node);
    const templateSize = getField(node, TEMPLATE_SIZE_KEYS) ?? null;
    const templateKey = (node["handle"] as string | undefined) ?? null;

    const surface = parsePrintZone({
      name,
      isCustomizable,
      dimensions,
      offset,
      previewImageUrl: previewUrl,
      templateSize,
      templateKey,
    });

    if (surface) out.push(surface);
  }

  return out;
}

/**
 * Parses the `printZone` metafield from a Shopify product and extracts an array of print zone IDs.
 *
 * This function attempts to retrieve the `printZone` metafield from the given product,
 * parses its `value` as JSON, and returns an array of non-empty string IDs.
 * If the metafield is missing, the value is not a string, or parsing fails,
 * an empty array is returned.
 *
 * @param product - The Shopify product object containing the `printZone` metafield.
 * @returns An array of non-empty string IDs representing print zones, or an empty array if none are found.
 */
export function parsePrintZoneIds(product: ShopifyProduct): string[] {
  const meta = (product as unknown as { printZone?: PrintZoneMetafield }).printZone;
  const rawValue = (meta as unknown as { value?: unknown })?.value;
  if (typeof rawValue !== "string") return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}
