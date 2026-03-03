// wrapper around the official eRecht24 Typescript client that was
// previously maintained in its own repository. the package source has been
// vendored into `lib/erecht24-package` and the helpers below expose a simple
// `fetchLegalText` function matching the original API.

import { ERecht24 } from "./erecht24-package/erecht24";

export type LegalTextType = "privacy" | "imprint";

// factory exposed for easier testing; callers that want to customise the
// client (e.g. to use a mock) can override this.
export function createClient(apiKey: string) {
  return new ERecht24(apiKey);
}

// `clientFactory` is primarily a test hook; callers can supply a
// different implementation to avoid instantiating the real client.
export async function fetchLegalText(
  type: LegalTextType,
  clientFactory: (key: string) => any = createClient,
): Promise<string | null> {
  const key = process.env.ERECHT24_API_KEY?.trim();
  if (!key) {
    console.warn("ERECHT24_API_KEY not set; legal text lookup will be disabled");
    return null;
  }

  try {
    const client = clientFactory(key);
    const doc = type === "privacy" ? await client.PrivacyPolicy : await client.Imprint;
    if (!doc) {
      return null;
    }
    // prefer German HTML, fall back to English
    return (doc.htmlDe || doc.htmlEn) ?? null;
  } catch (err) {
    console.error("eRecht24 client error", err);
    return null;
  }
}
