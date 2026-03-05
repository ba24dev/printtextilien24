import { getShopifyStorefrontOrigin } from "@/lib/shopify/customer/urls";

const CHECKOUT_UNAVAILABLE_PATH = "/account?checkout_error=1";

function toRequestUrl(requestUrl?: URL | string): URL | null {
  if (!requestUrl) return null;
  if (requestUrl instanceof URL) return requestUrl;
  try {
    return new URL(requestUrl);
  } catch {
    return null;
  }
}

export function getCheckoutUnavailableRedirect(requestUrl: URL | string): string {
  return new URL(CHECKOUT_UNAVAILABLE_PATH, requestUrl.toString()).toString();
}

export function sanitizePostLoginRedirect(
  raw: string | null,
  requestUrl?: URL | string,
): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  const parsedRequestUrl = toRequestUrl(requestUrl);
  const storefrontOrigin = getShopifyStorefrontOrigin();
  const storefrontUrl = storefrontOrigin ? new URL(storefrontOrigin) : null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.startsWith("/checkouts/") && storefrontUrl) {
      const checkoutUrl = new URL(value, storefrontUrl);
      checkoutUrl.searchParams.set("logged_in", "true");
      return checkoutUrl.toString();
    }
    return value;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const allowedHosts = new Set<string>();
  if (parsedRequestUrl?.host) {
    allowedHosts.add(parsedRequestUrl.host);
  }
  if (storefrontUrl?.host) {
    allowedHosts.add(storefrontUrl.host);
  }

  if (parsed.pathname.startsWith("/checkouts/") && storefrontUrl) {
    parsed.protocol = storefrontUrl.protocol;
    parsed.host = storefrontUrl.host;
    parsed.searchParams.set("logged_in", "true");
    return parsed.toString();
  }

  if (!allowedHosts.has(parsed.host)) return null;
  return parsed.toString();
}

export function resolvePostLoginRedirect(postLogin: string | undefined, requestUrl: string): string {
  const fallback = new URL("/account", requestUrl).toString();
  if (!postLogin) return fallback;

  const sanitized = sanitizePostLoginRedirect(postLogin, requestUrl);
  if (!sanitized) {
    return getCheckoutUnavailableRedirect(requestUrl);
  }

  if (sanitized.startsWith("/") && !sanitized.startsWith("//")) {
    return new URL(sanitized, requestUrl).toString();
  }

  return sanitized;
}
