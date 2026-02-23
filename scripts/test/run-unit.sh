#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

FILTER="${1:-}"

echo "🧪 Running unit tests..."

if [[ -n "${FILTER}" ]]; then
  echo "  Filter: ${FILTER}"
  pnpm turbo test --filter="${FILTER}" -- --passWithNoTests
else
  pnpm turbo test -- --passWithNoTests
fi

echo "✅ Unit tests complete"
