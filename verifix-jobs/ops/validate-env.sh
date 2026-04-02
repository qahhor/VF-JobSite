#!/bin/bash
set -euo pipefail

ENV_FILE="${1:-.env}"
ERRORS=0

check_required() {
    local var="$1"
    local desc="$2"
    if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        echo "ERROR missing ${var}: ${desc}"
        ERRORS=$((ERRORS + 1))
    elif [ -z "$(grep "^${var}=" "$ENV_FILE" | cut -d= -f2-)" ]; then
        echo "ERROR empty ${var}: ${desc}"
        ERRORS=$((ERRORS + 1))
    else
        echo "OK ${var}"
    fi
}

check_not_default() {
    local var="$1"
    local bad_value="$2"
    local desc="$3"
    local actual
    actual=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
    if [ "$actual" = "$bad_value" ]; then
        echo "ERROR default ${var}: ${desc}"
        ERRORS=$((ERRORS + 1))
    fi
}

check_length() {
    local var="$1"
    local min_len="$2"
    local desc="$3"
    local actual
    actual=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
    if [ ${#actual} -lt "$min_len" ]; then
        echo "ERROR weak ${var}: minimum ${min_len} chars required (${desc})"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "=== Verifix Jobs environment validation ==="
echo "File: ${ENV_FILE}"
echo

echo "--- Core secrets ---"
check_required "POSTGRES_PASSWORD" "PostgreSQL password"
check_required "REDIS_PASSWORD" "Redis password"
check_required "JWT_SECRET" "JWT signing secret"
check_required "MINIO_ACCESS_KEY" "MinIO access key"
check_required "MINIO_SECRET_KEY" "MinIO secret key"
check_required "GRAFANA_ADMIN_PASSWORD" "Grafana admin password"
check_required "ELASTIC_PASSWORD" "Elasticsearch built-in user password"
check_length "POSTGRES_PASSWORD" 12 "database password"
check_length "JWT_SECRET" 32 "JWT secret"
check_length "REDIS_PASSWORD" 12 "Redis password"
check_length "MINIO_SECRET_KEY" 12 "MinIO secret"
check_length "GRAFANA_ADMIN_PASSWORD" 12 "Grafana admin password"
check_length "ELASTIC_PASSWORD" 12 "Elasticsearch password"
check_not_default "POSTGRES_PASSWORD" "verifix_secret" "replace default database password"
check_not_default "MINIO_ACCESS_KEY" "minioadmin" "replace default MinIO access key"
check_not_default "MINIO_SECRET_KEY" "minioadmin" "replace default MinIO secret key"
check_not_default "GRAFANA_ADMIN_PASSWORD" "changeme" "replace default Grafana admin password"
check_not_default "ELASTIC_PASSWORD" "changeme" "replace default Elasticsearch password"

echo
echo "--- Core services ---"
check_required "POSTGRES_HOST" "PostgreSQL host"
check_required "POSTGRES_DB" "PostgreSQL database"
check_required "REDIS_HOST" "Redis host"
check_required "CORS_ORIGINS" "allowed frontend origins"
check_required "APP_BASE_URL" "public application URL"

echo
echo "--- Telegram ---"
check_required "TELEGRAM_BOT_TOKEN" "Telegram bot token"

echo
echo "--- SMS ---"
check_required "ESKIZ_EMAIL" "Eskiz account email"
check_required "ESKIZ_PASSWORD" "Eskiz account password"

echo
echo "--- Runtime profile ---"
PROFILE=$(grep "^SPRING_PROFILES_ACTIVE=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
if [ "$PROFILE" != "prod" ]; then
    echo "ERROR SPRING_PROFILES_ACTIVE must be prod for production deployment"
    ERRORS=$((ERRORS + 1))
else
    echo "OK SPRING_PROFILES_ACTIVE=prod"
fi

echo
echo "--- URL and TLS checks ---"
APP_BASE_URL=$(grep "^APP_BASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
CORS_ORIGINS=$(grep "^CORS_ORIGINS=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
if [[ "$APP_BASE_URL" != https://* ]]; then
    echo "ERROR APP_BASE_URL must start with https:// in production"
    ERRORS=$((ERRORS + 1))
else
    echo "OK APP_BASE_URL uses https"
fi

if [[ "$CORS_ORIGINS" == *localhost* ]]; then
    echo "ERROR CORS_ORIGINS contains localhost, which is not valid for production"
    ERRORS=$((ERRORS + 1))
else
    echo "OK CORS_ORIGINS looks production-safe"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/nginx/ssl"
for cert in fullchain.pem privkey.pem; do
    if [ ! -f "${SSL_DIR}/${cert}" ]; then
        echo "ERROR missing TLS file: ${SSL_DIR}/${cert}"
        ERRORS=$((ERRORS + 1))
    else
        echo "OK ${SSL_DIR}/${cert}"
    fi
done

echo
if [ $ERRORS -gt 0 ]; then
    echo "Validation failed with ${ERRORS} issue(s)."
    exit 1
fi

echo "Environment validation passed."
