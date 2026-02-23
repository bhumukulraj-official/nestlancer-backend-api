#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Cleaning Docker resources..."

# Stop and remove containers
docker compose down --remove-orphans 2>/dev/null || true

# Remove dangling images
docker image prune -f

# Remove project-specific images
REGISTRY="${REGISTRY:-ghcr.io/nestlancer}"
docker images --format "{{.Repository}}:{{.Tag}}" | grep "${REGISTRY}" | xargs -r docker rmi -f 2>/dev/null || true

# Remove unused volumes (careful!)
read -p "Remove unused volumes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker volume prune -f
fi

echo "✅ Docker cleanup complete"
