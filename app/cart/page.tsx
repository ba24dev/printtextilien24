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
        <h1 className="text-3xl font-semibold">Warenkorb</h1>

        {fromShopifyBuyAgain ? (
          <div className="rounded-xl border border-primary-900/40 bg-primary-800/30 p-5 text-sm text-primary-100">
            <p>
              Dieser Link stammt aus Shopifys <strong>Erneut kaufen</strong>{" "}
              Funktion. In Ihrem Headless-Shop wird dieser Link nicht direkt als
              Shopify-Warenkorb importiert.
            </p>
            <p className="mt-3 text-primary-200/90">
              Nutzen Sie stattdessen <strong>Erneut kaufen</strong> im
              Kontobereich, damit die Artikel in Ihren lokalen Shop-Warenkorb
              übernommen werden.
            </p>
            {country ? (
              <p className="mt-3 text-primary-200/80">Land aus Link: {country}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/account" className="btn-primary small">
                Zum Konto
              </Link>
              <Link href="/products" className="btn-outline small">
                Weiter einkaufen
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-primary-900/40 bg-primary-800/30 p-5 text-sm text-primary-100">
            <p>
              Ihr Warenkorb wird in diesem Shop über das Warenkorb-Panel in der
              Kopfzeile verwaltet.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/products" className="btn-primary small">
                Produkte ansehen
              </Link>
              <Link href="/account" className="btn-outline small">
                Zum Konto
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
