/**
 * GraphQL query to fetch metaobjects by their IDs from Shopify.
 *
 * This query retrieves nodes corresponding to the provided IDs and extracts
 * metaobject-specific fields such as `id`, `handle`, `name`, `isCustomizable`,
 * `dimensions`, `offset`, and a preview image URL if available.
 *
 * @param {Array<string>} ids - An array of Shopify metaobject IDs to query.
 * @returns {Metaobject[]} An array of metaobjects with their respective fields.
 */
export const METAOBJECTS_BY_ID_QUERY = `#graphql
  query MetaobjectsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        handle
        name: field(key: "name") { value }
        isCustomizable: field(key: "is_customizable") { value }
        dimensions: field(key: "dimensions") { value }
        offset: field(key: "offset") { value }
        templateSize: field(key: "template_size") { value }
        previewImage: field(key: "previewImageUrl") {
          reference {
            ... on MediaImage { image { url } }
          }
        }
      }
    }
  }
`;
