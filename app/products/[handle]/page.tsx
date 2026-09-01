import ProductView from "@/components/product/ProductView";
import { isCollectionTitleAllowedForCustomer, toNormalizedTagSet } from "@/lib/catalog/access";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { fetchProductWithPrintConfig } from "@/lib/shopify/product";
import { cookies } from "next/headers";
import Link from "next/link";

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
    return <ProductUnavailableNotice />;
  }

  const result = await fetchProductWithPrintConfig(handle);
  if (!result) {
    return <ProductUnavailableNotice />;
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

function ProductUnavailableNotice() {
  return (
    <section className="bg-background/50 py-48 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Produkt nicht verfügbar
        </h1>
        <p className="max-w-lg text-base text-foreground/70">
          Dieses Produkt ist momentan nicht in unserem Sortiment oder die
          Produktdaten konnten nicht geladen werden. Bitte versuche es
          später erneut oder stöbere in unserem aktuellen Sortiment.
        </p>
        <Link href="/products" className="btn-primary mt-4">
          Alle Produkte ansehen
        </Link>
      </div>
    </section>
  );
}
