export const CUSTOMER_QUERY = `
  query Customer {
    customer {
      id
      displayName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      imageUrl
      firstName
      lastName
      tags
      defaultAddress {
        id
      }
      addresses(first: 10) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          zip
          territoryCode
          zoneCode
          phoneNumber
          formatted
        }
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders {
    customer {
      orders(first: 10) {
        edges {
          node {
            id
            name
            processedAt
            statusPageUrl
            financialStatus
            cancelledAt
            cancelReason
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              nodes {
                id
                title
                quantity
                variantId
              }
              pageInfo {
                hasNextPage
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_QUERY_FALLBACK = `
  query CustomerFallback {
    customer {
      id
      emailAddress {
        emailAddress
      }
      firstName
      lastName
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY_FALLBACK = `
  query CustomerOrdersFallback {
    customer {
      orders(first: 10) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_TAGS_QUERY = `
  query CustomerTags {
    customer {
      id
      tags
    }
  }
`;

export const CUSTOMER_TAGS_QUERY_FALLBACK = `
  query CustomerTagsFallback {
    customer {
      id
    }
  }
`;
