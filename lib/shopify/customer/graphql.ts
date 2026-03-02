export async function shopifyCustomerGraphQL<T = any>(
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN!;
  const endpoint = `https://${SHOPIFY_DOMAIN}/account/customer/api/2023-10/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
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
