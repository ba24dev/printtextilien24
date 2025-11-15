import { copy } from "@/config/copy";
import { useCart } from "@shopify/hydrogen-react";
import { SquareX } from "lucide-react";

type CartHeaderProps = {
  onCloseAction: () => void;
};

export default function CartHeader({ onCloseAction }: CartHeaderProps) {
  const { totalQuantity } = useCart();
  const quantity = totalQuantity ?? 0;
  return (
    <header className="flex items-center justify-between border-b border-primary-500 px-6 py-4 h-16">
      <h2 className="text-lg font-semibold">{copy.cart.title(quantity)}</h2>
      <button
        className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 w-6 h-6"
        type="button"
        onClick={onCloseAction}
        aria-label={copy.cart.close}
        title={copy.cart.close}
      >
        <SquareX className="w-6 h-6" />
      </button>
    </header>
  );
}
