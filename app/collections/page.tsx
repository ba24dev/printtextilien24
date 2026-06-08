import { copy } from "@/config/copy";
import ProductGrid from "@/components/catalog/ProductGrid";
import { filterCollectionsByCustomerTags } from "@/lib/catalog/access";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function CollectionsPage() {
  const cookieStore = await cookies();
  const customerTags = await resolveCustomerTagsFromCookieStore(cookieStore);
  const collections = await fetchCollectionsWithProducts(20, 24);
  const visibleCollections = filterCollectionsByCustomerTags(collections, customerTags);

  if (visibleCollections.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-foreground">{copy.catalog.collectionsTitle}</h1>
        <p className="mt-4 text-foreground/70">
          Aktuell sind keine Kollektionen fur Ihr Konto verfugbar.
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          Melden Sie sich mit einem berechtigten Kundenkonto an, um weitere Kollektionen zu
          sehen.
        </p>
        <div className="mt-8">
          <Link
            href="/account/login?return_to=%2Fcollections"
            className="btn-primary"
          >
            {copy.auth.loginLabel}
          </Link>
        </div>
      </main>
    );
  }

  return <ProductGrid collections={visibleCollections} />;
}
