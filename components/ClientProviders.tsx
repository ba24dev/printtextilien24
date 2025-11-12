"use client";
import { CartProvider } from "@shopify/hydrogen-react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
