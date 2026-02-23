#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

ENV="${1:-dev}"

echo "📊 Running database migrations (${ENV})..."

case "${ENV}" in
  dev|development)
    pnpm prisma migrate dev
    ;;
  deploy|staging|production)
    pnpm prisma migrate deploy
    ;;
  *)
    echo "Usage: $0 [dev|deploy|staging|production]"
    exit 1
    ;;
esac

echo "✅ Migrations complete"
