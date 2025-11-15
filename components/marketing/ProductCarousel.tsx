import { copy } from "@/config/copy";
import { CollectionSummary } from "@/lib/shopify/types";
import Link from "next/link";
import Heading from "../ui/Heading";
import Marquee from "./Marquee";

interface ProductCarouselProps {
  collection: CollectionSummary;
}

export default function ProductCarousel({ collection }: ProductCarouselProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-8 flex items-center justify-between">
          <Heading
            smallTitle={copy.marketing.carousel.heading.small}
            mainTitle={copy.marketing.carousel.heading.main}
          />
          <Link
            href={`/collections/${collection.handle}`}
            className="btn-outline small"
          >
            {copy.marketing.carousel.viewCollection}
          </Link>
        </header>

        <Marquee collection={collection} />
      </div>
    </section>
  );
}
