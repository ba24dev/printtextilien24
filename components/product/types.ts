import { PrintSurface } from "@/lib/customizer/print-config";
import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";
import { ShopifyProduct } from "@/lib/shopify/transport";

export type CustomizationState = {
  metadata: PrintCustomizationMetadata;
  attributes: { key: string; value: string }[];
};

export interface ProductViewProps {
  product: ShopifyProduct;
  printSurfaces?: PrintSurface[];
}
