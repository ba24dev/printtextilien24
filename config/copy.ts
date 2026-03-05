export type Copy = typeof copy;

export const copy = {
  general: {
    businessName: "Printtextilien24",
    noResultsLabel: "Keine Ergebnisse gefunden.",
    noImageLabel: "Kein Bild verfügbar",
  },

  home: {
    loading: "Startseite wird geladen…",
  },

  header: {
    brand: "Printtextilien24",
    nav: [
      { label: "Startseite", href: "/" },
      { label: "Produkte", href: "/products" },
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
    loading: "Lädt…",
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
    customizableBadge: "Individualisierbar",
    printSurfacesTitle: "Druckflächen",
    uploadRequired: "Bitte Bild hochladen und platzieren, um fortzufahren",
    previewAlt: (name: string) => `Vorschau ${name}`,
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
          description: "Wir sorgen für eine schnelle Lieferung Ihrer Bestellungen.",
        },
        {
          title: "Kundenservice",
          description: "Unser Team steht Ihnen bei Fragen zur Seite.",
        },
        {
          title: "Individuelle Gestaltung",
          description: "Personalisieren Sie Ihre Kleidung mit einzigartigen Designs.",
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
        { label: "Busol", href: "https://busol.info" },
        { label: "Karriere", href: "https://www.busol.info/jobs/" },
        { label: "BusinessApp24", href: "https://www.businessapp24.de/" },
        {
          label: "Kontakt",
          href: "/contact",
        },
      ],
      support: [
        { label: "Datenschutzrichtlinie", href: "/privacy" },
        { label: "Impressum", href: "/imprint" },
      ],
    },
    quickLinks: {
      privacy: "Datenschutz",
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
    sending: "Wird gesendet…",
    cancel: "Abbrechen",
  },

  auth: {
    loginLabel: "Anmelden",
    accountMenuLabel: "Kontomenü",
    profileLabel: "Profil",
    logoutLabel: "Abmelden",
    signInTitle: "Anmelden",
    signInWithShopify: "Mit Shopify anmelden",
    redirectHint: "Sie werden zu Shopify weitergeleitet, um Ihr Kundenkonto zu authentifizieren.",
    logoutNotice:
      "Sie wurden auf dieser Seite abgemeldet. Auf gemeinsam genutzten Geräten kann beim Anbieter weiterhin eine Sitzung bestehen. Klicken Sie unten, um sich explizit neu anzumelden.",
    checkoutUnavailable:
      "Ihre vorherige Checkout-Sitzung ist nicht mehr verfügbar. Bitte öffnen Sie den Checkout erneut aus dem Warenkorb.",
    sessionExpired:
      "Ihre Anmeldesitzung ist abgelaufen. Bitte klicken Sie erneut auf Anmelden.",
    invalidCallback:
      "Ungültige Authentifizierungs-Antwort. Bitte starten Sie die Anmeldung erneut.",
  },

  account: {
    title: "Konto",
    loadErrorTitle: "Kontodaten konnten nicht geladen werden.",
    hostError: "Host konnte für die Kontodaten-Anfrage nicht ermittelt werden.",
    apiError: (status: number) => `Konto-API Anfrage fehlgeschlagen (${status}).`,
    profileFetchError: "Kundenprofil konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    retry: "Erneut versuchen",
    checkoutUnavailable:
      "Ihre vorherige Checkout-Sitzung ist nicht mehr verfügbar. Bitte gehen Sie zurück zum Warenkorb und starten Sie den Checkout erneut.",
    noEmail: "Keine E-Mail verfügbar",
    profileUnavailable: "Profildaten konnten nicht geladen werden.",
    ordersTitle: "Bestellungen",
    noOrders: "Noch keine Bestellungen vorhanden.",
    orderPrefix: "Bestellung",
    orderDateLabel: "Datum",
    orderTotalLabel: "Gesamt",
  },

  sitemap: {
    title: "Sitemap",
    description: "Übersicht über die wichtigsten Seiten dieser Website.",
    paths: [
      { label: "Startseite", href: "/" },
      { label: "Produkte", href: "/products" },
      { label: "Kollektion: TSV", href: "/collections/tsv" },
      { label: "Kollektion: Allgemein", href: "/collections/allgemein" },
      { label: "Kontakt", href: "/contact" },
      { label: "Datenschutz", href: "/privacy" },
      { label: "Impressum", href: "/imprint" },
      { label: "XML Sitemap (für Suchmaschinen)", href: "/sitemap.xml" },
    ],
  },

  contact: {
    heading: "Schreiben Sie uns",
    description: "Wir freuen uns auf Ihre Nachricht. Bitte füllen Sie das Formular aus.",
    nameLabel: "Name",
    emailLabel: "E-Mail",
    messageLabel: "Nachricht",
    success: "Ihre Nachricht wurde gesendet. Wir melden uns in Kürze.",
    error: "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
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
    uploadHelp: "Bildformate SVG, PNG, JPG oder GIF.\nMaximale Dateigröße: 5MB.",
    scalingInfo: "Bilder werden automatisch auf ihre maximale Größe skaliert.",
    reset: "Zurücksetzen",
  },
};
