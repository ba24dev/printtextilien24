import { formatAccessToken } from "@/lib/shopify/auth/token";
import { getCustomerApiDiscovery } from "./discovery";
import { getShopifyStorefrontOrigin } from "./urls";

let cachedCustomerGraphqlEndpoint: string | null = null;

async function resolveCustomerGraphqlEndpoint(): Promise<string> {
  if (cachedCustomerGraphqlEndpoint) return cachedCustomerGraphqlEndpoint;

  const discovery = await getCustomerApiDiscovery();
  if (discovery?.graphql_api) {
    cachedCustomerGraphqlEndpoint = discovery.graphql_api;
    return cachedCustomerGraphqlEndpoint;
  }

  // Fallback for environments where discovery is unavailable.
  const storefrontOrigin = getShopifyStorefrontOrigin();
  if (!storefrontOrigin) {
    throw new Error(
      "Could not resolve Shopify Customer GraphQL endpoint: missing storefront URL configuration.",
    );
  }
  cachedCustomerGraphqlEndpoint = new URL(
    "/account/customer/api/latest/graphql.json",
    storefrontOrigin,
  ).toString();
  return cachedCustomerGraphqlEndpoint;
}

export async function shopifyCustomerGraphQL<T = any>(
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const endpoint = await resolveCustomerGraphqlEndpoint();
  // ensure token has correct prefix and no Bearer keyword
  const token = formatAccessToken(accessToken);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Shopify Customer API error: ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: any) => e.message).join("; "));
  }
  return json.data;
}
