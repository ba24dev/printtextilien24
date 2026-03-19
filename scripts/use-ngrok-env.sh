#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_ENV="$ROOT_DIR/.env.local"
OVERRIDE_ENV="$ROOT_DIR/.env.dev.local"
TARGET_ENV="$ROOT_DIR/.env.development.local"

if [[ ! -f "$BASE_ENV" ]]; then
  echo "Missing $BASE_ENV" >&2
  exit 1
fi

if [[ ! -f "$OVERRIDE_ENV" ]]; then
  echo "Missing $OVERRIDE_ENV" >&2
  exit 1
fi

cp "$BASE_ENV" "$TARGET_ENV"
printf "\n# ngrok auth test overrides\n" >> "$TARGET_ENV"
cat "$OVERRIDE_ENV" >> "$TARGET_ENV"

echo "Created $TARGET_ENV from .env.local + .env.dev.local"
