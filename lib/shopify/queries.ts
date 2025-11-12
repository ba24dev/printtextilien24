export const COLLECTIONS_QUERY = `#graphql
  query GetCollections($collectionsFirst: Int!, $productsFirst: Int!) {
    collections(first: $collectionsFirst) {
      edges {
        node {
          id
          title
          handle
          products(first: $productsFirst) {
            edges {
              node {
                id
                handle
                title
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!, $imagesFirst: Int!, $variantsFirst: Int!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        url
        altText
      }
      images(first: $imagesFirst) {
        nodes {
          id
          url
          altText
        }
      }
      variants(first: $variantsFirst) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
