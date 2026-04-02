# Verifix Jobs

Job platform for blue-collar hiring in Central Asia, part of the Verifix HRM ecosystem.

**Live:** [jobs.verifix.uz](https://jobs.verifix.uz)  
**Standalone admin:** [admin.jobs.verifix.uz](https://admin.jobs.verifix.uz)  
**Telegram:** [@VerifixJobBot](https://t.me/VerifixJobBot)

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3.5.12 |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| Cache | Redis 7 |
| Search | Elasticsearch 8.17 |
| Messaging | Kafka |
| Storage | MinIO |
| Frontend | Angular 19, Tailwind CSS, PWA |
| Telegram | Telegram Bot API 6.9.7.1 |
| ML | FastAPI + gRPC |
| Proxy | Nginx 1.27 |
| Monitoring | Prometheus + Grafana |

## Repository structure

```text
verifix-jobs/
|-- verifix-jobs-common
|-- verifix-jobs-domain
|-- verifix-jobs-service
|-- verifix-jobs-api
|-- verifix-jobs-integration
|-- verifix-jobs-telegram
|-- verifix-jobs-web
|-- verifix-jobs-admin
|-- verifix-jobs-ml
|-- ops
`-- docs
```

## Quick start

### Development

```bash
docker compose up -d
./mvnw -B verify
./mvnw spring-boot:run -pl verifix-jobs-api
```

Frontend:

```bash
cd verifix-jobs-web
npm install
npm start
```

Standalone admin:

```bash
cd verifix-jobs-admin
npm install
npm start
```

## Production deployment

```bash
cd /opt/verifix/verifix-jobs
bash ops/validate-env.sh .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
```

The production stack now includes:

- `verifix-jobs-web`
- `verifix-jobs-admin`
- `verifix-jobs-api`
- `verifix-jobs-telegram`
- `verifix-jobs-ml`
- `verifix-jobs-nginx`

## Documentation

- [Architecture](D:/DATA/VFX/VF-JobSite/verifix-jobs/docs/ARCHITECTURE.md)
- [Deployment Guide](D:/DATA/VFX/VF-JobSite/verifix-jobs/docs/DEPLOYMENT_GUIDE.md)
- [Operations Runbook](D:/DATA/VFX/VF-JobSite/verifix-jobs/docs/OPERATIONS_RUNBOOK.md)
- [Production Checklist](D:/DATA/VFX/VF-JobSite/verifix-jobs/docs/PRODUCTION_CHECKLIST.md)
