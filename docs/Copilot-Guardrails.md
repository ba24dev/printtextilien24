# Copilot Guardrails

This document summarizes the workflow rules the user established for this repository. Review it before proposing changes.

## Role & Scope

- Copilot proposes code in chat and maintains documentation.
- Source files (`.ts`, `.tsx`, etc.) are **never** edited or created unless the user explicitly asks for those changes.
- Documentation (`README.md`, files under `docs/`, changelogs, inline comments) may be updated proactively to reflect current work.

### Allowed Without Explicit Request

1. Updating or creating documentation assets (`README.md`, `docs/`, inline comments, changelogs).
2. Suggesting code in chat responses (paste-ready snippets only).
3. Adding examples, setup steps, or usage notes to docs when a new feature or chunk is implemented.

### Requires Explicit Request

1. Editing or creating source code files.
2. Performing refactors or reformatting on existing source files.

## Ground Rules

1. **Repo awareness first** – review `package.json`, `tsconfig.json`, and relevant modules (`lib/`, `app/`, `components/`) before suggesting work.
2. **Follow the chunk plan** – operate only within the currently active chunk; do not pre-implement future steps.
3. **Use existing abstractions** – prefer current dependencies and helpers:
   - Shopify: `@shopify/hydrogen-react`
   - Data: Shopify Storefront GraphQL API
   - Storage: existing adapter via `makeStorage()`
   - Search: Orama helpers already in the repo
4. **Concrete, human-readable code** – no vague utilities or placeholder logic.
5. **Respect versions** – React 18 + Hydrogen React compatibility.
6. **Use official docs** when referencing Shopify, Next.js, Supabase, Orama, etc.; mention version-specific nuances.
7. **Automatic documentation maintenance** – keep README/chunk notes updated when describing new work.
8. **Context7 usage** – rely on Context7 for repo context rather than inventing new context layers.

## Workflow Expectations

1. Scan repository context before proposing changes.
2. Provide code suggestions as complete, paste-ready snippets with file path + purpose metadata.
3. Do not write directly to source files; only suggest changes unless explicitly requested.
4. Keep documentation synchronized with the current implementation status.
5. Match existing formatting, naming, and folder structure.
6. Verify compatibility with React 18 and approved libraries before suggesting code.

## Style Guidelines

- Expressive function/variable names (e.g., `getVariantPrintConfig`).
- Focused functions; clarity over brevity.
- Follow current error-handling/user-feedback conventions.

## Snippet Template

When suggesting code:

````
File: app/(shop)/components/ProductQuickAdd.tsx
Purpose: Quick-add button using useCart from hydrogen-react (React 18 compatible).

```tsx
// complete, paste-ready code
````

```

## Verification Checklist

Before finalizing a suggestion:

- [ ] Uses React 18–safe APIs.
- [ ] Aligns with project naming/structure.
- [ ] Uses existing adapters/hooks.
- [ ] No unauthorized file edits.
- [ ] Fits the active chunk’s goals.
- [ ] Documentation updated (or noted) when needed.

Keep this file handy to avoid future misunderstandings about the workflow.
```
