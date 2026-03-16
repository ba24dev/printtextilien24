import { redirect } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{
    handle?: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const resolved = await params;
  const handle = resolved?.handle?.trim();

  if (!handle) {
    redirect("/products");
  }

  redirect(`/products?collection=${encodeURIComponent(handle)}`);
}
