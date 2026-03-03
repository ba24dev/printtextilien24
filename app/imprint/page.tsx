import { fetchLegalText } from "@/lib/erecht24";

export default async function ImpressumPage() {
  const remoteHtml = await fetchLegalText("imprint");

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
          {remoteHtml ? (
            <div
              className="flex-1 space-y-6 dark:prose-invert prose max-w-full"
              dangerouslySetInnerHTML={{ __html: remoteHtml }}
            />
          ) : (
            <div className="flex-1 space-y-6 dark:prose-invert prose max-w-full">
              <header className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                  Impressum
                </h1>
              </header>
              <p>
                Frank Spohr
                <br />
                Business Solutions
                <br />
                Inhaber Frank Spohr
                <br />
                Söhrestraße 2a
                <br />
                34266 Niestetal
              </p>

              <h2>Kontakt</h2>
              <p>
                Telefon: +49 (0)561 93 71 90 1 - 0
                <br />
                E-Mail: <a href="mailto:info@busol.info">info@busol.info</a>
              </p>

              <h2>Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                DE 225 660 987
              </p>

              <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
