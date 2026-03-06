export const CUSTOMER_QUERY = `
  query Customer {
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

export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders {
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
