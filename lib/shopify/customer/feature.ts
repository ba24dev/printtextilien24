const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isShopifyCustomerAuthV2Enabled(): boolean {
  const raw = process.env.SHOPIFY_CUSTOMER_AUTH_V2;
  if (!raw) return true;
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}

function hasRedisSessionStoreEnv(): boolean {
  return Boolean(
    process.env.SHOPIFY_SESSION_STORE?.trim().toLowerCase() === "redis" ||
      process.env.SHOPIFY_SESSION_STORE?.trim().toLowerCase() === "kv" ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      process.env.REDIS_URL ||
      process.env.KV_URL,
  );
}

export function isShopifyCustomerSessionStoreKvEnabled(): boolean {
  const raw = process.env.SHOPIFY_SESSION_STORE;
  if (raw) {
    const value = raw.trim().toLowerCase();
    if (value === "redis" || value === "kv") return true;
    if (TRUE_VALUES.has(value)) return true;
    return false;
  }

  return hasRedisSessionStoreEnv();
}
