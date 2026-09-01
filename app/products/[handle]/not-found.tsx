import { copy } from "@/config/copy";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="bg-background/50 py-48 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          {copy.product.unavailableNoticeTitle}
        </h1>
        <p className="max-w-lg text-base text-foreground/70">
          {copy.product.unavailableNoticeBody}
        </p>
        <Link href="/products" className="btn-primary mt-4">
          {copy.product.unavailableNoticeCta}
        </Link>
      </div>
    </section>
  );
}
