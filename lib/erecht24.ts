// lightweight wrapper around eRecht24 REST API
// since there is no npm package any more, we just call the endpoints directly

const BASE_URL = "https://api.e-recht24.de";
const API_KEY = process.env.ERECHT24_API_KEY;

if (!API_KEY) {
  console.warn("ERECHT24_API_KEY not set; legal text lookup will be disabled");
}

export type LegalTextType = "privacy" | "imprint";

export async function fetchLegalText(type: LegalTextType): Promise<string | null> {
  if (!API_KEY) return null;
  // the real API requires a specific path; consult the API docs when using.
  // here we assume there is an endpoint /v1/text/{type} ?api_key=...

  const url = `${BASE_URL}/v1/text/${type}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("eRecht24 fetch failed", res.status, await res.text());
    return null;
  }
  const json = await res.json();
  // assume the response has { html: string }
  return json.html || null;
}
