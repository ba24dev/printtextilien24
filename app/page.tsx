"use client";

import ProductCard from "@/components/ProductCard";
import { Collection, fetchCollectionsWithProducts, Product } from "@/lib/shopify";
import React, { useEffect, useState } from "react";

const HomePage: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCollectionsWithProducts();
                setCollections(data);
            } catch (error) {
                console.error("Error fetching collections:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4">
            {collections.map((collection) => (
                <div key={collection.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{collection.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collection.products.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                handle={product.handle}
                                price={product.priceRange.minVariantPrice.amount}
                                currency={product.priceRange.minVariantPrice.currencyCode}
                                imageUrl={product.featuredImage?.url || "https://placehold.co/600x400/png"}
                                imageAlt={product.featuredImage?.altText || null}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomePage;
