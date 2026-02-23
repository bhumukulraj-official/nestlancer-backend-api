#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "🚀 Starting all services..."

# Start infrastructure
"${ROOT_DIR}/scripts/dev/start-services.sh"

# Wait for infrastructure
sleep 5

# Run migrations
echo "📊 Running migrations..."
pnpm prisma migrate deploy 2>/dev/null || pnpm prisma migrate dev

# Start all NestJS services and workers
echo "⚙️ Starting all NestJS services..."
pnpm turbo dev
