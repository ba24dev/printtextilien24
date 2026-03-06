# 2026-03-06 - Fix dropdown logout form disconnect

## Symptom
- Header dropdown logout showed browser warning:
  `Form submission canceled because the form is not connected`.

## Root cause
- Logout form lived inside a Radix dropdown item.
- Menu close/unmount happened before form submit could complete.

## Fix
- Replaced dropdown form submit with menu `onSelect` handler:
  `window.location.assign('/account/logout')`.
- This forces full-page navigation and avoids transient form lifecycle issues in dropdown overlays.
