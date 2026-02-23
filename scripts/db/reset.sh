#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "⚠️  This will reset the database. All data will be lost!"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🗑️  Resetting database..."
  pnpm prisma migrate reset --force
  echo "✅ Database reset complete"
else
  echo "Aborted."
fi
