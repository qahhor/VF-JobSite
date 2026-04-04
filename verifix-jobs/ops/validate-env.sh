#!/bin/bash
set -euo pipefail

ENV_FILE="${1:-.env}"
ERRORS=0
WARNINGS=0

# ── Helpers ─────────────────────────────────────────────────────────────────

get_val() {
    grep "^${1}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true
}

is_enabled() {
    local val
    val="$(get_val "$1")"
    [[ "$val" == "true" ]]
}

check_required() {
    local var="$1" desc="$2"
    local val
    val="$(get_val "$var")"
    if [ -z "$val" ]; then
        echo "  ERROR  ${var} — ${desc}"
        ERRORS=$((ERRORS + 1))
    else
        echo "  OK     ${var}"
    fi
}

check_length() {
    local var="$1" min_len="$2" desc="$3"
    local val
    val="$(get_val "$var")"
    if [ ${#val} -lt "$min_len" ]; then
        echo "  ERROR  ${var} — min ${min_len} chars (${desc})"
        ERRORS=$((ERRORS + 1))
    fi
}

check_not_default() {
    local var="$1" bad="$2" desc="$3"
    local val
    val="$(get_val "$var")"
    if [ "$val" = "$bad" ]; then
        echo "  ERROR  ${var} — ${desc}"
        ERRORS=$((ERRORS + 1))
    fi
}

warn_if_empty() {
    local var="$1" desc="$2"
    local val
    val="$(get_val "$var")"
    if [ -z "$val" ]; then
        echo "  WARN   ${var} — ${desc}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# ── Main ────────────────────────────────────────────────────────────────────

echo "============================================================"
echo " Verifix Jobs — Environment Validation"
echo " File: ${ENV_FILE}"
echo "============================================================"
echo

# ── 1. Runtime profile ──────────────────────────────────────────────────────
echo "[Runtime]"
PROFILE="$(get_val SPRING_PROFILES_ACTIVE)"
if [ "$PROFILE" != "prod" ]; then
    echo "  ERROR  SPRING_PROFILES_ACTIVE must be 'prod'"
    ERRORS=$((ERRORS + 1))
else
    echo "  OK     SPRING_PROFILES_ACTIVE=prod"
fi

# ── 2. Core secrets (always required) ───────────────────────────────────────
echo
echo "[Core Secrets]"
check_required  "POSTGRES_PASSWORD"  "PostgreSQL password"
check_required  "REDIS_PASSWORD"     "Redis password"
check_required  "JWT_SECRET"         "JWT signing secret"
check_length    "POSTGRES_PASSWORD"  12 "database password"
check_length    "REDIS_PASSWORD"     12 "Redis password"
check_length    "JWT_SECRET"         32 "JWT secret"
check_not_default "POSTGRES_PASSWORD" "verifix_secret" "replace default DB password"

# ── 3. Core services ───────────────────────────────────────────────────────
echo
echo "[Core Services]"
check_required  "POSTGRES_HOST"    "PostgreSQL host"
check_required  "POSTGRES_DB"      "PostgreSQL database"
check_required  "REDIS_HOST"       "Redis host"
check_required  "APP_BASE_URL"     "public application URL"
check_required  "CORS_ORIGINS"     "allowed frontend origins"

# ── 4. URL & TLS checks ────────────────────────────────────────────────────
echo
echo "[URL & TLS]"
APP_URL="$(get_val APP_BASE_URL)"
CORS="$(get_val CORS_ORIGINS)"
if [[ "$APP_URL" != https://* ]]; then
    echo "  ERROR  APP_BASE_URL must use https://"
    ERRORS=$((ERRORS + 1))
else
    echo "  OK     APP_BASE_URL uses https"
fi
if [[ "$CORS" == *localhost* ]]; then
    echo "  ERROR  CORS_ORIGINS contains localhost"
    ERRORS=$((ERRORS + 1))
else
    echo "  OK     CORS_ORIGINS production-safe"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/nginx/ssl"
for cert in fullchain.pem privkey.pem; do
    if [ ! -f "${SSL_DIR}/${cert}" ]; then
        echo "  ERROR  missing TLS: ${SSL_DIR}/${cert}"
        ERRORS=$((ERRORS + 1))
    else
        echo "  OK     ${cert}"
    fi
done

# ── 5. Telegram (always required — core feature) ───────────────────────────
echo
echo "[Telegram Bot]"
check_required "TELEGRAM_BOT_TOKEN" "Telegram bot token"

# ── 6. Module-aware validation ──────────────────────────────────────────────
# Only validate secrets for modules that are ENABLED.

echo
echo "[Module: Elasticsearch] $(is_enabled ELASTICSEARCH_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled ELASTICSEARCH_ENABLED; then
    check_required "ELASTICSEARCH_HOST" "Elasticsearch host"
fi

echo
echo "[Module: Kafka] $(is_enabled KAFKA_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled KAFKA_ENABLED; then
    check_required "KAFKA_BOOTSTRAP_SERVERS" "Kafka brokers"
fi

echo
echo "[Module: MinIO] $(is_enabled MINIO_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled MINIO_ENABLED; then
    check_required   "MINIO_ACCESS_KEY"  "MinIO access key"
    check_required   "MINIO_SECRET_KEY"  "MinIO secret key"
    check_length     "MINIO_SECRET_KEY"  12 "MinIO secret"
    check_not_default "MINIO_ACCESS_KEY" "minioadmin" "replace default MinIO key"
    check_not_default "MINIO_SECRET_KEY" "minioadmin" "replace default MinIO secret"
fi

echo
echo "[Module: ML Service] $(is_enabled ML_SERVICE_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled ML_SERVICE_ENABLED; then
    check_required "ML_SERVICE_URL" "ML service URL"
fi

echo
echo "[Module: Gov Sync] $(is_enabled GOV_SYNC_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled GOV_SYNC_ENABLED; then
    check_required "ARGOS_API_KEY" "ARGOS API key"
    check_required "ENST_API_KEY"  "ENST API key"
    check_required "MEHNAT_API_KEY" "Mehnat API key"
fi

echo
echo "[Module: HRM Sync] $(is_enabled HRM_SYNC_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled HRM_SYNC_ENABLED; then
    check_required "VERIFIX_HRM_API_KEY" "HRM API key"
fi

echo
echo "[Module: HRM SSO] $(is_enabled HRM_SSO_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled HRM_SSO_ENABLED; then
    check_required "HRM_SSO_CLIENT_ID"     "HRM SSO client ID"
    check_required "HRM_SSO_CLIENT_SECRET"  "HRM SSO client secret"
fi

echo
echo "[Module: AI Chatbot] $(is_enabled AI_CHATBOT_ENABLED && echo 'ENABLED' || echo 'disabled')"
echo "[Module: AI Screening] $(is_enabled AI_SCREENING_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled AI_CHATBOT_ENABLED || is_enabled AI_SCREENING_ENABLED; then
    check_required "CLAUDE_API_KEY" "Claude API key"
fi

echo
echo "[Module: ATS Telegram] $(is_enabled ATS_TELEGRAM_ENABLED && echo 'ENABLED' || echo 'disabled')"
if is_enabled ATS_TELEGRAM_ENABLED; then
    check_required "ATS_TELEGRAM_WEBHOOK_URL" "ATS webhook URL"
    check_required "ATS_TELEGRAM_HMAC_SECRET" "ATS HMAC secret"
fi

# ── 7. Optional integrations (warn only) ───────────────────────────────────
echo
echo "[Optional — SMS]"
warn_if_empty "ESKIZ_EMAIL"    "SMS sending will not work"
warn_if_empty "ESKIZ_PASSWORD" "SMS sending will not work"

echo
echo "[Optional — Grafana]"
warn_if_empty "GRAFANA_ADMIN_PASSWORD" "Grafana will use insecure defaults"

# ── Summary ─────────────────────────────────────────────────────────────────
echo
echo "============================================================"
if [ $ERRORS -gt 0 ]; then
    echo " FAILED: ${ERRORS} error(s), ${WARNINGS} warning(s)"
    exit 1
fi
if [ $WARNINGS -gt 0 ]; then
    echo " PASSED with ${WARNINGS} warning(s)"
else
    echo " PASSED — all checks OK"
fi
echo "============================================================"
