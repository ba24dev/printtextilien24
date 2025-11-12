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
