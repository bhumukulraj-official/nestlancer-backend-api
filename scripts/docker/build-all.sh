#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

REGISTRY="${REGISTRY:-ghcr.io/nestlancer}"
TAG="${TAG:-latest}"

echo "🐳 Building all Docker images..."

COMPONENTS=(
  "gateway"
  "ws-gateway"
  "auth" "users" "requests" "quotes" "projects" "progress"
  "payments" "messaging" "notifications" "media"
  "portfolio" "blog" "contact" "admin" "webhooks" "health"
)

WORKERS=(
  "email-worker" "notification-worker" "audit-worker" "media-worker"
  "analytics-worker" "webhook-worker" "cdn-worker" "outbox-poller"
)

# COMPONENTS and WORKERS arrays are defined above

# Build gateway images
for component in "${COMPONENTS[@]}"; do
  echo "  📦 Building ${component}..."
  if [[ -f "docker/${component}/Dockerfile" ]]; then
    docker build -f "docker/${component}/Dockerfile" -t "${REGISTRY}/nestlancer-${component}:${TAG}" .
  else
    docker build -f docker/service-base/Dockerfile.base \
      --build-arg SERVICE_NAME="${component}" \
      -t "${REGISTRY}/nestlancer-${component}:${TAG}" .
  fi
done

# Build worker images
for worker in "${WORKERS[@]}"; do
  echo "  📦 Building ${worker}..."
  docker build -f docker/worker-base/Dockerfile.base \
    --build-arg SERVICE_NAME="${worker}" \
    -t "${REGISTRY}/nestlancer-${worker}:${TAG}" .
done

echo ""
echo "✅ All images built successfully"
docker images | grep "${REGISTRY}" | sort
