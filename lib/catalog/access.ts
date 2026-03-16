export function normalizeAccessToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const PUBLIC_COLLECTION_TITLES = new Set([normalizeAccessToken("allgemein")]);

export function toNormalizedTagSet(tags: string[]): Set<string> {
  return new Set(tags.map(normalizeAccessToken).filter((tag) => tag.length > 0));
}

export function isCollectionTitleAllowedForCustomer(
  collectionTitle: string,
  normalizedCustomerTags: ReadonlySet<string>
): boolean {
  const normalizedTitle = normalizeAccessToken(collectionTitle);
  if (!normalizedTitle) {
    return false;
  }

  if (PUBLIC_COLLECTION_TITLES.has(normalizedTitle)) {
    return true;
  }

  if (normalizedCustomerTags.size === 0) {
    return false;
  }

  return normalizedCustomerTags.has(normalizedTitle);
}

export function filterCollectionsByCustomerTags<T extends { title: string }>(
  collections: T[],
  customerTags: string[]
): T[] {
  const normalizedTags = toNormalizedTagSet(customerTags);
  return collections.filter((collection) =>
    isCollectionTitleAllowedForCustomer(collection.title, normalizedTags)
  );
}

export function isProductVisibleForCustomerByCollections(
  collectionTitles: string[] | undefined,
  customerTags: string[]
): boolean {
  const titles = collectionTitles ?? [];
  if (titles.length === 0) {
    return false;
  }

  const normalizedTags = toNormalizedTagSet(customerTags);

  return titles.some((title) => isCollectionTitleAllowedForCustomer(title, normalizedTags));
}
