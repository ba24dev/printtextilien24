import { FEATURED_IMAGE_FIELDS, IMAGE_FIELDS } from "../fragments/image";
import { PRICE_RANGE_FIELDS, PRINT_ZONE_FIELDS, VARIANT_FIELDS } from "../fragments/product";
import { COMMON_FIELDS } from "./../fragments/common";

/**
 * GraphQL query for fetching detailed information about a Shopify product by its handle.
 *
 * @param {String} $handle - The unique handle of the product to retrieve.
 * @param {Int} $imagesFirst - The number of product images to fetch.
 * @param {Int} $variantsFirst - The number of product variants to fetch.
 *
 * The query returns:
 * - Product ID, handle, title, description, vendor, product type, and tags.
 * - Price range (minimum variant price and currency).
 * - Featured image and a list of images (with ID, URL, and alt text).
 * - Product variants (with ID, title, availability, selected options, and price).
 * - Product options (name and values).
 * - Collections the product belongs to (ID, handle, and title).
 * - Additional fields defined by `PRINT_ZONE_FIELDS`.
 */
export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!, $imagesFirst: Int!, $variantsFirst: Int!) {
    productByHandle(handle: $handle) {
      ${COMMON_FIELDS}
      ${PRINT_ZONE_FIELDS}
      descriptionHtml
      vendor
      productType
      tags
      ${PRICE_RANGE_FIELDS}
      ${FEATURED_IMAGE_FIELDS}
      images(first: $imagesFirst) {
        nodes {
          ${IMAGE_FIELDS}
        }
      }
      variants(first: $variantsFirst) {
        nodes {
          ${VARIANT_FIELDS}
        }
      }
      options {
        name
        values
      }
      collections(first: 4) {
        nodes {
          id
          handle
          title
        }
      }
    }
  }
`;

/**
 * GraphQL query for searching Shopify products with pagination support.
 *
 * @remarks
 * Retrieves a list of products with basic details, including ID, handle, title, vendor, tags,
 * collections (up to 5 per product), price range, and featured image URL.
 * Supports cursor-based pagination via the `first` and `after` variables.
 *
 * @param {number} first - The number of products to fetch.
 * @param {string} [after] - The cursor for pagination to fetch products after the specified cursor.
 *
 * @returns
 * The query returns a paginated list of products, each with:
 * - `id`: Product ID
 * - `handle`: Product handle
 * - `title`: Product title
 * - `vendor`: Product vendor
 * - `tags`: Array of product tags
 * - `collections`: Array of up to 5 collections the product belongs to (title only)
 * - `priceRange`: Minimum variant price and currency code
 * - `featuredImage`: URL of the featured image
 * - `cursor`: Cursor for pagination
 * - `pageInfo`: Pagination info (`hasNextPage`, `endCursor`)
 */
export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          ${COMMON_FIELDS}
          vendor
          tags
          collections(first: 5) {
            nodes { title }
          }
          ${PRICE_RANGE_FIELDS}
          ${FEATURED_IMAGE_FIELDS}
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
