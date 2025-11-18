import {
  CurrencyCode,
  Product,
} from "@shopify/hydrogen-react/storefront-api-types";
import type { PartialDeep } from "type-fest";

export type ProductSummaryEdge = {
  node: {
    id: string;
    handle: string;
    title: string;
    printZone?: PrintZoneMetafield | null;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: CurrencyCode;
      };
    };
    featuredImage: {
      id: string;
      url: string;
      altText: string | null;
    } | null;
  };
};

export type CollectionEdge = {
  node: {
    id: string;
    title: string;
    handle: string;
    products: {
      edges: ProductSummaryEdge[];
    };
  };
};

export type CollectionsResult = {
  collections: {
    edges: CollectionEdge[];
  };
};

export type ProductVariantEdge = {
  node: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    price: {
      amount: string;
      currencyCode: CurrencyCode;
    };
  };
};

export type ProductImageEdge = {
  node: {
    id: string;
    url: string;
    altText: string | null;
  };
};

export type ShopifyProduct = PartialDeep<Product, { recurseIntoArrays: true }>;

export type ProductByHandleResult = {
  productByHandle: ShopifyProduct | null;
};

export type CollectionByHandleResult = {
  collection: CollectionEdge["node"] | null;
};

export type PrintZoneMetafield = {
  reference?: {
    handle?: string | null;
    name?: { value?: string | null } | null;
    isCustomizable?: { value?: string | null } | null;
    dimensions?: { value?: string | null } | null;
    position?: { value?: string | null } | null;
    previewImage?: {
      reference?: {
        image?: { url: string | null } | null;
      } | null;
    } | null;
  } | null;
};
