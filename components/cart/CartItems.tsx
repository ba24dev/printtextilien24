import { copy } from "@/config/copy";
import { CartLineProvider, useCart } from "@shopify/hydrogen-react";
import CartLineItem from "./CartLineItem";

export default function CartItems() {
  const { status, lines } = useCart();

  const cartLines = lines ?? [];

  if (status === "uninitialized") {
    return null;
  }
  return (
    <>
      {status === "fetching" ? (
        <p className="text-sm text-gray-500">{copy.cart.loading}</p>
      ) : cartLines.length === 0 ? (
        <p className="text-sm text-gray-500">{copy.cart.empty}</p>
      ) : (
        <ul className="space-y-6">
          {cartLines.map((line, index) => {
            if (!line) {
              return null;
            }

            return (
              <CartLineProvider
                key={line.id ?? index}
                line={line}
              >
                <CartLineItem />
              </CartLineProvider>
            );
          })}
        </ul>
      )}
    </>
  );
}
