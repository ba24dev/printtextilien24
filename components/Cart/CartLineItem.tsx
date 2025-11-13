import { CartLineQuantity, CartLineQuantityAdjustButton, useCartLine } from "@shopify/hydrogen-react";
import Image from "next/image";
import { CloseSVG, DecreaseSVG, IncreaseSVG } from "../SVG/Icons";

const PLACEHOLDER_IMAGE = "https://placehold.co/160x160.png?text=No+Image";

export default function CartLineItem() {
    const line = useCartLine();
    const merchandise = line?.merchandise;

    if (!merchandise) {
        return null;
    }

    const productTitle = "product" in merchandise ? merchandise.product?.title ?? "Product" : "Product";
    const variantTitle = "title" in merchandise ? merchandise.title : undefined;
    const imageUrl = "image" in merchandise && merchandise.image?.url ? merchandise.image.url : PLACEHOLDER_IMAGE;
    const altText = "image" in merchandise && merchandise.image?.altText ? merchandise.image.altText : productTitle;

    return (
        <li className="flex gap-4 relative">
            <div className="relative h-20 w-20 overflow-hidden rounded bg-gray-100">
                <Image src={imageUrl} alt={altText} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">{productTitle}</p>
                {variantTitle ? <p className="text-xs text-gray-500">{variantTitle}</p> : null}
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-1 max-w-[100px] items-center h-full border rounded font-medium">
                        <div className="flex-1 h-full flex justify-center items-center cursor-pointer">
                            <CartLineQuantityAdjustButton
                                adjust="decrease"
                                className="cursor-pointer hover:text-gray-50 text-gray-300"
                                type="button"
                            >
                                <DecreaseSVG />
                            </CartLineQuantityAdjustButton>
                        </div>
                        <div className="h-full flex justify-center items-center px-2">
                            <CartLineQuantity as="span">
                                <span className="w-12 rounded border border-gray-300 px-2 py-1 text-center text-sm">
                                    {line.quantity}
                                </span>
                                ;
                            </CartLineQuantity>
                        </div>
                        <div className="flex-1 h-full flex justify-center items-center cursor-pointer">
                            <CartLineQuantityAdjustButton
                                adjust="increase"
                                className="cursor-pointer hover:text-gray-50 text-gray-300"
                                type="button"
                            >
                                <IncreaseSVG />
                            </CartLineQuantityAdjustButton>
                        </div>
                    </div>
                    <div className="flex max-w-[100px] items-center h-full font-medium text-sm text-gray-400">
                        {formatPrice(merchandise.price?.amount)}€
                    </div>
                    <div className="flex max-w-[100px] items-center h-full font-medium text-sm text-gray-100">
                        {formatPrice(line.cost?.totalAmount?.amount)}€
                    </div>
                </div>
            </div>

            <CartLineQuantityAdjustButton
                adjust="remove"
                className="ml-4 rounded-lg border border-red-700 bg-red-900/90 p-0.5 text-xs text-red-300 hover:bg-red-700/90 absolute -top-2 -left-6 cursor-pointer"
                type="button"
                aria-label="Remove item"
            >
                <CloseSVG />
            </CartLineQuantityAdjustButton>
        </li>
    );
}

function formatPrice(amount: string | number | undefined) {
    if (!amount) {
        return "";
    }

    return Number(amount).toLocaleString(process.env.NEXT_PUBLIC_SHOPIFY_LANGUAGE_ISO_CODE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
