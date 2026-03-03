// lightweight wrapper around eRecht24 REST API
// since there is no npm package any more, we just call the endpoints directly

const BASE_URL = "https://api.e-recht24.de";

export type LegalTextType = "privacy" | "imprint";

export async function fetchLegalText(type: LegalTextType): Promise<string | null> {
  let apiKey = process.env.ERECHT24_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.warn("ERECHT24_API_KEY not set; legal text lookup will be disabled");
    return null;
  }
  apiKey = apiKey.trim();
  // we still gate on having an API key because earlier versions of the docs
  // implied one would be needed; leaving the key blank acts as a convenient
  // feature flag.  In practice the GET endpoints shown in the docs don't
  // require authentication, but we keep the parameter just in case.

  // the new v2 API exposes two simple GET endpoints:
  //   GET /v2/privacyPolicy
  //   GET /v2/imprint
  // (there is also a POST /v2/push/<types> used by eRecht24 to trigger a
  // refresh, which we don't need for read-only usage.)
  const path = type === "privacy" ? "privacyPolicy" : "imprint";
  const url = `${BASE_URL}/v2/${path}${apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        console.warn("eRecht24 returned 404, check API key or endpoint");
        return null;
      }
      if (res.status === 401) {
        console.warn("eRecht24 returned 401 – unauthorized. make sure ERECHT24_API_KEY is valid");
        return null;
      }
      console.error("eRecht24 fetch failed", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    // response should include { html: string }
    return json.html || null;
  } catch (err) {
    console.error("eRecht24 fetch error", err);
    return null;
  }
}
