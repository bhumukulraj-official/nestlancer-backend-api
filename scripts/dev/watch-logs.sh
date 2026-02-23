#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"

if [[ -n "${SERVICE}" ]]; then
  echo "📋 Following logs for ${SERVICE}..."
  docker compose logs -f "${SERVICE}"
else
  echo "📋 Following all Docker service logs..."
  docker compose logs -f
fi
