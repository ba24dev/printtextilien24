// Encapsulates logic for customer-account API scopes.

// list of all scopes currently mentioned in Shopify docs / UI for public clients.
// keep this in sync with what you enable in the store. including write perms
// even though public clients typically won't use them; helps validation.
export const KNOWN_SCOPES = [
  "openid",
  "email",
  "customer_read_customers",
  "customer_write_customers",
  "customer_read_orders",
  "customer_write_orders",
  "customer_read_draft_orders",
  "customer_write_draft_orders",
  "customer_read_store_credit_accounts",
  "customer_read_store_credit_account_transactions",
  "customer_read_markets",
  "customer_read_companies",
  "customer_write_companies",
  "customer_read_subscription_contracts",
  "customer_write_subscription_contracts",
  // the newer GraphQL Customer Account API uses a single catch-all scope
  // instead of the granular permissions above. we accept it for compatibility
  "customer-account-api:full",
];

// read scopes from env var, falling back to the previous default.
export const SCOPES = process.env.SHOPIFY_CUSTOMER_API_SCOPES || "customer-account-api:full";

/**
 * Split a space-separated scope string into an array of tokens.
 */
export function parseScopes(scopes: string): string[] {
  // allow both spaces and commas as separators
  return scopes
    .trim()
    .split(/[\s,]+/) // split on whitespace or commas
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Normalize a raw scope string into a space-separated list with duplicates
 * removed.  Shopify's authorization endpoint expects scopes separated by
 * spaces; commas will cause a "malformed" error, so we convert them here.
 */
export function normalizeScopes(scopes: string): string {
  const tokens = parseScopes(scopes);
  // preserve original order but dedupe
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const t of tokens) {
    if (!seen.has(t)) {
      seen.add(t);
      cleaned.push(t);
    }
  }
  return cleaned.join(" ");
}

/**
 * Returns a list of scopes that are not recognised (i.e. not in KNOWN_SCOPES).
 */
export function unknownScopes(scopes: string): string[] {
  const tokens = parseScopes(scopes);
  return tokens.filter((s) => !KNOWN_SCOPES.includes(s));
}
