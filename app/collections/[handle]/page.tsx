import { copy } from "@/config/copy";
import ProductCard from "@/components/catalog/ProductCard";
import {
  isCollectionTitleAllowedForCustomer,
  isProductVisibleForCustomerByCollections,
  toNormalizedTagSet,
} from "@/lib/catalog/access";
import { resolveCustomerTagsFromCookieStore } from "@/lib/shopify/customer/access";
import { fetchCollectionByHandle } from "@/lib/shopify/collection";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{
    handle?: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const resolved = await params;
  const handle = resolved?.handle?.trim();

  if (!handle) {
    notFound();
  }

  const cookieStore = await cookies();
  const customerTags = await resolveCustomerTagsFromCookieStore(cookieStore);
  const collection = await fetchCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const normalizedTags = toNormalizedTagSet(customerTags);
  const collectionAllowed = isCollectionTitleAllowedForCustomer(collection.title, normalizedTags);

  const visibleProducts = collection.products.filter((product) =>
    isProductVisibleForCustomerByCollections(product.collections, customerTags)
  );

  if (!collectionAllowed || visibleProducts.length === 0) {
    const loginHref = `/account/login?return_to=${encodeURIComponent(`/collections/${collection.handle}`)}`;

    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-foreground">{collection.title}</h1>
        <p className="mt-4 text-foreground/70">
          Diese Kollektion ist nur fur Kunden mit entsprechender Freigabe sichtbar.
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          Bitte melden Sie sich mit einem berechtigten Konto an oder kontaktieren Sie uns, wenn Sie
          Zugriff benotigen.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={loginHref}
            className="btn-primary"
          >
            {copy.auth.loginLabel}
          </Link>
          <Link
            href="/contact"
            className="btn-outline"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">{collection.title}</h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </main>
  );
}
