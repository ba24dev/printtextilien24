import { copy } from "@/config/copy";

export default function SitemapPage() {
  const paths = copy.sitemap.paths;

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <header className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                {copy.sitemap.title}
              </h1>
              <p className="max-w-lg text-base text-foreground/70 md:text-lg">
                {copy.sitemap.description}
              </p>
            </header>

            <ul className="list-disc pl-6 space-y-2">
              {paths.map((p) => (
                <li key={p.href}>
                  <a
                    className="text-blue-600 hover:underline"
                    href={p.href}
                  >
                    {p.label}
                  </a>
                  <span className="text-sm text-gray-600 ml-2">{p.href}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
