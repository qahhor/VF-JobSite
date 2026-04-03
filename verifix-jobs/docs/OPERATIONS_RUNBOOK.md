# Operations Runbook

## Stack overview

| Service | Container | Public access |
|---|---|---|
| Public frontend | `verifix-jobs-web` | via `https://jobs.verifix.uz` |
| Embedded admin | `verifix-jobs-web` | via `https://jobs.verifix.uz/admin` |
| API | `verifix-jobs-api` | proxied through Nginx only |
| Telegram bot | `verifix-jobs-telegram` | internal |
| ML service | `verifix-jobs-ml` | internal |
| PostgreSQL | `verifix-jobs-postgres` | internal |
| Redis | `verifix-jobs-redis` | internal |
| Elasticsearch | `verifix-jobs-elasticsearch` | internal |
| Kafka | `verifix-jobs-kafka` | internal |
| MinIO | `verifix-jobs-minio` | internal |
| Nginx | `verifix-jobs-nginx` | `80/443` only |

## Standard deploy

```bash
cd /opt/verifix/verifix-jobs
bash ops/validate-env.sh .env
bash ops/deploy.sh --deploy
```

## Health checks

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' verifix-jobs-nginx
curl -I https://jobs.verifix.uz
curl -I https://jobs.verifix.uz/admin/login
curl https://jobs.verifix.uz/api/v1/public/vacancies?size=1
```

## Logs

```bash
docker logs verifix-jobs-api --tail 100
docker logs verifix-jobs-web --tail 100
docker logs verifix-jobs-admin --tail 100
docker logs verifix-jobs-nginx --tail 100
docker logs verifix-jobs-telegram --tail 100
```

## Troubleshooting

### Public site does not load

```bash
docker logs verifix-jobs-nginx --tail 100
docker logs verifix-jobs-web --tail 100
docker exec verifix-jobs-nginx wget -q -O - http://verifix-jobs-web/nginx-health
```

### Admin site does not load

```bash
docker logs verifix-jobs-admin --tail 100
docker exec verifix-jobs-nginx wget -q -O - http://verifix-jobs-admin/nginx-health
```

### API returns 502 or 5xx

```bash
docker logs verifix-jobs-api --tail 200
docker inspect --format='{{json .State.Health}}' verifix-jobs-api
```

### Database issue

```bash
docker exec verifix-jobs-postgres pg_isready -U verifix -d verifix_jobs
docker logs verifix-jobs-postgres --tail 100
```

### Redis issue

```bash
docker exec verifix-jobs-redis redis-cli -a "$REDIS_PASSWORD" ping
docker logs verifix-jobs-redis --tail 100
```

### Telegram bot issue

```bash
docker logs verifix-jobs-telegram --tail 200
```

## Monitoring access

Prometheus and Grafana should stay internal. Access them via SSH tunnel or bastion, for example:

```bash
ssh -L 3000:localhost:3000 -L 9090:localhost:9090 user@server
```

Then open `http://localhost:3000` and `http://localhost:9090`.

## Backups

```bash
bash ops/backup/backup-db.sh
bash ops/backup/backup-redis.sh
```

## Secret rotation

```bash
openssl rand -base64 64
nano .env
bash ops/deploy.sh --deploy
```
