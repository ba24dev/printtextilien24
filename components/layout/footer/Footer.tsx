import { copy } from "@/config/copy";
import Link from "next/link";
import { FooterColumn } from "./FooterColumn";

export default function Footer() {
  return (
    <footer className="bg-background/50 pt-16 text-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 border-b border-foreground/10 pb-12 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <div>
              <span className="text-lg font-semibold tracking-wide text-primary-200">
                {copy.general.businessName}
              </span>
              <p className="mt-3 text-sm text-foreground/70">{copy.footer.description}</p>
            </div>
          </div>

          <FooterColumn
            heading={copy.footer.columnTitles.shop}
            links={copy.footer.columnLinks.shop}
          />
          <FooterColumn
            heading={copy.footer.columnTitles.company}
            links={copy.footer.columnLinks.company}
          />
          <FooterColumn
            heading={copy.footer.columnTitles.support}
            links={copy.footer.columnLinks.support}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-6 text-xs text-foreground/60 md:flex-row">
          <span>
            © {new Date().getFullYear()} {copy.general.businessName}. {copy.footer.rightsReserved}
          </span>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="hover:text-primary-200"
            >
              {copy.footer.quickLinks.privacy}
            </Link>
            {/* <Link
              href="/terms"
              className="hover:text-primary-200"
            >
              {copy.footer.quickLinks.terms}
            </Link>
            <Link
              href="/cookies"
              className="hover:text-primary-200"
            >
              {copy.footer.quickLinks.cookies}
            </Link> */}
            <Link
              href="/sitemap"
              className="hover:text-primary-200"
            >
              {copy.footer.quickLinks.sitemap}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
