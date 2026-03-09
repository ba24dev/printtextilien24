# 2026-03-09 - Buy Again UX: Modal + Toast

## Goal
Improve Buy Again interaction on account orders:
- confirmation as modal overlay
- feedback as toast notification

## Changes
- Updated `app/account/BuyAgainButton.tsx`:
  - Replaced inline confirmation block with centered modal (`Zusammenführen`, `Ersetzen`, `Abbrechen`).
  - Added backdrop click + `Escape` key to close modal when not busy.
  - Replaced inline feedback text with floating top-right toast.
  - Added toast auto-dismiss.

## Validation
- `pnpm run typecheck` passes.
