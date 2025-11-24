import { IMAGE_FIELDS } from "../fragments/image";
import { PRODUCT_CARD_FIELDS } from "../fragments/product";
import { COMMON_FIELDS } from "./../fragments/common";

/**
 * GraphQL query for fetching Shopify collections and their products.
 *
 * @param {number} collectionsFirst - The number of collections to fetch.
 * @param {number} productsFirst - The number of products to fetch per collection.
 *
 * The query retrieves:
 * - Collection details: `id`, `title`, `handle`
 * - Products within each collection, including shared product card fields
 *
 * @remarks
 * Product fields are pulled from a shared string fragment (`PRODUCT_CARD_FIELDS`)
 * to keep queries consistent and easier to update.
 */
export const COLLECTIONS_QUERY = `#graphql
  query GetCollections($collectionsFirst: Int!, $productsFirst: Int!) {
    collections(first: $collectionsFirst) {
      edges {
        node {
          ${COMMON_FIELDS}
          products(first: $productsFirst) {
            edges {
              node { ${PRODUCT_CARD_FIELDS} }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query string to fetch a Shopify collection by its handle, including collection details and a paginated list of products.
 *
 * @remarks
 * This query retrieves the collection's ID, title, description, handle, and image information.
 * For each product in the collection, it fetches the shared product card fields plus description.
 *
 * @example
 * ```typescript
 * const query = COLLECTION_BY_HANDLE_QUERY;
 * ```
 *
 * @param {String} $handle - The handle (unique identifier) of the collection to fetch.
 * @param {Int} $productsFirst - The number of products to retrieve from the collection.
 */
export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!, $productsFirst: Int!) {
    collection(handle: $handle) {
      ${COMMON_FIELDS}
      description
      image {
        ${IMAGE_FIELDS}
      }
      products(first: $productsFirst) {
        edges {
          node { ${PRODUCT_CARD_FIELDS} description }
        }
      }
    }
  }
`;
