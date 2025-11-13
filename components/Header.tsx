"use client";

import { useSearchProducts } from "@/app/hooks/useSearchProducts";
import { useCart } from "@shopify/hydrogen-react";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "./Cart/CartDrawer";
import SearchInput from "./Search/SearchInput";
import SearchResults from "./Search/SearchResults";

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const { totalQuantity } = useCart();
    const quantity = totalQuantity ?? 0;

    const search = useSearchProducts();

    return (
        <>
            <header className="flex items-center justify-between border-b px-6 py-4 h-16">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">
                        <Link href="/">Printtextilien24</Link>
                    </h1>
                </div>
                <div className="relative w-full max-w-xl">
                    <SearchInput
                        value={search.query}
                        onChangeAction={search.setQuery}
                        isLoading={search.isLoading}
                        onClearAction={search.reset}
                    />
                    <SearchResults
                        show={search.query.length >= 2}
                        results={search.results}
                        isLoading={search.isLoading}
                        isError={search.isError}
                        error={search.error}
                        onSelectAction={search.reset}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
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
            <CartDrawer isOpen={drawerOpen} onCloseAction={() => setDrawerOpen(false)} />
        </>
    );
}
