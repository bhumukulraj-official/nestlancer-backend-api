#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

FULL="${1:-}"

echo "🐳 Starting infrastructure services..."

if [[ "${FULL}" == "--full" ]]; then
  echo "  Starting full stack (PostgreSQL, Redis, RabbitMQ, Mailpit, MinIO, Jaeger)..."
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
else
  echo "  Starting core stack (PostgreSQL, Redis, RabbitMQ, Mailpit)..."
  docker compose up -d
fi

echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health
SERVICES=("postgres:5432" "redis-cache:6379" "redis-pubsub:6380" "rabbitmq:5672")
for svc in "${SERVICES[@]}"; do
  HOST=$(echo "${svc}" | cut -d: -f1)
  PORT=$(echo "${svc}" | cut -d: -f2)
  if docker compose exec -T "${HOST}" sh -c "exit 0" 2>/dev/null; then
    echo "  ✅ ${HOST} is ready"
  else
    echo "  ⚠️  ${HOST} may still be starting..."
  fi
done

echo ""
echo "✅ Infrastructure services started"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis Cache: localhost:6379"
echo "  Redis PubSub: localhost:6380"
echo "  RabbitMQ:    localhost:5672 (management: localhost:15672)"
echo "  Mailpit:     localhost:8025"
