import { formatAccessToken } from "@/lib/shopify/auth/token";
import { getCustomerApiDiscovery } from "./discovery";
import { getShopifyStorefrontOrigin } from "./urls";

let cachedCustomerGraphqlEndpoints: string[] | null = null;

function buildEndpointCandidates(endpoint: string): string[] {
  const candidates = new Set<string>([endpoint]);
  if (endpoint.endsWith("/graphql")) {
    candidates.add(`${endpoint}.json`);
  }
  if (endpoint.endsWith("/graphql.json")) {
    candidates.add(endpoint.replace(/\.json$/, ""));
  }
  return Array.from(candidates);
}

async function resolveCustomerGraphqlEndpoints(): Promise<string[]> {
  if (cachedCustomerGraphqlEndpoints) return cachedCustomerGraphqlEndpoints;

  const endpoints: string[] = [];
  const discovery = await getCustomerApiDiscovery();
  if (discovery?.graphql_api) {
    endpoints.push(...buildEndpointCandidates(discovery.graphql_api));
  }

  // Fallback for environments where discovery is unavailable or discovery endpoint format varies.
  const storefrontOrigin = getShopifyStorefrontOrigin();
  if (!storefrontOrigin) {
    throw new Error(
      "Could not resolve Shopify Customer GraphQL endpoint: missing storefront URL configuration.",
    );
  }
  endpoints.push(...buildEndpointCandidates(new URL(
    "/account/customer/api/latest/graphql.json",
    storefrontOrigin,
  ).toString()));

  cachedCustomerGraphqlEndpoints = Array.from(new Set(endpoints));
  return cachedCustomerGraphqlEndpoints;
}

export async function shopifyCustomerGraphQL<T = any>(
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const endpoints = await resolveCustomerGraphqlEndpoints();
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

  let lastError: Error | null = null;
  for (const endpoint of endpoints) {
    for (const authHeader of authHeaderCandidates) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) {
        const body = (await res.text().catch(() => "")).slice(0, 300);
        const error = new Error(
          `Shopify Customer API error: ${res.status} at ${endpoint}${body ? ` body=${body}` : ""}`,
        );
        lastError = error;
        if (res.status === 401 || res.status === 403 || res.status === 400) {
          // Retry with alternative auth header and/or alternative endpoint shape.
          continue;
        }
        throw error;
      }

      const json = await res.json();
      if (json.errors) {
        const message = json.errors.map((e: any) => e.message).join("; ");
        const lower = message.toLowerCase();
        if (
          lower.includes("invalid token") ||
          lower.includes("unauthorized") ||
          lower.includes("access denied") ||
          lower.includes("bad request")
        ) {
          lastError = new Error(message);
          continue;
        }
        throw new Error(message);
      }
      return json.data;
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error(
    `Shopify Customer API failed after trying ${endpoints.length} endpoint(s) and ${authHeaderCandidates.length} auth format(s)`,
  );
}
