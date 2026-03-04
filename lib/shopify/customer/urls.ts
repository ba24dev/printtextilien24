// helpers for constructing the various endpoints used by the
// Customer Account OAuth flow.  Shopify’s authentication service assigns a
// numeric identifier to your Customer Account API client, and it *must* be
// included verbatim in the URL.  There is no reliable way for us to derive
// that number from the opaque UUID client ID, so the full URL is required
// in the environment.  In other words: you can’t build these endpoints from
// the shop domain or the client id.

function requiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `${name} is required for Customer Account OAuth and must be set to the full Shopify URL (including the numeric identifier)`,
    );
  }
  return val;
}

export function getShopifyClientId(): string {
  const id = process.env.SHOPIFY_CUSTOMER_API_CLIENT_ID;
  if (!id) {
    throw new Error("SHOPIFY_CUSTOMER_API_CLIENT_ID is required");
  }
  return id;
}

export function getShopifyAuthUrl(): string {
  return requiredEnv("SHOPIFY_CUSTOMER_API_AUTH_URL");
}

export function getShopifyTokenUrl(): string {
  return requiredEnv("SHOPIFY_CUSTOMER_API_TOKEN_URL");
}

export function getShopifyLogoutUrl(): string {
  // logout URL is optional; if not provided we simply redirect locally
  return process.env.SHOPIFY_CUSTOMER_API_LOGOUT_URL || "";
}
