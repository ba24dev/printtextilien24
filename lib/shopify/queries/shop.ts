export const SHOP_PRIVACY_POLICY_QUERY = `#graphql
  query ShopPrivacyPolicy {
    shop {
      privacyPolicy {
        body
        url
      }
    }
  }
`;
