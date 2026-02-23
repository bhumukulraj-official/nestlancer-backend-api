#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "⚙️ Generating types..."

# Generate Prisma client types
echo "  📊 Generating Prisma client..."
pnpm prisma generate

# Generate OpenAPI types (if configured)
if command -v openapi-generator-cli >/dev/null 2>&1; then
  echo "  📝 Generating OpenAPI types..."
  openapi-generator-cli generate \
    -i docs/api/openapi.yaml \
    -g typescript-axios \
    -o libs/api-client/src/generated \
    --additional-properties=supportsES6=true,npmName=@nestlancer/api-client
fi

echo "✅ Types generated"
