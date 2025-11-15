import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Printtextilien24.de",
    description: "Ihr Online-Shop für bedruckte Textilien",
};

import ClientProviders from "@/components/layout/ClientProviders";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ClientProviders>
                    <Header />
                    {children}
                    <Footer />
                </ClientProviders>
            </body>
        </html>
    );
}
