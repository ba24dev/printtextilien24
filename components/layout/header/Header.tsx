"use client";

import { copy } from "@/config/copy";
import { useCart } from "@shopify/hydrogen-react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "../../cart/CartDrawer";
import Search from "../../catalog/search/Search";
import ThemeSwitcher from "../ThemeSwitcher";
import CartButton from "./CartButton";
import HeaderNav from "./HeaderNav";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { totalQuantity } = useCart();
  const quantity = totalQuantity ?? 0;

  return (
    <>
      <header className="border-b dark:border-primary-900/40 border-primary-100/40 bg-background/80 backdrop-blur fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-primary-100">
              {copy.general.businessName}
            </Link>
            <HeaderNav />
          </div>
          <div className="relative mx-auto hidden w-full max-w-xl md:block">
            <Search />
          </div>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <ThemeSwitcher />
            <Link
              href="/api/auth/customer/login"
              prefetch={false}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600 cursor-pointer"
              title="Login"
              aria-label="Login"
            >
              <LogIn className="aspect-square w-5" />
            </Link>
            <CartButton quantity={quantity} onClickAction={setDrawerOpen} />
          </div>
        </div>
        <div className="border-t border-primary-900/30 px-6 pb-4 pt-3 md:hidden">
          <div className="relative">
            <Search />
          </div>
        </div>
      </header>
      <CartDrawer
        isOpen={drawerOpen}
        onCloseAction={() => setDrawerOpen(false)}
      />
    </>
  );
}
