"use client";

import { copy } from "@/config/copy";
import { useProduct } from "@shopify/hydrogen-react";

export default function ProductDetails() {
  const { product } = useProduct();

  if (!product) return null;

  const descriptionHtml = product.descriptionHtml ?? "";
  const highlights = (product.tags ?? [])
    .filter((tag) => tag && !tag.toLowerCase().startsWith("hidden"))
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-foreground/10 bg-background p-8 backdrop-blur">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
          {copy.product.descriptionTitle}
        </h2>
        <div
          className="prose prose-invert prose-sm mt-4 max-w-none text-foreground/70"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </section>

      {highlights.length ? (
        <section className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
            {copy.product.highlightsTitle}
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground/70">
            {highlights.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
          {copy.product.detailsTitle}
        </h3>
        <dl className="mt-4 grid gap-4 text-sm text-foreground/70 sm:grid-cols-2">
          {product.productType ? (
            <div>
              <dt className="font-semibold text-foreground/80">{copy.product.categoryLabel}</dt>
              <dd>{product.productType}</dd>
            </div>
          ) : null}
          {product.vendor ? (
            <div>
              <dt className="font-semibold text-foreground/80">{copy.product.brandLabel}</dt>
              <dd>{product.vendor}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-foreground/80">{copy.product.handleLabel}</dt>
            <dd>{product.handle}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
