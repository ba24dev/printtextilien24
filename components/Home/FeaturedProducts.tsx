import { CollectionSummary } from "@/lib/shopify/types";
import { Money } from "@shopify/hydrogen-react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Heading from "./Heading";

interface FeaturedProductsProps {
    collection: CollectionSummary;
}

export default function FeaturedProducts({ collection }: FeaturedProductsProps) {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-6xl px-6">
                <header className="mb-10 text-center">
                    <Heading smallTitle="Check out our latest and most popular items" mainTitle="Featured Products" />
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {collection.products.map((product) => (
                        <article
                            key={product.id}
                            className="flex h-full flex-col overflow-hidden rounded-3xl border border-primary-900/40 bg-background shadow-lg dark:shadow-primary-900/30 shadow-primary-100/30"
                        >
                            <div className="relative h-48 w-full bg-primary-900/20">
                                {product.featuredImage?.url ? (
                                    <Image
                                        src={product.featuredImage.url}
                                        alt={product.featuredImage.altText ?? product.title}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 80vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <Image
                                        src="https://placehold.co/300x400.png?text=Placeholder&font=roboto"
                                        alt={product.title}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 80vw"
                                        className="object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex flex-1 flex-col gap-4 p-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                                    <p className="mt-2 text-sm text-foreground/60 line-clamp-2">
                                        {product.description ?? "Premium quality apparel ready for customization."}
                                    </p>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t border-primary-900/20 pt-4">
                                    <div className="text-sm font-semibold text-foreground">
                                        <Money data={product.priceRange.minVariantPrice} />
                                    </div>
                                    <Link href={`/products/${product.handle}`} className="btn-primary small">
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to cart
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Link href="/products" className="btn-outline small">
                        View all products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
