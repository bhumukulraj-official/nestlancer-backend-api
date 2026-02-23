#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "🚀 Deploying to staging..."

# Verify kubectl context
CONTEXT=$(kubectl config current-context)
echo "  Kubernetes context: ${CONTEXT}"
if [[ "${CONTEXT}" != *"staging"* ]]; then
  echo "⚠️  Warning: Current context doesn't contain 'staging'. Proceed? (y/N)"
  read -p "" -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]] || exit 1
fi

# Apply manifests
echo "  📋 Applying staging manifests..."
kubectl apply -k deploy/kubernetes/overlays/staging

# Wait for rollout
echo "  ⏳ Waiting for deployment rollout..."
kubectl -n nestlancer-staging rollout status deployment/gateway --timeout=300s

echo "  ✅ Staging deployment complete"

# Health check
echo "  🏥 Running health check..."
STAGING_URL="${STAGING_URL:-https://staging-api.nestlancer.com}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${STAGING_URL}/api/v1/health" || echo "000")

if [[ "${HTTP_STATUS}" == "200" ]]; then
  echo "  ✅ Health check passed"
else
  echo "  ❌ Health check failed (HTTP ${HTTP_STATUS})"
  exit 1
fi
