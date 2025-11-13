"use client";

import { useCart } from "@shopify/hydrogen-react";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "./Cart/CartDrawer";

export default function Header() {
    const [open, setOpen] = useState<boolean>(false);
    const { totalQuantity } = useCart();
    const quantity = totalQuantity ?? 0;

    return (
        <>
            <header className="flex items-center justify-between border-b px-6 py-4 h-16">
                <h1 className="text-xl font-semibold">
                    <Link href="/">Printtextilien24</Link>
                </h1>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="relative rounded-full border border-gray-300 px-3 py-1 text-sm cursor-pointer"
                >
                    Cart
                    {quantity ? (
                        <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                            {quantity}
                        </span>
                    ) : null}
                </button>
            </header>
            <CartDrawer isOpen={open} onCloseAction={() => setOpen(false)} />
        </>
    );
}
