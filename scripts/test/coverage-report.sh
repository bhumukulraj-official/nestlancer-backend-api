#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "📊 Generating coverage report..."

pnpm turbo test -- --coverage --passWithNoTests

# Merge coverage reports
echo ""
echo "Coverage reports generated in each package's coverage/ directory."
echo ""

# Summary
echo "📋 Coverage Summary:"
find . -name "coverage-summary.json" -not -path "*/node_modules/*" -exec echo "  {}" \;

echo ""
echo "ℹ️  Open HTML reports with:"
echo "  open <service>/coverage/lcov-report/index.html"
