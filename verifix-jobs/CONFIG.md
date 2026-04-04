# Verifix Jobs — Configuration Guide

## Quick Start

```bash
cp .env.example .env
# Edit .env — replace all "replace-..." placeholders
bash ops/validate-env.sh .env   # validate before deploy
```

## Environment Sections

| #  | Section              | Required | Description                              |
|----|----------------------|----------|------------------------------------------|
| 1  | APP                  | Yes      | Profile, base URL, CORS origins          |
| 2  | SECURITY & SECRETS   | Yes      | JWT secret & token lifetimes             |
| 3  | DATABASE             | Yes      | PostgreSQL + PostGIS connection & pool    |
| 4  | CACHE                | Yes      | Redis connection & Lettuce pool           |
| 5  | SEARCH               | If on    | Elasticsearch host/port                  |
| 6  | QUEUE                | If on    | Kafka bootstrap servers                  |
| 7  | STORAGE              | If on    | MinIO / S3-compatible object storage     |
| 8  | EMAIL                | No       | SMTP for admin invites                   |
| 9  | SMS                  | No       | Eskiz + PlayMobile gateways              |
| 10 | TELEGRAM             | Yes      | Bot token, username, channel settings    |
| 11 | PAYMENTS             | No       | Click.uz, Payme integrations             |
| 12 | KYC                  | No       | MyID identity verification               |
| 13 | HRM INTEGRATION      | If on    | Verifix HRM API sync & SSO              |
| 14 | GOVERNMENT           | If on    | ARGOS, ENST, Mehnat API keys            |
| 15 | AI                   | If on    | Claude API key & model settings          |
| 16 | ML SERVICE           | If on    | ML service URL & gRPC settings           |
| 17 | ATS TELEGRAM         | If on    | ATS webhook & HMAC secret               |
| 18 | OBSERVABILITY        | Yes      | Grafana admin credentials                |
| 19 | FEATURE FLAGS        | Yes      | Module on/off toggles                    |
| 20 | RATE LIMITING        | No       | API rate limits & moderation rules       |
| 21 | PERFORMANCE TUNING   | No       | Tomcat, async, scheduler pool sizes      |

## Module Toggles (Section 19)

Disabled modules skip bean registration, routes, schedulers, and **do not require their secrets**.

| Flag                     | Default | Controls                            |
|--------------------------|---------|-------------------------------------|
| `KAFKA_ENABLED`          | `true`  | Event bus, async processing         |
| `ELASTICSEARCH_ENABLED`  | `true`  | Full-text vacancy search            |
| `MINIO_ENABLED`          | `false` | File/resume storage                 |
| `ML_SERVICE_ENABLED`     | `false` | ML matching & recommendations       |
| `GOV_SYNC_ENABLED`       | `false` | ARGOS/ENST/Mehnat sync              |
| `HRM_SYNC_ENABLED`       | `false` | Verifix HRM vacancy import          |
| `HRM_SSO_ENABLED`        | `false` | Biruni OAuth2 SSO                   |
| `ATS_TELEGRAM_ENABLED`   | `false` | ATS Telegram webhook                |
| `AI_CHATBOT_ENABLED`     | `false` | Claude-powered chatbot              |
| `AI_SCREENING_ENABLED`   | `false` | AI resume screening                 |

### Examples

**Minimal production** (just core features):
```env
KAFKA_ENABLED=true
ELASTICSEARCH_ENABLED=true
MINIO_ENABLED=false
ML_SERVICE_ENABLED=false
GOV_SYNC_ENABLED=false
HRM_SYNC_ENABLED=false
HRM_SSO_ENABLED=false
ATS_TELEGRAM_ENABLED=false
AI_CHATBOT_ENABLED=false
AI_SCREENING_ENABLED=false
```

**Full stack** (all modules):
```env
KAFKA_ENABLED=true
ELASTICSEARCH_ENABLED=true
MINIO_ENABLED=true
ML_SERVICE_ENABLED=true
GOV_SYNC_ENABLED=true
HRM_SYNC_ENABLED=true
HRM_SSO_ENABLED=true
ATS_TELEGRAM_ENABLED=true
AI_CHATBOT_ENABLED=true
AI_SCREENING_ENABLED=true
# Don't forget to set all required secrets for enabled modules!
```

## DAU 10K Tuning (Sections 3, 4, 21)

Default values in `.env.example` are tuned for **4-core / 8GB server** with ~10,000 DAU (~1,000 concurrent peak).

| Parameter               | Default | Rule of Thumb                              |
|-------------------------|---------|--------------------------------------------|
| `HIKARI_MAX_POOL_SIZE`  | 50      | `(cores * 2) + spindle_count`              |
| `HIKARI_MIN_IDLE`       | 10      | 20% of max pool                            |
| `REDIS_POOL_MAX_ACTIVE` | 40      | ~80% of DB pool                            |
| `TOMCAT_MAX_THREADS`    | 400     | 200–400 for I/O-bound workloads            |
| `TOMCAT_MIN_SPARE`      | 40      | 10% of max threads                         |
| `ASYNC_CORE_POOL`       | 15      | ~cores * 3                                 |
| `ASYNC_MAX_POOL`        | 100     | burst capacity                             |

For 8-core servers, roughly double pool sizes. Monitor with Grafana dashboard before tuning further.

## Validation

```bash
# Validate .env before deploying
bash ops/validate-env.sh .env

# Checks performed:
# - SPRING_PROFILES_ACTIVE = prod
# - Core secrets present and sufficiently long
# - Default passwords not used
# - APP_BASE_URL uses https
# - CORS_ORIGINS has no localhost
# - TLS certificates exist
# - Module-specific secrets only if that module is enabled
```

## Production Deploy

```bash
# On server (5.75.238.254)
cd /root/verifix-jobs
git pull origin main

# Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify
docker compose ps
curl -f https://job.verifix.uz/actuator/health
```

## Docker Compose Structure

- `docker-compose.yml` — base services, dev defaults, port mappings
- `docker-compose.prod.yml` — production overlay: closes ports, sets resource limits, adds nginx with TLS

Production always uses both files:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml <command>
```
