#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${REGISTRY:-ghcr.io/nestlancer}"
TAG="${TAG:-latest}"

echo "�� Pushing all Docker images to ${REGISTRY}..."

IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${REGISTRY}" | grep "${TAG}")

for image in ${IMAGES}; do
  echo "  📤 Pushing ${image}..."
  docker push "${image}"
done

echo "✅ All images pushed"
