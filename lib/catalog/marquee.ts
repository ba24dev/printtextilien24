import { ProductSummary } from "../shopify/types";

export function buildMarqueeItems(products: ProductSummary[], copies: number) {
  return Array.from({ length: copies }, (_, copyIndex) =>
    products.map((product) => ({
      product,
      key: `${product.id}-${copyIndex}`,
    }))
  ).flat();
}
