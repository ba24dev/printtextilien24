"use client";
import { copy } from "@/config/copy";
import { CartProvider, ShopifyProvider } from "@shopify/hydrogen-react";
import type {
  CountryCode,
  LanguageCode,
} from "@shopify/hydrogen-react/storefront-api-types";

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;
const storefrontToken =
  process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_API_TOKEN;
const storefrontApiVersion =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION;

const countryIsoCode =
  (process.env.NEXT_PUBLIC_SHOPIFY_COUNTRY_ISO_CODE as
    | CountryCode
    | undefined) ?? "DE";
const languageIsoCode =
  (process.env.NEXT_PUBLIC_SHOPIFY_LANGUAGE_ISO_CODE as
    | LanguageCode
    | undefined) ?? "DE";

if (!storeDomain || !storefrontToken || !storefrontApiVersion) {
  throw new Error(copy.errors.missingShopifyConfig);
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const resolvedStoreDomain = unquote(storeDomain);
const resolvedStorefrontToken = unquote(storefrontToken);
const resolvedStorefrontApiVersion = unquote(storefrontApiVersion);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopifyProvider
      storeDomain={resolvedStoreDomain}
      storefrontToken={resolvedStorefrontToken}
      storefrontApiVersion={resolvedStorefrontApiVersion}
      countryIsoCode={countryIsoCode}
      languageIsoCode={languageIsoCode}
    >
      <CartProvider>{children}</CartProvider>
    </ShopifyProvider>
  );
}
