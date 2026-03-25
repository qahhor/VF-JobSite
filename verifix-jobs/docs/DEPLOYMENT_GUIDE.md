# Руководство по развертыванию Verifix Jobs

## Системные требования

| Компонент | Минимум | Рекомендуемо |
|-----------|---------|--------------|
| CPU | 4 ядра | 8 ядер |
| RAM | 8 GB | 16 GB |
| Диск | 50 GB SSD | 100 GB SSD |
| ОС | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker | 24.0+ | Latest |
| Docker Compose | v2.20+ | Latest |

## Необходимые порты

| Порт | Сервис | Доступ |
|------|--------|--------|
| 80 | Nginx HTTP → HTTPS redirect | Внешний |
| 443 | Nginx HTTPS | Внешний |
| 8080 | API (через Nginx) | Внутренний |
| 8081 | Telegram Bot (через Nginx) | Внутренний |
| 5432 | PostgreSQL | Внутренний |
| 6379 | Redis | Внутренний |
| 9092 | Kafka | Внутренний |
| 9200 | Elasticsearch | Внутренний |
| 9090 | Prometheus | Внутренний |
| 3000 | Grafana | Внутренний (VPN) |

## Пошаговое развертывание

### 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 curl git
sudo systemctl enable docker && sudo systemctl start docker
sudo usermod -aG docker $USER
```

### 2. Клонирование проекта

```bash
cd /opt
sudo mkdir -p verifix && sudo chown $USER:$USER verifix
cd verifix
git clone <repo-url> verifix-jobs
cd verifix-jobs
```

### 3. Настройка переменных окружения

```bash
cp .env.example .env
nano .env
```

**Обязательные переменные:**
```
POSTGRES_PASSWORD=<сильный пароль 20+ символов>
REDIS_PASSWORD=<сильный пароль>
JWT_SECRET=<64+ символов base64>
CORS_ORIGINS=https://jobs.verifix.uz
SPRING_PROFILES_ACTIVE=prod
```

### 4. SSL-сертификаты

```bash
# Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d jobs.verifix.uz
mkdir -p ops/nginx/ssl
sudo cp /etc/letsencrypt/live/jobs.verifix.uz/fullchain.pem ops/nginx/ssl/
sudo cp /etc/letsencrypt/live/jobs.verifix.uz/privkey.pem ops/nginx/ssl/
```

### 5. Запуск

```bash
chmod +x ops/deploy.sh ops/backup/backup-db.sh ops/backup/backup-redis.sh
./ops/deploy.sh --deploy
```

### 6. Проверка

```bash
./ops/deploy.sh --status
curl -k https://localhost/api/v1/public/vacancies
curl -k https://localhost/actuator/health
```

### 7. Настройка cron-задач

```bash
crontab -e
# Добавить:
0 2 * * * /opt/verifix/verifix-jobs/ops/backup/backup-db.sh
0 3 * * * /opt/verifix/verifix-jobs/ops/backup/backup-redis.sh
0 0 1 * * certbot renew --quiet
```

## Обновление

```bash
cd /opt/verifix/verifix-jobs
git pull origin main
./ops/deploy.sh --build
./ops/deploy.sh --deploy
```

## Откат

```bash
./ops/deploy.sh --rollback
```
