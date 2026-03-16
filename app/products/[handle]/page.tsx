import ProductView from "@/components/product/ProductView";
import { isCollectionTitleAllowedForCustomer, toNormalizedTagSet } from "@/lib/catalog/access";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { fetchProductWithPrintConfig } from "@/lib/shopify/product";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params:
    | {
        handle?: string | string[];
      }
    | Promise<{
        handle?: string | string[];
      }>;
}

function resolveHandle(raw: string | string[] | undefined): string | null {
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string") {
    return raw[0];
  }
  return null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const handle = resolveHandle(resolvedParams?.handle);
  if (!handle) {
    notFound();
  }

  const result = await fetchProductWithPrintConfig(handle);
  if (!result) {
    notFound();
  }

  const cookieStore = await cookies();
  const customerTags = await resolveCustomerTagsFromCookieStore(cookieStore);
  const normalizedTags = toNormalizedTagSet(customerTags);

  const productWithFilteredCollections = result.product as {
    collections?: {
      nodes?: Array<{
        title?: string | null;
      } | null>;
    };
  };

  if (Array.isArray(productWithFilteredCollections.collections?.nodes)) {
    productWithFilteredCollections.collections.nodes =
      productWithFilteredCollections.collections.nodes.filter((collectionNode) => {
        if (!collectionNode?.title) return false;
        return isCollectionTitleAllowedForCustomer(collectionNode.title, normalizedTags);
      });
  }

  return (
    <ProductView
      product={result.product}
      printSurfaces={result.printSurfaces}
    />
  );
}
