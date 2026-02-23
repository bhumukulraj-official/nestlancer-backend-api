#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"
NAMESPACE="${NAMESPACE:-nestlancer}"

if [[ -z "${SERVICE}" ]]; then
  echo "Usage: $0 <service-name|--all>"
  echo ""
  echo "Examples:"
  echo "  $0 gateway            # Rollback gateway"
  echo "  $0 --all              # Rollback all services"
  exit 1
fi

echo "🔄 Rolling back..."

if [[ "${SERVICE}" == "--all" ]]; then
  SERVICES=$(kubectl -n "${NAMESPACE}" get deployments -o jsonpath='{.items[*].metadata.name}')
  for svc in ${SERVICES}; do
    echo "  🔄 Rolling back ${svc}..."
    kubectl -n "${NAMESPACE}" rollout undo deployment/"${svc}"
  done
else
  echo "  🔄 Rolling back ${SERVICE}..."
  kubectl -n "${NAMESPACE}" rollout undo deployment/"${SERVICE}"
fi

echo "  ⏳ Waiting for rollback to complete..."
if [[ "${SERVICE}" == "--all" ]]; then
  for svc in ${SERVICES}; do
    kubectl -n "${NAMESPACE}" rollout status deployment/"${svc}" --timeout=120s
  done
else
  kubectl -n "${NAMESPACE}" rollout status deployment/"${SERVICE}" --timeout=120s
fi

echo "✅ Rollback complete"
