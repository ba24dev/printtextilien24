import { shopifyRequest } from "./client";
import { SHOP_PRIVACY_POLICY_QUERY } from "./queries/shop";

interface ShopPrivacyPolicyResult {
  shop: {
    privacyPolicy: {
      body: string;
      url: string;
    } | null;
  };
}

export async function fetchShopPrivacyPolicy(): Promise<{
  body: string;
  url: string;
} | null> {
  try {
    const data = await shopifyRequest<ShopPrivacyPolicyResult>({
      query: SHOP_PRIVACY_POLICY_QUERY,
      cache: "no-store",
    });

    return data.shop.privacyPolicy ?? null;
  } catch (err) {
    console.error("[fetchShopPrivacyPolicy]", err);
    return null;
  }
}
