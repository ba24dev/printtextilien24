import { MoneyV2 } from "@shopify/hydrogen-react/storefront-api-types";

export interface ProductImage {
    id: string;
    url: string;
    altText: string | null;
}

export interface ProductVariant {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
    price: MoneyV2;
}

export interface ProductSummary {
    id: string;
    handle: string;
    title: string;
    description?: string;
    priceRange: {
        minVariantPrice: MoneyV2;
    };
    featuredImage: ProductImage | null;
}

export interface CollectionSummary {
    id: string;
    handle: string;
    title: string;
    products: ProductSummary[];
}

export interface ProductDetail extends ProductSummary {
    descriptionHtml: string;
    images: ProductImage[];
    variants: ProductVariant[];
}
