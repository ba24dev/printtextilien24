import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printtextilien24.de",
  description: "Ihr Online-Shop für bedruckte Textilien",
};

import ClientProviders from "@/components/layout/ClientProviders";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Header />
          {children}
          <Footer />

          {/* cookie consent managed by CCM19 */}
          <Script
            src="https://cloud.ccm19.de/app.js?apiKey=ba2404d745270c7dbd5d2415008691fe04fe138d1e0e6f4c&domain=69a69b55c940d57b360a53d3"
            referrerPolicy="origin"
            strategy="afterInteractive"
          />
        </ClientProviders>
      </body>
    </html>
  );
}
