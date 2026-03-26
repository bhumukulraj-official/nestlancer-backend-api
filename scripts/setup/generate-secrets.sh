#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# Generate Development Secrets
# ─────────────────────────────────────────────────────

echo "🔑 Generating development secrets..."

generate_secret() {
  openssl rand -base64 "$1" 2>/dev/null || head -c "$1" /dev/urandom | base64 | tr -d '\n'
}

JWT_ACCESS_SECRET=$(generate_secret 48)
JWT_REFRESH_SECRET=$(generate_secret 48)
CSRF_SECRET=$(generate_secret 32)

echo ""
echo "Generated secrets (copy to .env):"
echo ""
echo "JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}"
echo "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}"
echo "CSRF_SECRET=${CSRF_SECRET}"
echo ""
echo "⚠️  These are for development only. Production secrets should be managed via secure environment variables (Vault, K8s Secrets, etc.)."
