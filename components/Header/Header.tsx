"use client";

import { useSearchProducts } from "@/hooks/useSearchProducts";
import { useCart } from "@shopify/hydrogen-react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "../Cart/CartDrawer";
import SearchInput from "../Search/SearchInput";
import SearchResults from "../Search/SearchResults";
import ThemeSwitcher from "./ThemeSwitcher";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/customize", label: "Customize" },
];

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const { totalQuantity } = useCart();
    const quantity = totalQuantity ?? 0;

    const search = useSearchProducts();

    return (
        <>
            <header className="border-b dark:border-primary-900/40 border-primary-100/40 bg-background/80 backdrop-blur fixed top-0 left-0 right-0 z-50">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-lg font-semibold text-primary-100">
                            Printtextilien24
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/60 md:flex">
                            {NAV_LINKS.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="transition hover:text-primary-200"
                                    prefetch={false}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="relative mx-auto hidden w-full max-w-xl md:block">
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
                    <div className="ml-auto flex items-center gap-3 md:ml-0">
                        <ThemeSwitcher />

                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600 cursor-pointer"
                            aria-label="Open cart"
                        >
                            <ShoppingCart className="aspect-square w-5" />
                            {quantity ? (
                                <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-400 px-1 text-[0.65rem] font-semibold text-background">
                                    {quantity}
                                </span>
                            ) : null}
                        </button>
                    </div>
                </div>
                <div className="border-t border-primary-900/30 px-6 pb-4 pt-3 md:hidden">
                    <div className="relative">
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
                </div>
            </header>
            <CartDrawer isOpen={drawerOpen} onCloseAction={() => setDrawerOpen(false)} />
        </>
    );
}
