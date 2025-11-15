import { copy } from "@/config/copy";
import { formatPrice } from "@/lib/helpers";
import {
  CartLineQuantity,
  CartLineQuantityAdjustButton,
  useCartLine,
} from "@shopify/hydrogen-react";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

const PLACEHOLDER_IMAGE = `https://placehold.co/160x160.png?text=${encodeURIComponent(
  copy.general.noImageLabel
)}`;

export default function CartLineItem() {
  const line = useCartLine();
  const merchandise = line?.merchandise;

  if (!merchandise) {
    return null;
  }

  const productTitle =
    "product" in merchandise
      ? merchandise.product?.title ?? copy.catalog.productFallbackTitle
      : copy.catalog.productFallbackTitle;
  const variantTitle = "title" in merchandise ? merchandise.title : undefined;
  const imageUrl =
    "image" in merchandise && merchandise.image?.url ? merchandise.image.url : PLACEHOLDER_IMAGE;
  const altText =
    "image" in merchandise && merchandise.image?.altText ? merchandise.image.altText : productTitle;

  return (
    <li className="grid grid-cols-[80px_1fr_auto] grid-rows-[auto_auto] gap-4 relative px-4 py-3 rounded-lg border dark:border-secondary-900 border-secondary-500">
      <div className="relative h-20 w-20 overflow-hidden rounded bg-secondary-100 row-span-2">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-base font-bold">{productTitle}</p>
        {variantTitle ? <p className="text-xs text-secondary-500">{variantTitle}</p> : null}
      </div>

      <CartLineQuantityAdjustButton
        adjust="remove"
        className="rounded-lg p-1 text-sm aspect-square w-10 text-secondary-300 hover:text-red-500/70 cursor-pointer flex items-center justify-center col-start-3 row-start-1"
        type="button"
        aria-label={copy.cart.actions.remove}
        title={copy.cart.actions.remove}
      >
        <Trash2 className="w-6 h-6" />
      </CartLineQuantityAdjustButton>

      <div className="flex items-center gap-2 justify-between col-span-2">
        <div className="flex flex-1 max-w-[100px] items-center h-full border rounded font-medium">
          <div className="flex-1 h-full flex justify-center items-center cursor-pointer">
            <CartLineQuantityAdjustButton
              adjust="decrease"
              className="cursor-pointer hover:text-secondary-100 text-secondary-500"
              type="button"
              aria-label={copy.cart.actions.decrease}
              title={copy.cart.actions.decrease}
            >
              <Minus className="w-4 h-4" />
            </CartLineQuantityAdjustButton>
          </div>
          <div className="h-full flex justify-center items-center px-2">
            <CartLineQuantity as="span">
              <span className="w-12 rounded border border-secondary-300 px-2 py-1 text-center text-sm">
                {line.quantity}
              </span>
              ;
            </CartLineQuantity>
          </div>
          <div className="flex-1 h-full flex justify-center items-center cursor-pointer">
            <CartLineQuantityAdjustButton
              adjust="increase"
              className="cursor-pointer hover:text-secondary-100 text-secondary-500"
              type="button"
              aria-label={copy.cart.actions.increase}
              title={copy.cart.actions.increase}
            >
              <Plus className="w-4 h-4" />
            </CartLineQuantityAdjustButton>
          </div>
        </div>
        <div className="flex max-w-[100px] items-center h-full font-medium text-sm text-secondary-300">
          {formatPrice(merchandise.price?.amount, merchandise.price?.currencyCode)}
        </div>
        <div className="flex max-w-[100px] items-center h-full font-semibold text-sm text-secondary-100">
          {formatPrice(line.cost?.totalAmount?.amount, line.cost?.totalAmount?.currencyCode)}
        </div>
      </div>
    </li>
  );
}
