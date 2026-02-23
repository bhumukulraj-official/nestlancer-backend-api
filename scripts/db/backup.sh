#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "${BACKUP_DIR}"

DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/nestlancer_dev}"

# Parse connection string
DB_HOST=$(echo "${DATABASE_URL}" | sed -E 's/.*@([^:]+):.*/\1/')
DB_PORT=$(echo "${DATABASE_URL}" | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo "${DATABASE_URL}" | sed -E 's/.*\///')
DB_USER=$(echo "${DATABASE_URL}" | sed -E 's/.*\/\/([^:]+):.*/\1/')

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "💾 Backing up ${DB_NAME} to ${BACKUP_FILE}..."

pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  --no-owner --no-acl --format=plain | gzip > "${BACKUP_FILE}"

echo "✅ Backup complete: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
