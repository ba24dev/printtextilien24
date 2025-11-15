import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Printtextilien24.de",
    description: "Ihr Online-Shop für bedruckte Textilien",
};

import ClientProviders from "@/components/ClientProviders";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

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
