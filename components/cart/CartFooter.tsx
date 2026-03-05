"use client";

import { copy } from "@/config/copy";
import { CartCost, useCart } from "@shopify/hydrogen-react";
import { useMemo } from "react";

export function buildCheckoutUrl(rawCheckoutUrl?: string | null): string | null {
  if (!rawCheckoutUrl) return null;
  try {
    const parsed = new URL(rawCheckoutUrl);
    parsed.searchParams.set("logged_in", "true");
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function CartFooter() {
  const { checkoutUrl } = useCart();
  const targetCheckout = useMemo(() => buildCheckoutUrl(checkoutUrl), [checkoutUrl]);

  return (
    <footer className="border-t px-6 py-4 border-primary-500">
      <div className="flex items-center justify-between text-sm">
        <span>{copy.cart.subtotal}</span>
        <CartCost amountType="subtotal" />
      </div>
      <button
        className="mt-4 w-full rounded bg-primary-500 px-4 py-3 text-center text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-primary-600 hover:bg-primary-400"
        type="button"
        disabled={!targetCheckout}
        onClick={() => {
          if (!targetCheckout) return;
          window.location.href = targetCheckout;
        }}
      >
        {copy.cart.checkout}
      </button>
    </footer>
  );
}
