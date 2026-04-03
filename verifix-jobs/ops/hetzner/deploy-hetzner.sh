#!/bin/bash
# ================================================================
# VERIFIX JOBS — Полный деплой на Hetzner Cloud
# ================================================================
# Запуск: bash ops/hetzner/deploy-hetzner.sh
#
# Требования:
#   - Hetzner Cloud аккаунт
#   - SSH ключ добавлен в Hetzner
#   - Домен настроен (DNS A-запись → IP сервера)
#
# Что делает этот скрипт:
#   1. Подключается к серверу по SSH
#   2. Устанавливает Docker, Docker Compose
#   3. Клонирует проект
#   4. Настраивает .env
#   5. Запускает все сервисы
#   6. Настраивает SSL (Let's Encrypt)
#   7. Запускает Nginx reverse proxy
# ================================================================

set -euo pipefail

# ─── НАСТРОЙКИ (измените под себя) ───
SERVER_IP="${HETZNER_IP:-YOUR_SERVER_IP}"
SERVER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY_PATH:-~/.ssh/id_rsa}"
DOMAIN="${DOMAIN:-jobs.verifix.uz}"
GIT_REPO="${GIT_REPO:-git@github.com:qahhor/VF-JobSite.git}"
PROJECT_DIR="/opt/verifix"

# ─── ЦВЕТА ───
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── ПРОВЕРКИ ───
if [ "$SERVER_IP" = "YOUR_SERVER_IP" ]; then
    echo "================================================================"
    echo "  VERIFIX JOBS — Деплой на Hetzner"
    echo "================================================================"
    echo ""
    echo "Использование:"
echo "  HETZNER_IP=65.108.x.x DOMAIN=jobs.verifix.uz bash ops/hetzner/deploy-hetzner.sh"
    echo ""
    echo "Или отредактируйте переменные в начале скрипта."
    echo ""
    echo "Рекомендуемый сервер Hetzner:"
    echo "  - CPX31: 4 vCPU, 8GB RAM, 160GB SSD — €12.49/мес"
    echo "  - Локация: Helsinki (hel1) или Falkenstein (fsn1)"
    echo "  - ОС: Ubuntu 24.04"
    echo "================================================================"
    exit 1
fi

log "Деплой Verifix Jobs на $SERVER_IP ($DOMAIN)"

# ─── ФУНКЦИЯ: выполнить команду на сервере ───
ssh_run() {
    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "$1"
}

ssh_copy() {
    scp -o StrictHostKeyChecking=no -i "$SSH_KEY" "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# ================================================================
# ШАГ 1: Подготовка сервера
# ================================================================
log "Шаг 1: Обновление системы и установка Docker"

ssh_run "
    apt update && apt upgrade -y
    apt install -y curl git ufw certbot

    # Docker
    if ! command -v docker &>/dev/null; then
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker && systemctl start docker
    fi

    # Docker Compose (v2 plugin)
    if ! docker compose version &>/dev/null; then
        apt install -y docker-compose-plugin
    fi

    docker --version
    docker compose version
"

# ================================================================
# ШАГ 2: Настройка Firewall
# ================================================================
log "Шаг 2: Настройка UFW Firewall"

ssh_run "
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
    ufw status
"

# ================================================================
# ШАГ 3: Клонирование проекта
# ================================================================
log "Шаг 3: Клонирование проекта"

ssh_run "
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR

    if [ -d verifix-jobs ]; then
        cd verifix-jobs && git pull origin main
    else
        git clone $GIT_REPO . 2>/dev/null || echo 'Repo already exists'
        cd verifix-jobs
    fi

    ls -la
"

# ================================================================
# ШАГ 4: Создание .env
# ================================================================
log "Шаг 4: Генерация .env"

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '\n/+=')
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '\n/+=')
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d '\n/+=')

ssh_run "
cat > $PROJECT_DIR/verifix-jobs/.env << 'ENVEOF'
# ============================================================
# VERIFIX JOBS — Production Environment ($DOMAIN)
# Generated: $(date)
# ============================================================

SPRING_PROFILES_ACTIVE=prod
APP_NAME=verifix-jobs
APP_BASE_URL=https://$DOMAIN
APP_PORT=8080

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=verifix_jobs
POSTGRES_USER=verifix
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT
JWT_SECRET=$JWT_SECRET

