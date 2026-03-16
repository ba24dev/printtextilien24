import {
  dedupeProducts,
  getCollectionHandleFromQuery,
  SortKey,
  sortProducts,
} from "@/lib/catalog/utils";
import { CollectionSummary } from "@/lib/shopify/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function useCatalogViewModel(collections: CollectionSummary[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const collectionMap = useMemo(
    () => new Map(collections.map((collection) => [collection.handle, collection])),
    [collections]
  );

  const collectionFromQuery = useMemo(
    () => getCollectionHandleFromQuery(searchParams),
    [searchParams]
  );

  const [activeCollection, setActiveCollection] = useState<string>(collectionFromQuery);
  const [sortValue, setSortValue] = useState<SortKey>("relevance");

  const [previousCollectionHandle, setPreviousCollectionHandle] =
    useState<string>(activeCollection);

  if (collectionFromQuery !== previousCollectionHandle) {
    setPreviousCollectionHandle(activeCollection);
    setActiveCollection(collectionFromQuery);
  }

  const handleCollectionChange = useCallback(
    (handle: string) => {
      setActiveCollection(handle);

      const nextParams = new URLSearchParams(searchParams.toString());
      if (handle === "all") {
        nextParams.delete("collection");
      } else {
        nextParams.set("collection", handle);
      }

      const queryString = nextParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const allProducts = useMemo(() => dedupeProducts(collections), [collections]);

  const products = useMemo(() => {
    const baseProducts =
      activeCollection === "all"
        ? allProducts
        : collectionMap.get(activeCollection)?.products ?? [];

    return sortProducts(baseProducts, sortValue);
  }, [activeCollection, sortValue, allProducts, collectionMap]);
  return {
    collections,
    sortValue,
    setSortValue,
    activeCollection,
    handleCollectionChange,
    products,
  };
}
