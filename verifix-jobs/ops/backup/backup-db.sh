#!/bin/bash
# PostgreSQL backup script for Verifix Jobs
# Run daily via cron: 0 2 * * * /opt/verifix/ops/backup/backup-db.sh

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/verifix/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-verifix_jobs}"
DB_USER="${POSTGRES_USER:-verifix}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup: ${DB_NAME}"

# Backup with compression
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="${BACKUP_FILE}" 2>&1

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] Backup completed: ${BACKUP_FILE} (${SIZE})"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Verify backup integrity
pg_restore --list "${BACKUP_FILE}" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup integrity verified"
else
    echo "[$(date)] WARNING: Backup integrity check failed!"
fi

echo "[$(date)] Backup process completed"
