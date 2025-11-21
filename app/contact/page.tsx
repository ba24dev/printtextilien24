export default function KontaktPage() {
  const mailto = "mailto://sales@printtextilien.de";

  return (
    <main className="bg-linear-to-b from-primary-900/50 via-primary-500/25 to-background">
      <section className="bg-background/50 py-48 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-6 dark:prose-invert prose max-w-full">
            <header className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
                Aufregendes steht bevor...
              </h1>
            </header>

            <p className="mt-6 text-lg leading-relaxed">
              User Printshop ist noch immer im Aufbau, jedoch soll Sie das nicht abhalten schon
              jetzt hochwertigen Textildruck und individuelle Veredelung zu bestellen.
            </p>

            <p className="mt-4 text-lg leading-relaxed">
              Ob T-Shirts, Hoodies, Workwear oder Teamkleidung - wir bringen Ihr Design auf Stoff.
              Bis zum Launch beraten wir Sie gerne auch persönlich und erstellen auf Wunsch Ihr
              individuelles Angebot.
            </p>

            <address className="mt-8 not-italic text-base">
              <div className="mb-2">
                <strong>Telefon: </strong>
                <a
                  href="tel:+4956193719010"
                  className="text-primary-400 font-bold hover:underline"
                >
                  0561 / 93719010
                </a>
              </div>

              <div>
                <strong>E-Mail: </strong>
                <a
                  href="mailto://sales@printtextilien.de?subject=Druckanfrage%20von%20Printtextilien24.de&body=Name%3A%20Max%20Mustermann%0A%0AAnfrage%3A%20%0ABeschreiben%20Sie%20hier%20bitte%20die%20Details%20Ihrer%20Anfrage.%20%0AGerne%20k%C3%B6nnen%20Sie%20hier%20auch%20um%20R%C3%BCckruf%20bitten%20und%20wir%20versuchen%20Sie%20yum%20gew%C3%BCnschten%20Zeitpunkt%20zu%20kontaktieren.%0A%0AVielen%20Dank"
                  className="text-primary-400 font-bold hover:underline"
                >
                  {mailto.replace(/^mailto:\/\//, "")}
                </a>
              </div>
            </address>
          </div>
        </div>
      </section>
    </main>
  );
}