# Feature Toggles (включайте по мере необходимости)
KAFKA_ENABLED=false
ELASTICSEARCH_ENABLED=false
MINIO_ENABLED=false
ML_SERVICE_ENABLED=false
GOV_SYNC_ENABLED=false
HRM_SYNC_ENABLED=false
HRM_SSO_ENABLED=false
ATS_TELEGRAM_ENABLED=false
AI_CHATBOT_ENABLED=false
AI_SCREENING_ENABLED=false

# Telegram Bot (заполните)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=verifixjobs_bot

# SMS (заполните)
ESKIZ_EMAIL=
ESKIZ_PASSWORD=

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD

# CORS
CORS_ORIGINS=https://$DOMAIN

# Moderation
MODERATION_MINIMUM_WAGE_UZS=1155000
RATE_LIMIT_GENERAL_REQUESTS_PER_MINUTE=100
RATE_LIMIT_EMPLOYER_REQUESTS_PER_MINUTE=30
ENVEOF

echo '.env created successfully'
"

# ================================================================
# ШАГ 5: SSL сертификат
# ================================================================
log "Шаг 5: SSL сертификат (Let's Encrypt)"

ssh_run "
    certbot certonly --standalone --non-interactive --agree-tos \
        -m admin@$DOMAIN -d $DOMAIN 2>/dev/null || echo 'SSL: using existing cert or standalone failed'

    mkdir -p $PROJECT_DIR/verifix-jobs/ops/nginx/ssl
    if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $PROJECT_DIR/verifix-jobs/ops/nginx/ssl/
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $PROJECT_DIR/verifix-jobs/ops/nginx/ssl/
        echo 'SSL certificates copied'
    else
        echo 'SSL: generating self-signed for now'
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $PROJECT_DIR/verifix-jobs/ops/nginx/ssl/privkey.pem \
            -out $PROJECT_DIR/verifix-jobs/ops/nginx/ssl/fullchain.pem \
            -subj '/CN=$DOMAIN' 2>/dev/null
    fi
"

# ================================================================
# ШАГ 6: Запуск Docker Compose
# ================================================================
log "Шаг 6: Запуск сервисов"

ssh_run "
    cd $PROJECT_DIR/verifix-jobs

    # Собираем и запускаем
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

    # Ждём 30 секунд
    sleep 30

    # Статус
    docker compose ps
    echo ''
    echo '=== Health Checks ==='
    docker exec verifix-jobs-postgres pg_isready -U verifix 2>/dev/null && echo 'PostgreSQL: OK' || echo 'PostgreSQL: STARTING'
    docker exec verifix-jobs-redis redis-cli -a \$REDIS_PASSWORD ping 2>/dev/null && echo 'Redis: OK' || echo 'Redis: STARTING'
"

# ================================================================
# ШАГ 7: Настройка автообновления SSL
# ================================================================
log "Шаг 7: Cron для SSL и бэкапов"

ssh_run "
    # SSL auto-renew
    (crontab -l 2>/dev/null; echo '0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $PROJECT_DIR/verifix-jobs/ops/nginx/ssl/ && docker restart verifix-jobs-nginx') | crontab -

    # Daily DB backup
    (crontab -l 2>/dev/null; echo '0 2 * * * bash $PROJECT_DIR/verifix-jobs/ops/backup/backup-db.sh') | crontab -

    crontab -l
"

# ================================================================
# ГОТОВО
# ================================================================
echo ""
echo "================================================================"
echo -e "${GREEN}  ✅ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!${NC}"
echo "================================================================"
echo ""
echo "  Сервер:    $SERVER_IP"
echo "  Домен:     https://$DOMAIN"
echo "  API:       https://$DOMAIN/api/v1/public/vacancies"
echo "  Swagger:   https://$DOMAIN/swagger-ui.html (закрыт в prod)"
echo "  Grafana:   http://$SERVER_IP:3000 (admin / $GRAFANA_PASSWORD)"
echo ""
echo "  SSH:       ssh $SERVER_USER@$SERVER_IP"
echo "  Логи:      ssh $SERVER_USER@$SERVER_IP 'docker compose -f $PROJECT_DIR/verifix-jobs/docker-compose.yml logs -f'"
echo "  Статус:    ssh $SERVER_USER@$SERVER_IP 'docker compose -f $PROJECT_DIR/verifix-jobs/docker-compose.yml ps'"
echo ""
echo "  Следующие шаги:"
echo "  1. Настройте DNS: A-запись $DOMAIN → $SERVER_IP"
echo "  2. Заполните Telegram Bot Token в .env"
echo "  3. Заполните SMS credentials (Eskiz.uz) в .env"
echo "  4. Перезапустите: docker compose restart"
echo "================================================================"
