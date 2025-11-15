"use client";

import CartFooter from "./CartFooter";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";

type CartDrawerProps = {
  isOpen: boolean;
  onCloseAction: () => void;
};

export default function CartDrawer({ isOpen, onCloseAction }: CartDrawerProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50  ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCloseAction}
        role="presentation"
      />
      <aside
        className={`absolute right-0 top-0 transform transition-transform duration-300  flex h-full w-full max-w-md flex-col bg-background shadow-xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <CartHeader onCloseAction={onCloseAction} />

        <section className="flex-1 overflow-y-auto px-6 py-4">
          <CartItems />
        </section>
        <CartFooter />
      </aside>
    </div>
  );
}
