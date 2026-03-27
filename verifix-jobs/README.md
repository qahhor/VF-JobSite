# Verifix Jobs

Job platform for blue-collar hiring in Central Asia, part of the Verifix HRM ecosystem.

**Live:** [job.verifix.uz](https://job.verifix.uz) | **Telegram:** [@VerifixJobBot](https://t.me/VerifixJobBot)

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.5.12 |
| Database | PostgreSQL 16 + PostGIS 3.4, Liquibase (22 migrations) |
| Cache | Redis 7 |
| Search | Elasticsearch 8.17 (multilingual synonyms, 14 categories × 7 languages) |
| Messaging | Kafka (Confluent 7.6) |
| Storage | MinIO (S3-compatible) |
| Frontend | Angular 19, Tailwind CSS, PWA (Service Worker, offline caching) |
| Telegram | Telegram Bot API 6.9.7.1 (long-polling, manual config) |
| ML | FastAPI + gRPC (skeleton) |
| AI | Claude API (vacancy generator, screening, NLP search) |
| Proxy | Nginx 1.27 (TLS, rate limiting) |
| Monitoring | Prometheus + Grafana |

## Repository Structure

```
verifix-jobs/
├── verifix-jobs-common       ← DTOs, exceptions, utilities
├── verifix-jobs-domain       ← 60+ JPA entities, repositories, Liquibase migrations
├── verifix-jobs-service      ← 89 business services
├── verifix-jobs-api          ← 58 REST controllers
├── verifix-jobs-integration  ← External API clients (SMS, KYC, Gov, HRM)
├── verifix-jobs-telegram     ← Telegram bot (9 handlers, AI chat, channel posting)
├── verifix-jobs-web          ← Angular 19 frontend (49 components, PWA)
├── verifix-jobs-ml           ← Python ML service (FastAPI + gRPC skeleton)
├── ops/                      ← Docker, Nginx, backup scripts
├── reference-data/           ← Central Asia cities, categories, synonyms
└── docs/                     ← Architecture, deployment, runbook
```

## Key Features

### Public Marketplace
- Vacancy catalog with filters (city, category, salary, shift, benefits)
- Split-view layout (desktop), map view with Leaflet
- Company directory with reviews
- Favorites, saved searches, alerts
- PWA installable app with offline support
- i18n: 7 languages (UZ Latin, UZ Cyrillic, RU, EN, KK, TG, KY)

### Employer Portal (`/employer/*`)
- Operations dashboard with KPIs, health scores, ROI
- Vacancy management with templates and bump
- ATS Pipeline (Kanban) with keyboard shortcuts
- Candidate database search
- Hiring projects, talent hub, organization memory
- Billing: subscription tiers, promotions, contact credits
- Team management (ADMIN/RECRUITER/VIEWER roles)
- Branded employer pages (cover, gallery, FAQ, video)
- AI vacancy generator, market intelligence

### Telegram Bot (`@VerifixJobBot`)
- Registration wizard with language selection (6 languages)
- Category-based and text search with pagination
- Nearby jobs (location-based via PostGIS)
- Apply, favorites, referral system
- AI-powered natural language search
- Channel auto-posting for new vacancies

### Integrations
- SMS: Eskiz.uz + PlayMobile (fallback)
- Payments: Click.uz, Payme.uz
- KYC: MyID.uz
- Government: ARGOS, ENST, ish.mehnat.uz
- HRM: Verifix HRM (SSO, employee sync)

## Auth Contract

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/auth/employer/login` | Employer JWT login |
| `POST /api/v1/auth/employer/register` | Employer registration |
| `POST /api/v1/auth/employer/refresh` | Token refresh |
| `POST /api/v1/auth/candidate/otp/send` | Candidate OTP send |
| `POST /api/v1/auth/candidate/otp/verify` | Candidate OTP verify |
| `POST /api/v1/auth/myid/*` | MyID verification |

## Quick Start

### Prerequisites
- Java 21, Node.js 20+, Docker

### Development

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Build backend
./mvnw -B verify

# 3. Run API (port 8080)
./mvnw spring-boot:run -pl verifix-jobs-api

# 4. Run Telegram bot (port 8081)
APP_NAME=verifix-jobs-telegram APP_PORT=8081 ./mvnw spring-boot:run -pl verifix-jobs-telegram

# 5. Run frontend (port 4200)
cd verifix-jobs-web && npm install && npx ng serve
```

### Production Deployment

```bash
# On server (5.75.238.254)
cd /opt/verifix/VF-JobSite
git fetch && git reset --hard origin/main

# Backend: rebuild Docker images
docker build --no-cache -t verifix-jobs-api -f verifix-jobs-api/Dockerfile .
docker build --no-cache -t verifix-jobs-telegram -f verifix-jobs-telegram/Dockerfile .

# Frontend: build and restart Nginx
cd verifix-jobs/verifix-jobs-web
npm install --legacy-peer-deps && npx ng build
docker restart verifix-jobs-nginx

# Restart services
docker restart verifix-jobs-api verifix-jobs-telegram
```

## Observability

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Health check |
| `/actuator/prometheus` | Prometheus metrics |
| Grafana `:3000` | Dashboards |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Component diagrams, data flows, module structure
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) — Step-by-step server setup
- [Operations Runbook](docs/OPERATIONS_RUNBOOK.md) — Monitoring, troubleshooting, escalation
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md) — Go/No-Go criteria
