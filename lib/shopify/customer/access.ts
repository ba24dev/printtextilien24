import {
  CookieStoreLike,
  fetchCustomerTags,
  resolveCustomerAuthTokens,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";

export async function resolveCustomerTagsFromCookieStore(
  cookieStore: CookieStoreLike
): Promise<string[]> {
  const tokens = await resolveCustomerAuthTokens(cookieStore);
  const validation = await validateCustomerSession(tokens.accessToken, tokens.refreshToken);
  if (!validation.authenticated) {
    return [];
  }

  try {
    return await fetchCustomerTags(validation.accessToken);
  } catch {
    return [];
  }
}
