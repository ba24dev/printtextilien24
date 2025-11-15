import Link from "next/link";

const SHOP_LINKS = [
    { label: "All Products", href: "/products" },
    { label: "TSV", href: "/collections/tsv" },
    { label: "Allgemein", href: "/collections/allgemein" },
];

const COMPANY_LINKS = [
    { label: "About Printtextilien24", href: "/about" },
    { label: "Busol", href: "https://busol.info" },
    { label: "Careers", href: "https://www.busol.info/jobs/" },
    { label: "BusinessApp24", href: "https://www.businessapp24.de/" },
    { label: "Contact", href: "/contact" },
];

const SUPPORT_LINKS = [
    { label: "Shipping & Returns", href: "/support/shipping" },
    { label: "Order Status", href: "/support/orders" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Imprint", href: "/imprint" },
];

export default function Footer() {
    return (
        <footer className="bg-background/50 pt-16 text-foreground">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-12 border-b border-foreground/10 pb-12 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
                    <div className="space-y-6">
                        <div>
                            <span className="text-lg font-semibold tracking-wide text-primary-200">
                                Printtextilien24
                            </span>
                            <p className="mt-3 text-sm text-foreground/70">
                                Your one-stop partner for custom apparel and branded textiles.
                            </p>
                        </div>
                    </div>

                    <FooterColumn heading="Shop" links={SHOP_LINKS} />
                    <FooterColumn heading="Company" links={COMPANY_LINKS} />
                    <FooterColumn heading="Support" links={SUPPORT_LINKS} />
                </div>

                <div className="flex flex-col items-start justify-between gap-4 py-6 text-xs text-foreground/60 md:flex-row">
                    <span>© {new Date().getFullYear()} Printtextilien24. All rights reserved.</span>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/privacy" className="hover:text-primary-200">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-primary-200">
                            Terms
                        </Link>
                        <Link href="/cookies" className="hover:text-primary-200">
                            Cookies
                        </Link>
                        <Link href="/sitemap" className="hover:text-primary-200">
                            Sitemap
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

interface FooterColumnProps {
    heading: string;
    links: { label: string; href: string }[];
}

function FooterColumn({ heading, links }: FooterColumnProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">{heading}</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
                {links.map(({ label, href }) => (
                    <li key={label}>
                        <Link href={href} className="transition hover:text-primary-200">
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
