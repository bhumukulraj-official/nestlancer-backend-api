#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "🧪 Running E2E tests..."
echo "  Requires full stack running"

# Verify gateway is accessible
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [[ "${HEALTH_STATUS}" != "200" ]]; then
  echo "❌ API Gateway is not running. Start with: make dev"
  exit 1
fi

pnpm turbo test:e2e -- --passWithNoTests

echo "✅ E2E tests complete"
