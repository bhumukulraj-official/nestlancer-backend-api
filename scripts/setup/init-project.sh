#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# Nestlancer Project Initialization
# ─────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "🚀 Initializing Nestlancer project..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Run: corepack enable && corepack prepare pnpm@latest --activate"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "${NODE_VERSION}" -lt 20 ]]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Prerequisites verified"

# Install dependencies
echo "📦 Installing dependencies..."
cd "${ROOT_DIR}"
pnpm install

# Setup environment
echo "🔧 Setting up environment..."
"${SCRIPT_DIR}/setup-local-env.sh"

# Generate secrets
echo "🔑 Generating secrets..."
"${SCRIPT_DIR}/generate-secrets.sh"

# Start infrastructure
echo "🐳 Starting Docker infrastructure..."
docker compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
"${SCRIPT_DIR}/../db/migrate.sh"

# Seed database
echo "🌱 Seeding database..."
"${SCRIPT_DIR}/../db/seed.sh"

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
pnpm prisma generate

echo ""
echo "✅ Project initialized successfully!"
echo ""
echo "Available commands:"
echo "  make dev        – Start all services"
echo "  make test       – Run tests"
echo "  make lint       – Run linter"
echo "  make build      – Build all packages"
echo ""
echo "Service URLs:"
echo "  API Gateway:    http://localhost:3000"
echo "  Swagger UI:     http://localhost:3000/api/docs"
echo "  WebSocket:      ws://localhost:3001"
echo "  RabbitMQ:       http://localhost:15672"
echo "  Mailpit:        http://localhost:8025"
