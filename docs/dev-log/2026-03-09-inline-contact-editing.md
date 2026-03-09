# 2026-03-09 - Inline contact details editing UX

## Update
- Reworked account top contact panel to inline edit pattern:
  - default state: read-only name + email,
  - edit icon toggles in-place input fields (no extra detail row),
  - save/cancel controls shown while editing.

## API compatibility
- Profile update route now accepts `fullName` + `email` form fields.
- Name is split into first/last names server-side; displayName is updated too.
- Existing explicit first/last/displayName form fields remain supported.

## UX requirement covered
- Contact section no longer renders phone value.
- Phone remains managed in address cards/forms only.
