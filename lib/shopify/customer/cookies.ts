function normalizeCookieDomain(raw: string): string {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) return "";
  return trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
}

export function getCustomerCookieDomain(): string | undefined {
  const raw =
    process.env.SHOPIFY_CUSTOMER_COOKIE_DOMAIN ??
    process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_COOKIE_DOMAIN;
  if (!raw) return undefined;

  const normalized = normalizeCookieDomain(raw);
  if (!normalized) return undefined;
  // reject protocol/path formats and invalid host chars to avoid browser silently dropping cookies
  const validHostPattern = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;
  if (!validHostPattern.test(normalized)) {
    console.warn(
      "Ignoring invalid SHOPIFY_CUSTOMER_COOKIE_DOMAIN. Expected hostname like '.example.com'.",
    );
    return undefined;
  }
  return `.${normalized}`;
}
