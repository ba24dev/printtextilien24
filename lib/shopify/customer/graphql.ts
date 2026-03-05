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
  const normalized = accessToken.trim().replace(/^Bearer\s+/i, "");
  const prefixed = formatAccessToken(normalized);
  const unprefixed = prefixed.startsWith("shcat_") ? prefixed.slice("shcat_".length) : normalized;

  const tokenCandidates = Array.from(
    new Set([normalized, prefixed, unprefixed].filter((token) => token.length > 0)),
  );
  const authHeaderCandidates = Array.from(
    new Set(
      tokenCandidates.flatMap((token) => [
        token,
        `Bearer ${token}`,
      ]),
    ),
  );

  let lastUnauthorizedError: Error | null = null;
  for (const authHeader of authHeaderCandidates) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        lastUnauthorizedError = new Error(`Shopify Customer API error: ${res.status}`);
        continue;
      }
      throw new Error(`Shopify Customer API error: ${res.status}`);
    }

    const json = await res.json();
    if (json.errors) {
      const message = json.errors.map((e: any) => e.message).join("; ");
      const lower = message.toLowerCase();
      if (
        lower.includes("invalid token") ||
        lower.includes("unauthorized") ||
        lower.includes("access denied")
      ) {
        lastUnauthorizedError = new Error(message);
        continue;
      }
      throw new Error(message);
    }
    return json.data;
  }

  throw lastUnauthorizedError ?? new Error("Shopify Customer API unauthorized");
}
