import Image from "next/image";
import React from "react";

interface ProductCardProps {
    id: string;
    title: string;
    handle: string;
    price: string;
    currency: string;
    imageUrl: string;
    imageAlt: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, handle, price, currency, imageUrl, imageAlt }) => {
    return (
        <div className="product-card">
            <a href={`/products/${handle}`} className="block">
                <div className="relative w-full h-64">
                    <Image
                        src={imageUrl}
                        alt={imageAlt || `Image of ${title}`}
                        fill={true}
                        loading="eager"
                        className="rounded-lg w-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <h3 className="mt-4 text-lg font-medium">{title}</h3>
                <p className="text-sm text-gray-500">
                    {price} {currency}
                </p>
            </a>
        </div>
    );
};

export default ProductCard;
