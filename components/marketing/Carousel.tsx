import { CollectionSummary } from "@/lib/shopify/types";
import Link from "next/link";
import Heading from "../ui/Heading";
import Marquee from "./Marquee";

interface CarouselProps {
    collection: CollectionSummary;
}

export default function Carousel({ collection }: CarouselProps) {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-6xl px-6">
                <header className="mb-8 flex items-center justify-between">
                    <Heading smallTitle="TSV Heiligenrode Handball" mainTitle="Die Knilche" />
                    <Link href={`/collections/${collection.handle}`} className="btn-outline small">
                        View collection
                    </Link>
                </header>

                <Marquee collection={collection} />
            </div>
        </section>
    );
}
