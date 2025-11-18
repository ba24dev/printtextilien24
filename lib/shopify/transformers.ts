import { parsePrintZone, PrintSurface } from "../customizer/print-config";
import {
  CollectionEdge,
  PrintZoneMetafield,
  ProductSummaryEdge,
  ShopifyProduct,
} from "./transport";
import { CollectionSummary, ProductSummary } from "./types";

/**
 * Builds an array of print surfaces based on the provided print zone metafield.
 *
 * @param printZone - The print zone metafield containing details about the print surface.
 *                    This can be undefined or null if no print zone is provided.
 * @returns An array containing a single print surface object if the print zone reference is valid,
 *          or `undefined` if the reference is missing or invalid.
 */
function buildPrintSurfaces(
  printZone?: PrintZoneMetafield | null
): ProductSummary["printSurfaces"] {
  const reference = printZone?.reference;
  if (!reference) return undefined;

  const surface = parsePrintZone({
    name: reference.name?.value ?? null,
    isCustomizable: reference.isCustomizable?.value ?? null,
    dimensions: reference.dimensions?.value ?? null,
    position: reference.position?.value ?? null,
    previewImageUrl: reference.previewImage?.reference?.image?.url ?? null,
  });

  return surface ? [surface] : undefined;
}

type MetaobjectNode = {
  nameField?: { value?: string | null } | null;
  isCustomizableField?: { value?: string | null } | null;
  dimensionsField?: { value?: string | null } | null;
  positionField?: { value?: string | null } | null;
  previewImageField?: {
    reference?: { image?: { url: string | null } | null } | null;
  } | null;
};

/**
 * Extracts print surfaces from a Shopify product.
 *
 * This function processes a Shopify product object and attempts to extract
 * print surface information from its `printZone` metafield. If the `printZone`
 * metafield or its reference is missing, an empty array is returned.
 *
 * @param product - The Shopify product object to extract print surfaces from.
 *                  It can be `null` or a product object with an optional `printZone` metafield.
 * @returns An array of `PrintSurface` objects. If no valid print surface is found,
 *          an empty array is returned.
 */
export function extractPrintSurfacesFromProduct(
  product: ShopifyProduct | null
): PrintSurface[] {
  const reference = (
    product as ShopifyProduct & { printZone?: PrintZoneMetafield | null }
  )?.printZone?.reference;

  if (!reference) return [];

  const surface = parsePrintZone({
    name: reference.name?.value ?? null,
    isCustomizable: reference.isCustomizable?.value ?? null,
    dimensions: reference.dimensions?.value ?? null,
    position: reference.position?.value ?? null,
    previewImageUrl: reference.previewImage?.reference?.image?.url ?? null,
  });

  return surface ? [surface] : [];
}

/**
 * Transforms a `ProductSummaryEdge` object into a `ProductSummary` object.
 *
 * @param edge - The `ProductSummaryEdge` object containing product data to be transformed.
 * @returns A `ProductSummary` object with the mapped product details.
 */
function mapProductSummaryEdge(edge: ProductSummaryEdge): ProductSummary {
  return {
    id: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    priceRange: {
      minVariantPrice: {
        amount: edge.node.priceRange.minVariantPrice.amount,
        currencyCode: edge.node.priceRange.minVariantPrice.currencyCode,
      },
    },
    featuredImage: edge.node.featuredImage
      ? {
          id: edge.node.featuredImage.id,
          url: edge.node.featuredImage.url,
          altText: edge.node.featuredImage.altText,
        }
      : null,
    printSurfaces: buildPrintSurfaces(edge.node.printZone),
  };
}

/**
 * Transforms a Shopify `CollectionEdge` object into a `CollectionSummary` object.
 *
 * @param edge - The `CollectionEdge` object to transform. It contains information about a collection,
 * including its ID, title, handle, and associated products.
 * @returns A `CollectionSummary` object containing the collection's ID, title, handle, and a list of
 * transformed product summaries.
 */
export function mapCollectionEdge(edge: CollectionEdge): CollectionSummary {
  return {
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    products: edge.node.products.edges.map(mapProductSummaryEdge),
  };
}
