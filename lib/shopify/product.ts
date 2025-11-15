import { shopifyRequest } from "./client";
import { PRODUCT_BY_HANDLE_QUERY } from "./queries";
import { ProductByHandleResult, ShopifyProduct } from "./transport";

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyRequest<ProductByHandleResult>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle, imagesFirst: 10, variantsFirst: 50 },
    cache: "force-cache",
  });

  return data.productByHandle;
}
