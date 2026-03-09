# 2026-03-09 - Address Delete Safety + Modal

## Goal
Improve destructive address actions and enforce safer default-address behavior.

## Changes
- Replaced inline delete confirmation with a modal confirmation dialog.
- Made default address non-deletable.
- Locked default checkbox when there is only one address (`Standard` cannot be unset in that case).
- Styled destructive delete actions with red/destructive coloring.

## Validation
- `pnpm run typecheck` passes.
