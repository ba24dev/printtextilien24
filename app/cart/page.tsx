import { copy } from "@/config/copy";
import Link from "next/link";

type CartPageSearchParams = {
  cart_link_id?: string | string[];
  country?: string | string[];
};

type CartPageProps = {
  searchParams?: CartPageSearchParams | Promise<CartPageSearchParams>;
};

function firstValue(value?: string | string[]): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const cartLinkId = firstValue(resolvedSearchParams?.cart_link_id);
  const country = firstValue(resolvedSearchParams?.country);

  const fromShopifyBuyAgain = Boolean(cartLinkId);

  return (
    <main className="flex-1 bg-linear-to-b from-primary-900/40 via-primary-500/20 to-background">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-40">
        <h1 className="text-3xl font-semibold">{copy.cart.pageTitle}</h1>

        {fromShopifyBuyAgain ? (
          <div className="rounded-xl border border-primary-900/40 bg-primary-800/30 p-5 text-sm text-primary-100">
            <p>{copy.cart.resolverFromShopify}</p>
            <p className="mt-3 text-primary-200/90">{copy.cart.resolverUseAccount}</p>
            {country ? (
              <p className="mt-3 text-primary-200/80">
                {copy.cart.resolverCountryPrefix} {country}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/account" className="btn-primary small">
                {copy.cart.resolverGoAccount}
              </Link>
              <Link href="/products" className="btn-outline small">
                {copy.cart.resolverContinueShopping}
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-primary-900/40 bg-primary-800/30 p-5 text-sm text-primary-100">
            <p>{copy.cart.resolverDrawerHint}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/products" className="btn-primary small">
                {copy.cart.resolverViewProducts}
              </Link>
              <Link href="/account" className="btn-outline small">
                {copy.cart.resolverGoAccount}
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
