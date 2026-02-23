#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# Install Project Dependencies
# ─────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "📦 Installing pnpm dependencies..."
cd "${ROOT_DIR}"
pnpm install --frozen-lockfile

echo "⚙️ Generating Prisma client..."
pnpm prisma generate

echo "✅ Dependencies installed"
