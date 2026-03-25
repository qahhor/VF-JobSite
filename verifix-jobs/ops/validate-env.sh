#!/bin/bash
# Validates .env file before deployment
# Usage: ./ops/validate-env.sh [.env-file]
set -euo pipefail

ENV_FILE="${1:-.env}"
ERRORS=0

check_required() {
    local var="$1"
    local desc="$2"
    if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        echo "❌ MISSING: ${var} — ${desc}"
        ERRORS=$((ERRORS + 1))
    elif [ -z "$(grep "^${var}=" "$ENV_FILE" | cut -d= -f2-)" ]; then
        echo "❌ EMPTY:   ${var} — ${desc}"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ OK:      ${var}"
    fi
}

check_not_default() {
    local var="$1"
    local bad_value="$2"
    local desc="$3"
    local actual=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
    if [ "$actual" = "$bad_value" ]; then
        echo "⚠️  DEFAULT: ${var} = '${bad_value}' — ${desc}"
        ERRORS=$((ERRORS + 1))
    fi
}

check_length() {
    local var="$1"
    local min_len="$2"
    local desc="$3"
    local actual=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
    if [ ${#actual} -lt "$min_len" ]; then
        echo "⚠️  WEAK:    ${var} — минимум ${min_len} символов (${desc})"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "=== Verifix Jobs .env Validation ==="
echo "File: ${ENV_FILE}"
echo ""

# Critical secrets
echo "--- Критические секреты ---"
check_required "POSTGRES_PASSWORD" "Пароль PostgreSQL"
check_required "REDIS_PASSWORD" "Пароль Redis"
check_required "JWT_SECRET" "JWT signing secret"
check_length "POSTGRES_PASSWORD" 12 "Пароль БД должен быть сложным"
check_length "JWT_SECRET" 32 "JWT secret минимум 32 символа"
check_not_default "POSTGRES_PASSWORD" "verifix_secret" "Используйте уникальный пароль"
check_not_default "MINIO_ACCESS_KEY" "minioadmin" "Измените MinIO credentials"
check_not_default "MINIO_SECRET_KEY" "minioadmin" "Измените MinIO credentials"

echo ""
echo "--- Обязательные сервисы ---"
check_required "POSTGRES_HOST" "Хост PostgreSQL"
check_required "POSTGRES_DB" "Имя базы данных"
check_required "REDIS_HOST" "Хост Redis"

echo ""
echo "--- Telegram Bot ---"
check_required "TELEGRAM_BOT_TOKEN" "Токен Telegram бота"

echo ""
echo "--- SMS Шлюзы ---"
check_required "ESKIZ_EMAIL" "Email для Eskiz.uz"
check_required "ESKIZ_PASSWORD" "Пароль Eskiz.uz"

echo ""
echo "--- Production profile ---"
PROFILE=$(grep "^SPRING_PROFILES_ACTIVE=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
if [ "$PROFILE" = "dev" ] || [ -z "$PROFILE" ]; then
    echo "⚠️  PROFILE: SPRING_PROFILES_ACTIVE=${PROFILE:-не задан} — для production используйте 'prod'"
fi

echo ""
echo "==================================="
if [ $ERRORS -gt 0 ]; then
    echo "❌ Найдено ${ERRORS} проблем. Исправьте перед деплоем."
    exit 1
else
    echo "✅ Все проверки пройдены."
    exit 0
fi
