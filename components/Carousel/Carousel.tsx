import { CollectionSummary } from "@/lib/shopify/types";
import { useEffect, useMemo, useRef } from "react";
import ProductCard from "../Product/ProductCard";

interface CarouselProps {
    collection: CollectionSummary;
}

const SCROLL_SPEED_PX_PER_S = 12;
const DUPLICATION_FACTOR = 3;

export default function Carousel({ collection }: CarouselProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<Animation | null>(null);
    const isHoveredRef = useRef<boolean>(false);

    const productsForMarquee = useMemo(() => {
        if (!collection.products.length) return [];

        return Array.from({ length: DUPLICATION_FACTOR }, (_, copyIndex) =>
            collection.products.map((product) => ({
                ...product,
                _uniqueId: `${product.id}-copy${copyIndex}`,
            }))
        ).flat();
    }, [collection.products]);

    useEffect(() => {
        const track = trackRef.current;

        if (!track || productsForMarquee.length === 0) return;

        const activateAnimation = () => {
            const cycleWidth = track.scrollWidth / DUPLICATION_FACTOR;
            const durationMs = (cycleWidth / SCROLL_SPEED_PX_PER_S) * 1000;

            if (animationRef.current) {
                animationRef.current.cancel();
            }

            animationRef.current = track.animate(
                [{ transform: "translateX(0)" }, { transform: `translateX(-${cycleWidth}px)` }],
                {
                    duration: Math.max(durationMs, 1000),
                    iterations: Infinity,
                    easing: "linear",
                }
            );

            if (isHoveredRef.current) {
                animationRef.current.pause();
            }
        };

        activateAnimation();

        const resizeObserver = new ResizeObserver(() => {
            activateAnimation();
        });

        resizeObserver.observe(track);

        return () => {
            resizeObserver.disconnect();
            if (animationRef.current) {
                animationRef.current.cancel();
            }
        };
    }, [productsForMarquee]);

    const pause = () => {
        isHoveredRef.current = true;
        if (animationRef.current) {
            animationRef.current.pause();
        }
    };

    const play = () => {
        isHoveredRef.current = false;
        if (animationRef.current) {
            animationRef.current.play();
        }
    };

    return (
        <div
            ref={viewportRef}
            className="relative overflow-hidden"
            onMouseEnter={pause}
            onMouseLeave={play}
            onFocus={pause}
            onBlur={play}
        >
            <div ref={trackRef} className="flex w-max pb-10 gap-6 will-change-transform">
                {productsForMarquee.map((product) => (
                    <ProductCard key={product._uniqueId} product={product} />
                ))}
            </div>
        </div>
    );
}
