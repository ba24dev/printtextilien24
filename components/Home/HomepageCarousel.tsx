import { CollectionSummary } from "@/lib/shopify/types";
import Link from "next/link";
import Carousel from "../Carousel/Carousel";
import Heading from "./Heading";

interface HomepageCarouselProps {
    collection: CollectionSummary;
}

export default function HomepageCarousel({ collection }: HomepageCarouselProps) {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-6xl px-6">
                <header className="mb-8 flex items-center justify-between">
                    <Heading smallTitle="TSV Heiligenrode Handball" mainTitle="Die Knilche" />
                    <Link href={`/collections/${collection.handle}`} className="btn-outline small">
                        View collection
                    </Link>
                </header>

                <Carousel collection={collection} />
            </div>
        </section>
    );
}
