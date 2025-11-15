import ProductIndexView from "@/components/Collection/CollectionView";
import { fetchCollectionsWithProducts } from "@/lib/shopify/collection";

export default async function ProductsPage() {
    const collections = await fetchCollectionsWithProducts(20, 24);
    const visibleCollections = collections.filter((collection) => !collection.handle.startsWith("hidden-"));
    return <ProductIndexView collections={visibleCollections} />;
}
