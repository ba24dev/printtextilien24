import { parsePrintZone } from "../customizer/print-config";
import { CollectionEdge, PrintZoneMetafield, ProductSummaryEdge } from "./transport";
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
  // Accept either the primary printZone metafield or a fallback metafield
  const typed = printZone as PrintZoneMetafield | undefined;
  const reference = typed?.reference;
  if (!reference) return undefined;

  const surface = parsePrintZone({
    name: reference.name?.value ?? null,
    isCustomizable: reference.isCustomizable?.value ?? null,
    dimensions: reference.dimensions?.value ?? null,
    offset: reference.offset?.value ?? null,
    previewImageUrl: reference.previewImage?.reference?.image?.url ?? null,
  });

  return surface ? [surface] : undefined;
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
    collections: edge.node.collections?.nodes?.map((collection) => collection.title) ?? [],
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
