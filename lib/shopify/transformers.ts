import { CollectionEdge, ProductSummaryEdge } from "./transport";
import { CollectionSummary, ProductSummary } from "./types";

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
  };
}

export function mapCollectionEdge(edge: CollectionEdge): CollectionSummary {
  return {
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    products: edge.node.products.edges.map(mapProductSummaryEdge),
  };
}
