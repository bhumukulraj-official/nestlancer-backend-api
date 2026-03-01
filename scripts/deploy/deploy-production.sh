#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

VERSION="${1:-}"
if [[ -z "${VERSION}" ]]; then
  echo "Usage: $0 <version-tag>"
  echo "Example: $0 v1.2.0"
  exit 1
fi

echo "🚀 Deploying ${VERSION} to production..."
echo "⚠️  This is a PRODUCTION deployment!"
read -p "Are you sure? (yes/no) " CONFIRM
[[ "${CONFIRM}" == "yes" ]] || exit 1

# Verify kubectl context
CONTEXT=$(kubectl config current-context)
if [[ "${CONTEXT}" != *"production"* ]]; then
  echo "❌ Current kubectl context (${CONTEXT}) does not match production."
  exit 1
fi

# Apply manifests
echo "  📋 Applying VPS manifests..."
kubectl apply -k deploy/kubernetes/overlays/vps

# Monitor rollout
echo "  ⏳ Monitoring rollout..."
SERVICES="gateway ws-gateway auth users requests quotes projects progress payments messaging notifications media portfolio blog contact admin webhooks health"
for svc in ${SERVICES}; do
  echo "    ⏳ ${svc}..."
  kubectl -n nestlancer rollout status deployment/${svc} --timeout=300s || {
    echo "  ❌ ${svc} rollout failed"
    echo "  🔄 Rolling back..."
    kubectl -n nestlancer rollout undo deployment/${svc}
    exit 1
  }
done

echo "  ✅ Production deployment complete: ${VERSION}"
