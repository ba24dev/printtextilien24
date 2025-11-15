"use client";

import { CollectionSummary, ProductSummary } from "@/lib/shopify/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ProductCard from "../Product/ProductCard";
import InteractionButton from "./CollectionButton";

interface ProductIndexViewProps {
    collections: CollectionSummary[];
}

const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

function getPrice(product: ProductSummary): number {
    return parseFloat(product.priceRange.minVariantPrice.amount);
}

export default function ProductIndexView({ collections }: ProductIndexViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const collectionLookup = useMemo(
        () => new Map(collections.map((collection) => [collection.handle, collection])),
        [collections]
    );

    const collectionFromQuery = useMemo(() => {
        const handle = searchParams.get("collection");
        if (!handle) return "all";
        return collectionLookup.has(handle) ? handle : "all";
    }, [searchParams, collectionLookup]);

    const [activeHandle, setActiveHandle] = useState<string>(collectionFromQuery);
    const [sortValue, setSortValue] = useState<string>("relevance");

    const [previousCollectionHandle, setPreviousCollectionHandle] = useState<string>(activeHandle);

    if (collectionFromQuery !== previousCollectionHandle) {
        setPreviousCollectionHandle(activeHandle);
        setActiveHandle(collectionFromQuery);
    }

    const handleCollectionSelect = useCallback(
        (handle: string) => {
            setActiveHandle(handle);

            const nextParams = new URLSearchParams(searchParams.toString());
            if (handle === "all") {
                nextParams.delete("collection");
            } else {
                nextParams.set("collection", handle);
            }

            const queryString = nextParams.toString();
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        },
        [searchParams, pathname, router]
    );

    const allProducts = useMemo(() => {
        const map = new Map<string, ProductSummary>();
        collections.forEach((collection) => {
            collection.products.forEach((product) => {
                if (!map.has(product.id)) {
                    map.set(product.id, product);
                }
            });
        });
        return Array.from(map.values());
    }, [collections]);

    const productsToDisplay = useMemo(() => {
        const baseProducts = activeHandle === "all" ? allProducts : collectionLookup.get(activeHandle)?.products ?? [];

        if (sortValue === "price-asc") {
            return [...baseProducts].sort((a, b) => getPrice(a) - getPrice(b));
        }

        if (sortValue === "price-desc") {
            return [...baseProducts].sort((a, b) => getPrice(b) - getPrice(a));
        }

        return baseProducts;
    }, [activeHandle, sortValue, allProducts, collectionLookup]);

    return (
        <section className="dark:bg-primary-700/20 bg-primary-300/40 py-48 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-6 grid-cols-[200px_1fr]">
                    <aside className="space-y-4">
                        <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                            Collections
                        </div>
                        <div className="space-y-2 mb-6">
                            <InteractionButton
                                key="all"
                                id="all"
                                handle="all"
                                label="All"
                                activeHandle={activeHandle}
                                setActiveAction={handleCollectionSelect}
                            />
                            {collections.map((collection) => (
                                <InteractionButton
                                    key={collection.id}
                                    handle={collection.handle}
                                    label={collection.title}
                                    activeHandle={activeHandle}
                                    setActiveAction={handleCollectionSelect}
                                />
                            ))}
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Sort by</div>
                        <div className="space-y-2 mb-6">
                            {SORT_OPTIONS.map((option) => (
                                <InteractionButton
                                    key={option.value}
                                    handle={option.value}
                                    label={option.label}
                                    activeHandle={sortValue}
                                    setActiveAction={setSortValue}
                                />
                            ))}
                        </div>
                    </aside>

                    <main>
                        {productsToDisplay.length === 0 ? (
                            <p className="text-sm text-foreground/60">No products found in this collection.</p>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {productsToDisplay.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>

                    <aside className="space-y-4"></aside>
                </div>
            </div>
        </section>
    );
}
