const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isShopifyCustomerAuthV2Enabled(): boolean {
  const raw = process.env.SHOPIFY_CUSTOMER_AUTH_V2;
  if (!raw) return true;
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}
