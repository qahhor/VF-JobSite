# Руководство по развертыванию Verifix Jobs

## Текущая инфраструктура

| Компонент | Значение |
|-----------|----------|
| Сервер | Hetzner, 8 vCPU, 16 GB RAM |
| IP | 5.75.238.254 |
| Домен | job.verifix.uz (CloudFlare DNS) |
| SSL | Let's Encrypt |
| ОС | CentOS / RHEL |
| Docker | 24.0+ |

## Docker контейнеры

| Контейнер | Образ | Порт | Сеть |
|-----------|-------|------|------|
| verifix-jobs-postgres | postgis/postgis:16-3.4 | 5432 | verifix-jobs_default |
| verifix-jobs-redis | redis:7 | 6379 | verifix-jobs_default |
| verifix-jobs-elasticsearch | elasticsearch:8.17 | 9200 | verifix-jobs_default |
| verifix-jobs-api | Custom (Spring Boot) | 7777→8080 | verifix-jobs_default |
| verifix-jobs-telegram | Custom (Spring Boot) | — | verifix-jobs_default |
| verifix-jobs-nginx | nginx:1.27 | 80, 443 | verifix-jobs_default |

## Процесс деплоя

### Frontend (только Angular)

```bash
# На сервере
cd /opt/verifix/VF-JobSite
git fetch && git reset --hard origin/main
cd verifix-jobs/verifix-jobs-web
npm install --legacy-peer-deps
npx ng build
docker restart verifix-jobs-nginx
```

### Backend (API)

```bash
cd /opt/verifix/VF-JobSite
git fetch && git reset --hard origin/main

# Сборка
docker build --no-cache -t verifix-jobs-api -f verifix-jobs-api/Dockerfile .

# Перезапуск
docker stop verifix-jobs-api && docker rm verifix-jobs-api
docker run -d --name verifix-jobs-api \
  --network verifix-jobs_default \
  --env-file .env \
  -e POSTGRES_HOST=verifix-jobs-postgres \
  -e REDIS_HOST=verifix-jobs-redis \
  -e SPRING_PROFILES_ACTIVE=prod \
  -p 7777:8080 \
  verifix-jobs-api
```

### Telegram Bot

```bash
docker build --no-cache -t verifix-jobs-telegram -f verifix-jobs-telegram/Dockerfile .

docker stop verifix-jobs-telegram && docker rm verifix-jobs-telegram
docker run -d --name verifix-jobs-telegram \
  --network verifix-jobs_default \
  --env-file .env \
  -e POSTGRES_HOST=verifix-jobs-postgres \
  -e REDIS_HOST=verifix-jobs-redis \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e ELASTICSEARCH_ENABLED=false \
  -e KAFKA_ENABLED=false \
  -e MINIO_ENABLED=false \
  verifix-jobs-telegram
```

## Nginx конфигурация

- Файл: `/opt/verifix/VF-JobSite/verifix-jobs/ops/nginx/nginx.conf` (монтируется read-only)
- Frontend: volume mount из `verifix-jobs-web/dist/verifix-jobs-web/browser` → `/usr/share/nginx/html`

**Важные ограничения Nginx 1.27:**
- `if` директивы ТОЛЬКО в server/location блоках (не в http)
- `listen 443 ssl http2` устарело — использовать `http2 on;` директиву

## Проверка после деплоя

```bash
# Статус контейнеров
docker ps --filter "name=verifix"

# API health
curl -k https://job.verifix.uz/api/v1/public/vacancies?size=1

# Health check
curl -k https://job.verifix.uz/actuator/health

# Логи
docker logs verifix-jobs-api --tail 50
docker logs verifix-jobs-telegram --tail 50
docker logs verifix-jobs-nginx --tail 20
```

## Системные требования (для нового сервера)

| Компонент | Минимум | Рекомендуемо |
|-----------|---------|--------------|
| CPU | 4 ядра | 8 ядер |
| RAM | 8 GB | 16 GB |
| Диск | 50 GB SSD | 100 GB SSD |
| ОС | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

## Первоначальная установка

### 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 curl git nodejs npm
sudo systemctl enable docker && sudo systemctl start docker
```

### 2. Клонирование и настройка

```bash
cd /opt
sudo mkdir -p verifix && sudo chown $USER:$USER verifix
cd verifix
git clone https://github.com/qahhor/VF-JobSite.git
cd VF-JobSite
cp .env.example .env
nano .env
```

**Обязательные переменные:**
```
POSTGRES_PASSWORD=<сильный пароль 20+ символов>
REDIS_PASSWORD=<сильный пароль>
JWT_SECRET=<64+ символов base64>
CORS_ORIGINS=https://job.verifix.uz
SPRING_PROFILES_ACTIVE=prod
TELEGRAM_BOT_TOKEN=<token от @BotFather>
TELEGRAM_BOT_USERNAME=VerifixJobBot
```

### 3. SSL-сертификаты

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d job.verifix.uz
mkdir -p ops/nginx/ssl
sudo cp /etc/letsencrypt/live/job.verifix.uz/fullchain.pem ops/nginx/ssl/
sudo cp /etc/letsencrypt/live/job.verifix.uz/privkey.pem ops/nginx/ssl/
```

### 4. Cron-задачи

```bash
crontab -e
# Добавить:
0 2 * * * /opt/verifix/VF-JobSite/verifix-jobs/ops/backup/backup-db.sh
0 3 * * * /opt/verifix/VF-JobSite/verifix-jobs/ops/backup/backup-redis.sh
0 0 1 * * certbot renew --quiet
```
