import ProductExperience from "@/components/Product/ProductExperience";
import { fetchProductByHandle } from "@/lib/shopify/product";
import { ShopifyProduct } from "@/lib/shopify/transport";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: {
        handle?: string | string[];
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { handle } = await params;

    if (!handle || typeof handle !== "string") {
        notFound();
    }

    const product = await fetchProductByHandle(handle);

    if (!product) {
        notFound();
    }

    return <ProductExperience product={product as ShopifyProduct} />;
}
