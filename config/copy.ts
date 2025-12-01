export type Copy = typeof copy;

export const copy = {
  general: {
    businessName: "Printtextilien24",
    noResultsLabel: "Keine Ergebnisse gefunden.",
    noImageLabel: "Kein Bild verfügbar",
  },

  header: {
    brand: "Printtextilien24",
    nav: [
      { label: "Startseite", href: "/" },
      { label: "Produkte", href: "/products" },
      { label: "Personalisieren", href: "/customize" },
    ],
    cartLabel: "Warenkorb",
  },

  search: {
    placeholder: "Produkte suchen…",
    loading: "Lädt…",
    clear: "Suche löschen",
    searching: "Suche läuft…",
    failed: "Suche fehlgeschlagen",
  },

  catalog: {
    collectionsTitle: "Kollektionen",
    sortTitle: "Sortierung",
    noProducts: "Keine Produkte in dieser Kollektion gefunden.",
    productFallbackDescription: "Premium-Qualität – bereit für Ihr Design.",
    productFallbackTitle: "Produktname nicht verfügbar",
    allCollectionsLabel: "Alle",
    sortOptions: {
      relevance: "Relevanz",
      priceAsc: "Preis: Niedrig nach Hoch",
      priceDesc: "Preis: Hoch nach Niedrig",
    },
  },

  cart: {
    title: (quantity: number) => `Ihr Warenkorb (${quantity})`,
    empty: "Ihr Warenkorb ist leer. Fügen Sie Produkte hinzu, um fortzufahren.",
    loading: "Warenkorb wird geladen…",
    close: "Warenkorb schließen",
    subtotal: "Zwischensumme",
    checkout: "Zur Kasse",
    actions: {
      remove: "Aus dem Warenkorb entfernen",
      increase: "Anzahl erhöhen",
      decrease: "Anzahl verringern",
    },
  },

  product: {
    addToCart: "In den Warenkorb",
    addingToCart: "Wird zum Warenkorb hinzugefügt…",
    soldOut: "Ausverkauft",
    descriptionTitle: "Beschreibung",
    highlightsTitle: "Highlights",
    detailsTitle: "Details",
    categoryLabel: "Kategorie",
    brandLabel: "Marke",
    handleLabel: "Handle",
    byLabel: "von",
  },

  marketing: {
    hero: {
      badge: "Printtextilien24.de – Ihr Experte für bedruckte Textilien",
      title: "Ihr Shop für maßgeschneiderte Textilien",
      description:
        "Premium-Textilien zu fairen Preisen – mit schneller Produktion, individuellen Designs und persönlichem Service.",
      primaryCta: "Jetzt einkaufen",
      secondaryCta: "Design anpassen",
      featureBullets: [
        {
          title: "Schneller Versand",
          description:
            "Wir sorgen für eine schnelle Lieferung Ihrer Bestellungen.",
        },
        {
          title: "Kundenservice",
          description: "Unser Team steht Ihnen bei Fragen zur Seite.",
        },
        {
          title: "Individuelle Gestaltung",
          description:
            "Personalisieren Sie Ihre Kleidung mit einzigartigen Designs.",
        },
      ],
    },
    carousel: {
      heading: {
        small: "TSV Heiligenrode Handball",
        main: "Die Knilche",
      },
      viewCollection: "Kollektion ansehen",
    },
    featured: {
      heading: {
        small: "Highlights aus unserem Sortiment",
        main: "Empfohlene Produkte",
      },
      viewAll: "Alle Produkte anzeigen",
    },
  },

  footer: {
    description:
      "Printtextilien24 ist Ihr zuverlässiger Partner für hochwertige, individualisierte Textilien – für Teams, Unternehmen und Events.",
    rightsReserved: "Alle Rechte vorbehalten.",
    columnLinks: {
      shop: [
        { label: "Alle Produkte", href: "/products" },
        { label: "TSV", href: "/collections/tsv" },
        { label: "Allgemein", href: "/collections/allgemein" },
      ],
      company: [
        { label: "Über Printtextilien24", href: "/about" },
        { label: "Busol", href: "https://busol.info" },
        { label: "Karriere", href: "https://www.busol.info/jobs/" },
        { label: "BusinessApp24", href: "https://www.businessapp24.de/" },
        { label: "Kontakt", href: "/contact" },
      ],
      support: [
        { label: "Versand & Rückgabe", href: "/support/shipping" },
        { label: "Bestellstatus", href: "/support/orders" },
        { label: "Datenschutzrichtlinie", href: "/privacy" },
        { label: "AGB", href: "/terms" },
        { label: "Impressum", href: "/imprint" },
      ],
    },
    quickLinks: {
      privacy: "Datenschutz",
      terms: "AGB",
      cookies: "Cookies",
      sitemap: "Sitemap",
    },
    columnTitles: {
      shop: "Shop",
      company: "Unternehmen",
      support: "Support",
    },
  },

  actions: {
    close: "Schließen",
    submit: "Senden",
    cancel: "Abbrechen",
  },

  notifications: {
    successSubscription: "Vielen Dank für Ihre Anmeldung!",
    errorGeneric: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },

  errors: {
    missingShopifyConfig: "Shopify-Konfiguration fehlt",
  },

  theme: {
    light: "Hell",
    dark: "Dunkel",
    system: "System",
  },

  customizer: {
    uploadLabel: "Datei auswählen",
    uploadHelp:
      "Bildformate SVG, PNG, JPG oder GIF.\nMaximale Dateigröße: 5MB.",
    scalingInfo: "Bilder werden automatisch auf ihre maximale Größe skaliert.",
    reset: "Zurücksetzen",
  },
};
