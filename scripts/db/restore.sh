#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:-}"
if [[ -z "${BACKUP_FILE}" ]]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -la "${BACKUP_DIR:-./backups}"/*.sql.gz 2>/dev/null || echo "  No backups found"
  exit 1
fi

DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/nestlancer_dev}"

DB_HOST=$(echo "${DATABASE_URL}" | sed -E 's/.*@([^:]+):.*/\1/')
DB_PORT=$(echo "${DATABASE_URL}" | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo "${DATABASE_URL}" | sed -E 's/.*\///')
DB_USER=$(echo "${DATABASE_URL}" | sed -E 's/.*\/\/([^:]+):.*/\1/')

echo "⚠️  This will overwrite the database ${DB_NAME} with backup ${BACKUP_FILE}"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📥 Restoring ${DB_NAME} from ${BACKUP_FILE}..."
  gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
  echo "✅ Restore complete"
else
  echo "Aborted."
fi
