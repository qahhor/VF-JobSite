# Операционный справочник (Runbook) — Verifix Jobs

## Инфраструктура

| Сервис | Контейнер | Образ | Порт |
|--------|-----------|-------|------|
| API | verifix-jobs-api | Custom Spring Boot | 7777→8080 |
| Telegram Bot | verifix-jobs-telegram | Custom Spring Boot | — |
| Nginx | verifix-jobs-nginx | nginx:1.27 | 80, 443 |
| PostgreSQL | verifix-jobs-postgres | postgis/postgis:16-3.4 | 5432 |
| Redis | verifix-jobs-redis | redis:7 | 6379 |
| Elasticsearch | verifix-jobs-elasticsearch | elasticsearch:8.17 | 9200 |

## Мониторинг

### Дашборды
- **Grafana**: http://5.75.238.254:3000
- **Prometheus**: http://5.75.238.254:9090

### Ключевые метрики
| Метрика | Порог Warning | Порог Critical |
|---------|---------------|----------------|
| HTTP Error Rate (5xx) | >2% | >5% |
| P95 Response Time | >1.5s | >3s |
| JVM Heap Usage | >75% | >90% |
| DB Connection Pool | >70% | >90% |
| Disk Usage | >80% | >90% |

### Health Check
```bash
# API health
curl https://job.verifix.uz/actuator/health

# Все контейнеры
docker ps --filter "name=verifix"
```

## Troubleshooting

### Сервис не отвечает

```bash
# 1. Проверить статус
docker ps --filter "name=verifix"
docker logs verifix-jobs-api --tail 100

# 2. Перезапустить один сервис
docker restart verifix-jobs-api

# 3. Если Nginx не отвечает
docker restart verifix-jobs-nginx
docker logs verifix-jobs-nginx --tail 50
```

### БД не отвечает

```bash
# Проверить PostgreSQL
docker exec verifix-jobs-postgres pg_isready -U verifix
docker logs verifix-jobs-postgres --tail 50

# Проверить пул соединений
curl -s http://localhost:7777/actuator/metrics/hikaricp.connections.active | jq
```

### Белый экран на сайте

```bash
# Скорее всего проблема с Service Worker. Решения:
# 1. Проверить что index.html обновлён
ls -la /opt/verifix/VF-JobSite/verifix-jobs/verifix-jobs-web/dist/verifix-jobs-web/browser/index.html

# 2. Пересобрать и перезапустить
cd /opt/verifix/VF-JobSite/verifix-jobs/verifix-jobs-web
npx ng build
docker restart verifix-jobs-nginx

# 3. Проверить ngsw-config.json — НЕ должен содержать index.csr.html
```

### Telegram бот не отвечает

```bash
docker logs verifix-jobs-telegram --tail 100

# Типичные проблемы:
# - LazyInitializationException → нужен @Transactional + Hibernate.initialize()
# - Token expired → проверить TELEGRAM_BOT_TOKEN в .env
# - ES/Kafka disabled → должны быть -e ELASTICSEARCH_ENABLED=false -e KAFKA_ENABLED=false
```

### OOM (Out of Memory)

```bash
docker stats --no-stream
# Увеличить лимиты если нужно:
# docker update --memory=4g verifix-jobs-api
```

### SMS не отправляется

```bash
docker logs verifix-jobs-api 2>&1 | grep -i "sms\|eskiz\|playmobile"
# Проверить баланс SMS-провайдера
# Проверить rate limiting
```

### Elasticsearch не индексирует

```bash
curl http://localhost:9200/_cluster/health | jq
curl http://localhost:9200/_cat/indices
# Переиндексация
curl -X POST http://localhost:7777/api/v1/admin/search/reindex
```

## Типичные операции

### Обновление только frontend

```bash
cd /opt/verifix/VF-JobSite
git fetch && git reset --hard origin/main
cd verifix-jobs/verifix-jobs-web
npm install --legacy-peer-deps
npx ng build
docker restart verifix-jobs-nginx
```

### Обновление backend (API)

```bash
cd /opt/verifix/VF-JobSite
git fetch && git reset --hard origin/main
docker build --no-cache -t verifix-jobs-api -f verifix-jobs-api/Dockerfile .
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

### Просмотр логов

```bash
# Последние ошибки API
docker logs verifix-jobs-api 2>&1 | grep -i "error\|exception" | tail -20

# Telegram bot
docker logs verifix-jobs-telegram --tail 50 -f

# Nginx access/error
docker logs verifix-jobs-nginx --tail 50
```

## Escalation Matrix

| Уровень | Описание | Время реагирования |
|---------|----------|---------------------|
| P0 | Платформа недоступна | 15 мин |
| P1 | Критический функционал сломан | 1 час |
| P2 | Деградация производительности | 4 часа |
| P3 | Некритический баг | 24 часа |

## Бэкапы

| Что | Когда | Хранение | Скрипт |
|-----|-------|----------|--------|
| PostgreSQL | Ежедневно 02:00 | 30 дней | ops/backup/backup-db.sh |
| Redis | Ежедневно 03:00 | 7 дней | ops/backup/backup-redis.sh |

## Ротация секретов

```bash
# 1. Сгенерировать новый JWT-секрет
openssl rand -base64 64

# 2. Обновить .env
nano .env  # JWT_SECRET=новый_секрет

# 3. Перезапустить (пользователи перелогинятся)
docker restart verifix-jobs-api verifix-jobs-telegram
```
