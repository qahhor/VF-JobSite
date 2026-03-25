# Verifix Jobs

Verifix Jobs is a Central Asia job platform for high-volume blue-collar hiring inside the Verifix HRM ecosystem.

## Current Repo Shape

- Backend modules: `verifix-jobs-common`, `verifix-jobs-domain`, `verifix-jobs-service`, `verifix-jobs-api`, `verifix-jobs-telegram`, `verifix-jobs-integration`
- Frontend/admin skeleton workspaces: `verifix-jobs-web`, `verifix-jobs-admin`
- ML service skeleton: `verifix-jobs-ml`
- Shared runtime config now lives in [application.yml](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-common/src/main/resources/application.yml)

## Stack

- Java 21
- Spring Boot 3.5.12
- PostgreSQL 16 + PostGIS + Liquibase
- Redis 7
- Kafka (Confluent 7.6)
- Elasticsearch 8.x
- MinIO
- Telegram Bot + Mini App auth
- Angular 17 skeleton workspaces
- FastAPI ML skeleton

## Auth Contract

- Employer auth: `/api/v1/auth/employer/*`
- Candidate OTP auth: `/api/v1/auth/candidate/otp/*`
- MyID auth: `/api/v1/auth/myid/*`
- Legacy aliases remain for `/api/v1/auth/*`, `/api/v1/otp/*`, and `/api/v1/verification/*`

## Quick Start

1. Copy `.env.example` to `.env` and fill secrets.
2. Start infra:
```bash
docker compose up -d
```
3. Build backend:
```bash
./mvnw -B verify
```
4. Run API:
```bash
./mvnw spring-boot:run -pl verifix-jobs-api
```
5. Run Telegram app separately:
```bash
APP_NAME=verifix-jobs-telegram APP_PORT=8081 ./mvnw spring-boot:run -pl verifix-jobs-telegram
```

## Observability

- API health: `http://localhost:8080/actuator/health`
- API metrics: `http://localhost:8080/actuator/prometheus`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

## Notes

- The Telegram module is now a separate Spring Boot application.
- `DEVELOPMENT_PLAN.md` contains the phased roadmap plus a repo status snapshot.
- Frontend/admin/ML folders are bootstrap skeletons, not finished products.
