import Link from "next/link";

interface FooterColumnProps {
  heading: string;
  links: { label: string; href: string }[];
}

export function FooterColumn({ heading, links }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
        {heading}
      </h3>
      <ul className="space-y-3 text-sm text-foreground/70">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="transition hover:text-primary-200"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
