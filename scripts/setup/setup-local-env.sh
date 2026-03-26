#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# Setup Local Environment Configuration
# ─────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🔧 Setting up local environment..."

echo "🔧 Setting up local environment..."

# Create .env if not exists (for Docker Compose)
if [[ ! -f "${ROOT_DIR}/.env" ]]; then
  cat > "${ROOT_DIR}/.env" << 'EOF'
# ── Local Development Environment ──
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestlancer_dev

# Redis
REDIS_CACHE_URL=redis://localhost:6379/0
REDIS_PUBSUB_URL=redis://localhost:6380/0

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_ACCESS_SECRET=dev-access-secret-change-me-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-me-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:4200
EOF
  echo "  ✅ Created .env with development defaults"
else
  echo "  ℹ️ .env already exists"
fi

echo "✅ Local environment setup complete"
