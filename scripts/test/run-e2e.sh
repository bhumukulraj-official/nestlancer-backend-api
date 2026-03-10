#!/usr/bin/env bash
# ──────────────────────────────────────────────────
# Nestlancer – E2E Test Runner
# ──────────────────────────────────────────────────
# This script:
# 1. Starts the full Docker Compose test stack
# 2. Waits for health checks
# 3. Runs Prisma migrations on the E2E database
# 4. Executes the E2E test suite
# 5. Tears down the stack on exit
#
# Usage:
#   bash scripts/test/run-e2e.sh           # Run all E2E tests
#   bash scripts/test/run-e2e.sh auth      # Run only auth E2E tests

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml"
GATEWAY_URL="http://localhost:3000/api/v1/health"
WS_GATEWAY_URL="http://localhost:3100/health"
MAX_RETRIES=60
RETRY_INTERVAL=3
FILTER="${1:-}"

# ── Cleanup on exit ──────────────────────────────────────────

cleanup() {
    echo ""
    echo "🧹 Tearing down E2E test stack..."
    docker compose ${COMPOSE_FILES} down --remove-orphans 2>/dev/null || true
    echo "✅ Stack torn down."
}

trap cleanup EXIT

# ── Start stack ──────────────────────────────────────────────

echo "🚀 Starting E2E test stack..."
docker compose ${COMPOSE_FILES} up -d --build

# ── Wait for health checks ──────────────────────────────────

echo "⏳ Waiting for gateway to be healthy..."
for i in $(seq 1 ${MAX_RETRIES}); do
    if curl -sf "${GATEWAY_URL}" > /dev/null 2>&1; then
        echo "✅ Gateway is healthy (attempt ${i}/${MAX_RETRIES})"
        break
    fi
    if [ "$i" -eq "${MAX_RETRIES}" ]; then
        echo "❌ Gateway did not become healthy after ${MAX_RETRIES} attempts"
        echo "📋 Docker logs:"
        docker compose ${COMPOSE_FILES} logs --tail=50 gateway
        exit 1
    fi
    if [ "$((i % 10))" -eq 0 ]; then
        echo "  ⏳ Still waiting... (attempt ${i}/${MAX_RETRIES})"
    fi
    sleep ${RETRY_INTERVAL}
done

echo "⏳ Waiting for WS gateway..."
for i in $(seq 1 30); do
    if curl -sf "${WS_GATEWAY_URL}" > /dev/null 2>&1; then
        echo "✅ WS Gateway is healthy"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "⚠️  WS Gateway not healthy – proceeding anyway"
    fi
    sleep 2
done

# ── Run migrations ───────────────────────────────────────────

echo "📦 Running Prisma migrations on E2E database..."
# Source .env.e2e to get the DATABASE_URL
export $(grep -v '^#' .env.e2e | grep DATABASE_URL | xargs)
pnpm prisma migrate deploy 2>/dev/null || {
    echo "⚠️  Migration failed – check DATABASE_URL in .env.e2e"
}

# ── Run E2E tests ────────────────────────────────────────────

echo ""
echo "🧪 Running E2E tests..."
echo "─────────────────────────────────────────────"

if [[ -n "${FILTER}" ]]; then
    echo "  Filter: ${FILTER}"
    npx jest --config tests/e2e/jest.e2e.config.ts --testPathPattern="${FILTER}" --passWithNoTests
else
    npx jest --config tests/e2e/jest.e2e.config.ts --passWithNoTests
fi

echo ""
echo "─────────────────────────────────────────────"
echo "✅ E2E tests complete!"
