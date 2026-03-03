// helpers for dealing with Shopify Customer Account API tokens

/**
 * The Customer Account API requires tokens to be prefixed with "shcat_" and
 * sent directly in the Authorization header (no "Bearer" prefix).  Shopify's
 * oauth/token response sometimes returns tokens without the prefix, and it's
 * easy for callers to accidentally reuse a raw string with a Bearer header.
 *
 * This utility normalizes the value so other code can assume the correct
 * format.
 */
export function formatAccessToken(token: string): string {
  if (!token) return token;
  // strip leading Bearer if present
  const cleaned = token.trim().replace(/^Bearer\s+/i, "");
  if (cleaned.startsWith("shcat_")) return cleaned;
  return `shcat_${cleaned}`;
}
