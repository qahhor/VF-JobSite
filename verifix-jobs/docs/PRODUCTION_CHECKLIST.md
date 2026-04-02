# Production Checklist

## Public entrypoints

- [ ] `https://jobs.verifix.uz` resolves to the production server
- [ ] `https://admin.jobs.verifix.uz` resolves to the production server
- [ ] TLS certificates exist in `ops/nginx/ssl/fullchain.pem` and `ops/nginx/ssl/privkey.pem`

## Secrets and environment

- [ ] `.env` exists on the server and is not committed to git
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `APP_BASE_URL=https://jobs.verifix.uz`
- [ ] `CORS_ORIGINS=https://jobs.verifix.uz,https://admin.jobs.verifix.uz`
- [ ] `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `ELASTIC_PASSWORD`, and `GRAFANA_ADMIN_PASSWORD` are strong non-default values

## Runtime hardening

- [ ] Only `80/443` are exposed publicly
- [ ] Internal services are not published directly from Docker Compose
- [ ] Swagger and `/v3/api-docs` are blocked in production
- [ ] `/actuator/*` is blocked at Nginx
- [ ] Nginx rate limiting is enabled for auth and API routes

## Application health

- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml ps` shows healthy containers
- [ ] `https://jobs.verifix.uz` serves the public app
- [ ] `https://admin.jobs.verifix.uz` serves the standalone admin app
- [ ] `https://jobs.verifix.uz/api/v1/public/vacancies?size=1` returns `200`
- [ ] Liquibase migrations complete successfully
- [ ] Telegram bot starts successfully with the production token

## Observability

- [ ] Prometheus and Grafana are running
- [ ] Monitoring access is limited to VPN, bastion, or SSH tunnel
- [ ] Log rotation is enabled for long-running containers
- [ ] Backups run before deploy and are restorable

## Post-deploy validation

- [ ] Browser smoke on desktop
- [ ] Browser smoke on mobile viewport
- [ ] Employer auth flow
- [ ] Candidate/public vacancy apply flow
- [ ] Admin moderation and GOV dashboards
