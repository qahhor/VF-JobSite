#!/bin/bash
# Redis backup script
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/verifix/backups/redis}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Triggering Redis BGSAVE"
redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" BGSAVE

sleep 5

cp /var/lib/redis/dump.rdb "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb" 2>/dev/null || \
    docker cp verifix-jobs-redis:/data/dump.rdb "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"

echo "[$(date)] Redis backup completed: ${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"

# Cleanup
find "${BACKUP_DIR}" -name "*.rdb" -mtime +7 -delete
