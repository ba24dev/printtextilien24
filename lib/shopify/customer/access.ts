import {
  CookieStoreLike,
  fetchCustomerTags,
  readCustomerCookie,
  validateCustomerSession,
} from "@/lib/shopify/customer/session";

export async function resolveCustomerTagsFromCookieStore(
  cookieStore: CookieStoreLike
): Promise<string[]> {
  const accessToken = readCustomerCookie(cookieStore, "shopify_customer_access_token");
  const refreshToken = readCustomerCookie(cookieStore, "shopify_customer_refresh_token");

  const validation = await validateCustomerSession(accessToken, refreshToken);
  if (!validation.authenticated) {
    return [];
  }

  try {
    return await fetchCustomerTags(validation.accessToken);
  } catch {
    return [];
  }
}
