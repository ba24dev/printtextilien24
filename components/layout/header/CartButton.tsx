import { copy } from "@/config/copy";
import { ShoppingCart } from "lucide-react";

interface CartButtonProps {
  quantity: number;
  onClickAction: (open: boolean) => void;
}

export default function CartButton({ quantity, onClickAction }: CartButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClickAction(true)}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600 cursor-pointer"
      aria-label={copy.cart.title(quantity)}
      title={copy.cart.title(quantity)}
    >
      <ShoppingCart className="aspect-square w-5" />
      {quantity ? (
        <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-400 px-1 text-[0.65rem] font-semibold text-background">
          {quantity}
        </span>
      ) : null}
    </button>
  );
}
