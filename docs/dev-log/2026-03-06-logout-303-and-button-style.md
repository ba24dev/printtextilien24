# 2026-03-06 - Logout POST redirect semantics and button styling

## Issue
- Logout via POST could redirect to Shopify with status `307`, which preserves method and may send POST to provider endpoint.
- Provider logout endpoint expects navigation flow semantics, causing verification errors.

## Fix
- Changed logout redirect to `303 See Other` so POST transitions to GET on redirect.
- Updated account page logout action to use project button style (`btn-primary small`) instead of text link styling.

## Expected
- More reliable provider logout completion after POST-triggered logout.
- Consistent visual treatment with regular site buttons.
