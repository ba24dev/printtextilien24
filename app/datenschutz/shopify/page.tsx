import { fetchShopPrivacyPolicy } from "@/lib/shopify/shop";

export default async function ShopifyDatenschutzPage() {
  const policy = await fetchShopPrivacyPolicy();

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
          {policy ? (
            <div className="flex-1 space-y-6 dark:prose-invert prose max-w-full">
              <header className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                  Datenschutz Shopify
                </h1>
              </header>
              <div dangerouslySetInnerHTML={{ __html: policy.body }} />
            </div>
          ) : (
            <div className="flex-1 space-y-6 dark:prose-invert prose max-w-full">
              <header className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                  Datenschutz Shopify
                </h1>
              </header>
              <p className="text-base text-foreground/70 leading-relaxed">
                Die Shopify-Datenschutzerklärung ist momentan nicht verfügbar.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
