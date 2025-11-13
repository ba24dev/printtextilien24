"use client";

import { CartCheckoutButton, CartCost, CartLineProvider, useCart } from "@shopify/hydrogen-react";
import { CloseSVG } from "../SVG/Icons";
import CartLineItem from "./CartLineItem";

type CartDrawerProps = {
    isOpen: boolean;
    onCloseAction: () => void;
};

export default function CartDrawer({ isOpen, onCloseAction }: CartDrawerProps) {
    const { status, totalQuantity, lines } = useCart();
    const quantity = totalQuantity ?? 0;
    const cartLines = lines ?? [];

    if (status === "uninitialized") {
        return null;
    }

    return (
        <div
            aria-hidden={!isOpen}
            className={`fixed inset-0 z-50  ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onCloseAction}
                role="presentation"
            />
            <aside
                className={`absolute right-0 top-0 transform transition-transform duration-300  flex h-full w-full max-w-md flex-col bg-gray-800 shadow-xl ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <header className="flex items-center justify-between border-b px-6 py-4 h-16">
                    <h2 className="text-lg font-semibold">Your Cart ({quantity})</h2>
                    <button
                        className="text-sm text-gray-500 cursor-pointer hover:text-gray-300"
                        type="button"
                        onClick={onCloseAction}
                    >
                        <CloseSVG height={6} width={6} />
                    </button>
                </header>

                <section className="flex-1 overflow-y-auto px-6 py-4">
                    {status === "fetching" ? (
                        <p className="text-sm text-gray-500">Loading cart...</p>
                    ) : cartLines.length === 0 ? (
                        <p className="text-sm text-gray-500">Your cart is empty. Continue shopping to add items.</p>
                    ) : (
                        <ul className="space-y-6">
                            {cartLines.map((line, index) => {
                                if (!line) {
                                    return null;
                                }

                                return (
                                    <CartLineProvider key={line.id ?? index} line={line}>
                                        <CartLineItem />
                                    </CartLineProvider>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <footer className="border-t px-6 py-4">
                    <div className="flex items-center justify-between text-sm">
                        <span>Subtotal</span>
                        <CartCost amountType="subtotal" />
                    </div>
                    <CartCheckoutButton className="mt-4 w-full rounded bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-900 cursor-pointer">
                        Checkout
                    </CartCheckoutButton>
                </footer>
            </aside>
        </div>
    );
}
