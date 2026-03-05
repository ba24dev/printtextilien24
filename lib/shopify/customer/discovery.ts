import {
  getShopifyCustomerApiDiscoveryUrl,
} from "@/lib/shopify/customer/urls";

type CustomerApiDiscovery = {
  graphql_api?: string;
};

type OidcConfiguration = {
  end_session_endpoint?: string;
};

let customerApiDiscoveryPromise: Promise<CustomerApiDiscovery | null> | null = null;
let oidcConfigurationPromise: Promise<OidcConfiguration | null> | null = null;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getCustomerApiDiscovery(): Promise<CustomerApiDiscovery | null> {
  if (!customerApiDiscoveryPromise) {
    customerApiDiscoveryPromise = fetchJson<CustomerApiDiscovery>(getShopifyCustomerApiDiscoveryUrl());
  }
  return customerApiDiscoveryPromise;
}

function buildOidcDiscoveryUrl(authUrl: string): string | null {
  try {
    const parsed = new URL(authUrl);
    const path = parsed.pathname.replace(/\/+$/, "");
    const basePath = path.replace(/\/oauth\/authorize$/, "");
    if (basePath === path) return null;
    parsed.pathname = `${basePath}/.well-known/openid-configuration`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function getOidcConfiguration(): Promise<OidcConfiguration | null> {
  if (!oidcConfigurationPromise) {
    const authUrl = process.env.SHOPIFY_CUSTOMER_API_AUTH_URL;
    if (!authUrl) {
      oidcConfigurationPromise = Promise.resolve(null);
      return oidcConfigurationPromise;
    }
    const discoveryUrl = buildOidcDiscoveryUrl(authUrl);
    if (!discoveryUrl) {
      oidcConfigurationPromise = Promise.resolve(null);
    } else {
      oidcConfigurationPromise = fetchJson<OidcConfiguration>(discoveryUrl);
    }
  }
  return oidcConfigurationPromise;
}
