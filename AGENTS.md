# VF-JobSite — Verifix Jobs Platform

## Overview
Job portal for mass hiring of blue-collar workers in Central Asia (UZ, KZ, KG, TJ). Part of Verifix HRM ecosystem.

## Tech Stack
- **Java 21**, Spring Boot 3.5.12, Spring Data JPA, Spring Security 6, WebFlux
- **PostgreSQL 16 + PostGIS**, Liquibase migrations
- **Redis 7** (cache), **Elasticsearch 8.12** (search), **Kafka** (messaging)
- **MinIO** (file storage), **Telegram Bot API 6.9.7.1**
- **Lombok**, **MapStruct**, **JWT (jjwt 0.12.5)**, **OpenAPI/Swagger**
- Frontend: Angular 17+ (separate project)

## Module Structure
```
verifix-jobs/
├── verifix-jobs-common/         # Shared DTOs, exceptions, utils (15 files)
├── verifix-jobs-domain/         # 35+ JPA entities, 50+ repos, Liquibase
├── verifix-jobs-service/        # 55+ services (24 packages)
├── verifix-jobs-api/            # 32 REST controllers + DTOs + MapStruct mappers
├── verifix-jobs-telegram/       # Telegram bot + mini app (18 files)
└── verifix-jobs-integration/    # External clients: SMS, payment, gov, KYC, geo, HRM
```

## Key Service Packages (verifix-jobs-service)
| Package | What it does |
|---------|-------------|
| `admin/` | Admin ops, audit logging |
| `analytics/` | Dashboard metrics |
| `application/` | Job applications, status machine, bulk ops |
| `auth/` | JWT + OTP |
| `billing/` | Subscriptions, payment processing |
| `branding/` | Employer branding pages (8 services) |
| `candidate/` | Auth, search, profile, work history |
| `compliance/` | GDPR data export |
| `consent/` | Consent tracking |
| `employer/` | Auth, profile, notifications, managers |
| `geo/` | PostGIS + Nominatim geocoding |
| `gov/` | Gov sync (ARGOS, ENST, Mehnat), HRM bridge |
| `i18n/` | MessageService (uz/ru/en/kk/ky/tg) |
| `ml/` | Matching, salary prediction, fraud detection, notification optimizer |
| `moderation/` | Content moderation |
| `notification/` | Multi-channel: SMS, Telegram, push, email |
| `referral/` | Referral program |
| `scheduler/` | Digest, vacancy expiry, matching, gov sync, channel posting, employer reports |
| `search/` | Elasticsearch vacancy indexing |
| `vacancy/` | CRUD, import, status machine |
| `verification/` | MyID KYC |

## Entities (35+ core)
Core: Candidate, Employer, Manager, Vacancy, Application, Referral, Notification, SmsLog, AdminUser, AdminAuditLog, GeoCity, MlCandidateScore, Payment, PricingPlan, WorkHistory, ConsentLog, FraudAlert, GovSyncLog, VerificationLog, ModerationQueue
Branding (14): EmployerBranding, BrandingAnalytics, BrandingBenefit, BrandingCoverImage, BrandingFaq, BrandingGallery, etc.

## Integration Clients
- **SMS**: EskizSmsGateway, PlayMobileSmsGateway (pluggable interface)
- **Payment**: ClickUzClient, PaymeClient + webhook handling
- **Gov**: MehnatClient, ArgosClient, EnstClient (via GovClientRouter)
- **KYC**: MyIdClient
- **Geo**: NominatimClient
- **Storage**: FileStorageService (MinIO/S3)
- **HRM**: VerifixHrmClient

## ML Services (implemented)
- **CandidateMatchingService** — rule-based scoring (city, category, salary, skills, education, MyID)
- **SalaryPredictionService** — market salary stats (p25, median, p75) by category/city
- **FraudDetectionService** — rapid-fire apps, incomplete profiles, duplicates, self-referrals
- **NotificationOptimizer** — channel selection + optimal send time

## Completed Phases
- Phase 1 (MVP): project structure, entities, auth, vacancies, SMS, moderation, geo, Telegram bot, admin, notifications, Elasticsearch, referrals
- Phase 2 (Employer): employer portal, MyID KYC, consent, work history, analytics, monetization (Click.uz + Payme.uz), engagement (channel posting, mini app, referral leaderboard), candidate search, bulk ops, CSV import, data export
- Phase 3 (Gov): ARGOS/ENST/Mehnat sync, HRM bridge, gov reporting
- Phase 4 (ML): matching, salary prediction, fraud detection, i18n
- Branding: premium employer pages (B-01 → B-05)

## Remaining (TODO)
- AI Chatbot: Codex API / keyword-based conversational job search in Telegram
- A/B Testing Framework: experiment management, variant assignment, conversion tracking
- Churn Prediction: rule-based scoring, daily scheduler, re-engagement notifications

## Git Branch
Development branch: `Codex/explore-repository-gru04`

## Build & Run
```bash
cd verifix-jobs
mvn clean compile        # compile all modules
docker-compose up -d     # PostgreSQL, Redis, Elasticsearch, Kafka, MinIO, Zookeeper
```

## Key Paths
- Entities: `verifix-jobs-domain/src/main/java/uz/verifix/jobs/domain/entity/`
- Services: `verifix-jobs-service/src/main/java/uz/verifix/jobs/service/`
- Controllers: `verifix-jobs-api/src/main/java/uz/verifix/jobs/api/controller/`
- Telegram: `verifix-jobs-telegram/src/main/java/uz/verifix/jobs/telegram/`
- Integrations: `verifix-jobs-integration/src/main/java/uz/verifix/jobs/integration/`
- Migrations: `verifix-jobs-domain/src/main/resources/db/changelog/`
- Config: `verifix-jobs-api/src/main/resources/application.yml`
