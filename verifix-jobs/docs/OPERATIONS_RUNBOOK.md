# Операционный справочник (Runbook) — Verifix Jobs

## Мониторинг

### Дашборды
- **Grafana**: https://monitoring.jobs.verifix.uz:3000 (VPN)
- **Prometheus**: http://localhost:9090 (VPN)

### Ключевые метрики
| Метрика | Порог Warning | Порог Critical |
|---------|---------------|----------------|
| HTTP Error Rate (5xx) | >2% | >5% |
| P95 Response Time | >1.5s | >3s |
| JVM Heap Usage | >75% | >90% |
| DB Connection Pool | >70% | >90% |
| Disk Usage | >80% | >90% |

## Troubleshooting

### Сервис не отвечает

```bash
# 1. Проверить статус
docker ps --filter "name=verifix"
docker logs verifix-jobs-api --tail 100

# 2. Перезапустить
docker restart verifix-jobs-api

# 3. Если не помогло — полный перезапуск
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### БД не отвечает

```bash
# Проверить PostgreSQL
docker exec verifix-jobs-postgres pg_isready -U verifix
docker logs verifix-jobs-postgres --tail 50

# Проверить пул соединений
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.active | jq
```

### OOM (Out of Memory)

```bash
# Проверить использование памяти
docker stats --no-stream
# Увеличить лимиты в docker-compose.prod.yml
# Перезапустить
```

### SMS не отправляется

```bash
# Проверить логи SMS-сервиса
docker logs verifix-jobs-api 2>&1 | grep -i "sms\|eskiz\|playmobile"
# Проверить баланс SMS-провайдера
# Проверить rate limiting
```

### Elasticsearch не индексирует

```bash
# Проверить статус ES
curl http://localhost:9200/_cluster/health | jq
curl http://localhost:9200/_cat/indices
# Переиндексация
curl -X POST http://localhost:8080/api/v1/admin/search/reindex
```

## Escalation Matrix

| Уровень | Описание | Время реагирования | Кто |
|---------|----------|---------------------|-----|
| P0 | Платформа недоступна | 15 мин | DevOps Lead |
| P1 | Критический функционал сломан | 1 час | Backend Lead |
| P2 | Деградация производительности | 4 часа | DevOps |
| P3 | Некритический баг | 24 часа | Developer |

## Процедура отката

1. Определить проблемную версию: `docker images | grep verifix`
2. Создать бэкап текущей БД: `./ops/backup/backup-db.sh`
3. Откат: `./ops/deploy.sh --rollback`
4. Проверить: `./ops/deploy.sh --status`
5. Если нужен откат БД — восстановить из бэкапа:
   ```bash
   PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h localhost -U verifix -d verifix_jobs --clean backup_file.sql.gz
   ```

## Ротация секретов

```bash
# 1. Сгенерировать новый JWT-секрет
openssl rand -base64 64

# 2. Обновить .env
nano .env  # JWT_SECRET=новый_секрет

# 3. Перезапустить API (пользователи перелогинятся)
docker restart verifix-jobs-api verifix-jobs-telegram
```

## Бэкапы

| Что | Когда | Хранение | Скрипт |
|-----|-------|----------|--------|
| PostgreSQL | Ежедневно 02:00 | 30 дней | ops/backup/backup-db.sh |
| Redis | Ежедневно 03:00 | 7 дней | ops/backup/backup-redis.sh |
| MinIO файлы | Ежедневно 04:00 | 90 дней | ops/backup/backup-minio.sh |
