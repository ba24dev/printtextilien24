#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ENV="$ROOT_DIR/.env.development.local"

if [[ -f "$TARGET_ENV" ]]; then
  rm -f "$TARGET_ENV"
  echo "Removed $TARGET_ENV"
else
  echo "No .env.development.local to remove"
fi
