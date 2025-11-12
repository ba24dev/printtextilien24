import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printtextilien24.de",
  description: "Ihr Online-Shop für bedruckte Textilien",
};

import ClientProviders from "@/components/ClientProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
