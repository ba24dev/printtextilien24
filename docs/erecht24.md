# eRecht24 Integration Guide

This document describes how the eRecht24 legal-text API is wired into
Printtextilien24 and how you can update/extend the integration.

---

## Background

The eRecht24 service provides ready‑made privacy policies and imprints for
German websites. A premium account grants an _API key_ that can be used to
fetch the texts.

An official TypeScript client (`erecht24`) used to be published to npm but
has since been removed. To continue using it, the project vendorises the
source code locally and exposes a thin wrapper.

The implementation lives under:

```
lib/erecht24-package/   # copied from https://github.com/LILA-IT/eRecht24/src
lib/erecht24.ts         # local helper that exports `fetchLegalText`
```

`fetchLegalText` is what the application code calls. It reads the
`ERECHT24_API_KEY` environment variable and instantiates the client with
it, then returns either the German HTML, the English fallback or `null`.
A factory parameter is exposed for easier unit testing.

The privacy page (`app/privacy/page.tsx`) invokes `fetchLegalText` and
falls back to static content if the call returns `null`.

Tests for the helper can be found in `tests/erecht24.test.ts`; they inject
fake clients rather than making real HTTP requests.

### Environment variable

Set in your `.env.local` (or via Vercel/CI settings):

```dotenv
ERECHT24_API_KEY="your-real-key"
```

You may leave it blank to disable remote fetching entirely. The helper
trims whitespace and logs a warning if the key is missing or invalid.

### Updating the vendored package

1. Clone or download the latest version of the repository:
   https://github.com/LILA-IT/eRecht24
2. Copy the contents of the `src/` directory into `lib/erecht24-package/`
   replacing the existing files. (`package.json` is copied for licensing
   information only.)
3. Run `pnpm install` to ensure any new runtime dependencies (e.g.
   `lru-cache`) are added to your workspace.
4. Adjust any local imports in `lib/erecht24.ts` if the package structure
   changes.
5. Update tests if the client API has changed.

### Using the helper

```ts
import { fetchLegalText } from "@/lib/erecht24";

const privacyHtml = await fetchLegalText("privacy");
if (privacyHtml) {
  // render the HTML via dangerouslySetInnerHTML or similar
}
```

You can also pass a custom factory (useful for diagnostics or alternate
clients):

```ts
const html = await fetchLegalText("imprint", (key) => new MyCustomClient(key));
```

### Caching & push

The vendored client already includes an in‑memory LRU cache with a 2‑hour
TTL. You can supplement this with an external cache (Redis, etc.) by
wrapping `ERecht24` or creating your own factory.

Push notifications are not used by this site, but the underlying client
supports registration and pull‑on‑push. See the original repository for
details if you wish to implement that later.

---

Keep this document in sync with `README.md` and refer to it when rolling
out new legal texts or upgrading the integration.
