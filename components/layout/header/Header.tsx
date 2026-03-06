"use client";

import { copy } from "@/config/copy";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useCart } from "@shopify/hydrogen-react";
import { DropdownMenu } from "radix-ui";
import { LogIn, LogOut, UserRound } from "lucide-react";
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
  const session = useAuthSession();
  const quantity = totalQuantity ?? 0;
  const isLoggedIn = Boolean(session?.loggedIn);
  const accountInitial = session?.email?.trim().charAt(0).toUpperCase() ?? "A";

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
            {isLoggedIn ? (
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600"
                    title={copy.auth.accountMenuLabel}
                    aria-label={copy.auth.accountMenuLabel}
                  >
                    <span className="text-sm font-semibold leading-none">{accountInitial}</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="end"
                  className="min-w-44 rounded-xl border border-primary-900/40 bg-background p-2 text-sm text-foreground shadow-lg shadow-primary-900/40"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/account"
                      className="flex select-none items-center gap-3 rounded-lg px-3 py-2 hover:bg-primary-900/25 focus:outline-none"
                    >
                      <UserRound className="h-4 w-4" />
                      {copy.auth.profileLabel}
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={(event) => {
                      event.preventDefault();
                      window.location.assign("/account/logout");
                    }}
                    className="flex w-full select-none items-center gap-3 rounded-lg px-3 py-2 text-red-300 hover:bg-primary-900/25 focus:outline-none"
                  >
                    <LogOut className="h-4 w-4" />
                    {copy.auth.logoutLabel}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <Link
                href="/account/login"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600 cursor-pointer"
                title={copy.auth.loginLabel}
                aria-label={copy.auth.loginLabel}
              >
                <LogIn className="aspect-square w-5" />
              </Link>
            )}
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
