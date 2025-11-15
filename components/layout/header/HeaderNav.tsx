import { copy } from "@/config/copy";
import Link from "next/link";

export default function HeaderNav() {
  return (
    <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/60 md:flex">
      {copy.header.nav.map(({ href, label }) => (
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
  );
}
