import { COMMON_FIELDS } from "./common";
import { FEATURED_IMAGE_FIELDS } from "./image";

/**
 * GraphQL fragment for retrieving print zone metafield information from Shopify.
 *
 * This fragment fetches the metafield with namespace "custom" and key "print", including:
 * - Basic metafield properties: `id`, `namespace`, `key`, `type`, `value`
 * - Reference to a Metaobject containing:
 *   - `handle`: Unique identifier for the metaobject
 *   - `name`: Name of the print zone
 *   - `isCustomizable`: Indicates if the print zone is customizable
 *   - `dimensions`: Dimensions of the print zone
 *   - `offset`: Offset of the print zone
 *   - `previewImage`: Reference to a preview image, including its URL
 *
 * This fragment is intended for use in Shopify Storefront API queries to retrieve detailed print zone data for products.
 */
export const PRINT_ZONE_FIELDS = `
  printZone: metafield(namespace: "custom", key: "print") {
    id
    namespace
    key
    type
    value
    reference {
      ... on Metaobject {
        handle
        name: field(key: "name") { value }
        isCustomizable: field(key: "is_customizable") { value }
        dimensions: field(key: "dimensions") { value }
        offset: field(key: "offset") { value }
        templateSize: field(key: "template_size") { value }
        previewImage: field(key: "previewImageUrl") {
          reference {
            ... on MediaImage {
              image { url }
            }
          }
        }
      }
    }
 }
`;

export const MONEY_FIELDS = `
  amount
  currencyCode
`;

export const PRICE_RANGE_FIELDS = `
  priceRange {
    minVariantPrice {
      ${MONEY_FIELDS}
    }
  }
`;

export const PRODUCT_CARD_FIELDS = `
  ${COMMON_FIELDS}
  collections(first: 5) {
    nodes {
      title
    }
  }
  ${PRINT_ZONE_FIELDS}
  ${PRICE_RANGE_FIELDS}
  ${FEATURED_IMAGE_FIELDS}
`;

export const VARIANT_FIELDS = `
  id
  title
  availableForSale
  selectedOptions {
    name
    value
  }
  price {
    ${MONEY_FIELDS}
  }
`;
