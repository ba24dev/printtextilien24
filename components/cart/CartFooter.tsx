import { copy } from "@/config/copy";
import { CartCheckoutButton, CartCost } from "@shopify/hydrogen-react";

export default function CartFooter() {
  return (
    <footer className="border-t px-6 py-4 border-primary-500">
      <div className="flex items-center justify-between text-sm">
        <span>{copy.cart.subtotal}</span>
        <CartCost amountType="subtotal" />
      </div>
      <CartCheckoutButton className="mt-4 w-full rounded bg-primary-500 px-4 py-3 text-center text-sm font-medium text-white dark:hover:bg-primary-600 hover:bg-primary-400">
        {copy.cart.checkout}
      </CartCheckoutButton>
    </footer>
  );
}
