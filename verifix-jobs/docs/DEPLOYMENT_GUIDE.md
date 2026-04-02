# Verifix Jobs Deployment Guide

## Domains

- Public app: `https://jobs.verifix.uz`
- Standalone admin: `https://admin.jobs.verifix.uz`
- API entrypoint: `https://jobs.verifix.uz/api/...`

## Production topology

The production stack is driven by:

- [docker-compose.yml](D:/DATA/VFX/VF-JobSite/verifix-jobs/docker-compose.yml)
- [docker-compose.prod.yml](D:/DATA/VFX/VF-JobSite/verifix-jobs/docker-compose.prod.yml)

Frontend delivery:

- [verifix-jobs-web/Dockerfile](D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/Dockerfile)
- [verifix-jobs-admin/Dockerfile](D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-admin/Dockerfile)
- [ops/nginx/nginx.conf](D:/DATA/VFX/VF-JobSite/verifix-jobs/ops/nginx/nginx.conf)

## Required setup

1. Copy `.env.example` to `.env`.
2. Set `SPRING_PROFILES_ACTIVE=prod`.
3. Set strong values for:
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
   - `MINIO_ACCESS_KEY`
   - `MINIO_SECRET_KEY`
4. Set:
   - `APP_BASE_URL=https://jobs.verifix.uz`
   - `CORS_ORIGINS=https://jobs.verifix.uz,https://admin.jobs.verifix.uz`
5. Put TLS files into [ops/nginx/ssl](D:/DATA/VFX/VF-JobSite/verifix-jobs/ops/nginx/ssl):
   - `fullchain.pem`
   - `privkey.pem`

## Deploy

```bash
cd /opt/verifix/verifix-jobs
bash ops/validate-env.sh .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
```

Or use:

```bash
cd /opt/verifix/verifix-jobs
bash ops/deploy.sh --deploy
```

## Verify

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -I https://jobs.verifix.uz
curl -I https://admin.jobs.verifix.uz
curl https://jobs.verifix.uz/api/v1/public/vacancies?size=1
```

Expected result:

- `jobs.verifix.uz` serves the public Angular app, including embedded `/admin` routes.
- `admin.jobs.verifix.uz` serves the standalone admin Angular app.
- `/api/*` is proxied to the Spring Boot API.
