#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "🧪 Running integration tests..."
echo "  Requires Docker services (PostgreSQL, Redis, RabbitMQ)"

# Verify infrastructure
if ! docker compose ps --status running | grep -q postgres; then
  echo "⚠️  Starting infrastructure..."
  "${ROOT_DIR}/scripts/dev/start-services.sh"
  sleep 10
fi

# Run migrations on test DB
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestlancer_test"
pnpm prisma migrate deploy 2>/dev/null || true

pnpm turbo test:integration -- --passWithNoTests

echo "✅ Integration tests complete"
