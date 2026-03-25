# Архитектура Verifix Jobs

## Диаграмма компонентов

```
                    ┌─────────────┐
                    │   Internet  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │ :443 TLS + Rate Limiting
                    │  (Reverse   │ :80  → redirect HTTPS
                    │   Proxy)    │
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌──────────┐  ┌──────────────┐
   │  API Server │  │ Telegram │  │  Static Web  │
   │  (Spring    │  │   Bot    │  │  (Angular)   │
   │  Boot :8080)│  │  (:8081) │  │  /employer/  │
   └──────┬──────┘  └────┬─────┘  │  /jobs/      │
          │               │        │  /companies/ │
          └───────┬───────┘        └──────────────┘
                  │
    ┌─────────────┼─────────────────────┐
    │             │                     │
    ▼             ▼                     ▼
┌────────┐  ┌─────────┐  ┌──────────────────┐
│Postgres│  │  Redis   │  │  Elasticsearch   │
│ 16 +   │  │  7       │  │  8.17            │
│ PostGIS│  │ (cache)  │  │  (search)        │
│ :5432  │  │ :6379    │  │  :9200           │
└────────┘  └─────────┘  └──────────────────┘
    │
    ├── Liquibase (17 миграций)
    │
    ▼
┌──────────────────────────────┐
│       Service Layer          │
│ ┌──────┐ ┌──────┐ ┌───────┐ │
│ │Auth  │ │Vacan-│ │Appli- │ │
│ │JWT   │ │cies  │ │cation │ │
│ │OTP   │ │Search│ │Status │ │
│ └──────┘ └──────┘ └───────┘ │
│ ┌──────┐ ┌──────┐ ┌───────┐ │
│ │Notif-│ │Billi-│ │Brand- │ │
│ │ication│ │ng   │ │ing    │ │
│ │SMS/TG│ │Click │ │Premium│ │
│ └──────┘ └──────┘ └───────┘ │
│ ┌──────┐ ┌──────┐ ┌───────┐ │
│ │ML    │ │AI    │ │Market │ │
│ │Match │ │Screen│ │Intel  │ │
│ │Salary│ │Intake│ │Funnel │ │
│ └──────┘ └──────┘ └───────┘ │
└──────────────────────────────┘
          │         │
    ┌─────┘         └──────┐
    ▼                      ▼
┌────────┐          ┌──────────┐
│ Kafka  │          │ ML Svc   │
│ (msgs) │          │ Python   │
│ :9092  │          │ FastAPI  │
└────────┘          │ gRPC     │
                    │ :8000    │
                    │ :50051   │
                    └──────────┘

External Integrations:
┌──────────────────────────────────────┐
│ SMS: Eskiz.uz → PlayMobile (fallback)│
│ Pay: Click.uz, Payme.uz             │
│ KYC: MyID.uz                        │
│ Gov: ARGOS, ENST, ish.mehnat.uz     │
│ HRM: Verifix HRM (SSO, sync)        │
│ ATS: ATS Telegram Bot (webhooks)     │
│ AI:  Claude API (Anthropic)          │
│ Geo: OpenStreetMap Nominatim         │
│ Storage: MinIO (S3-compatible)       │
└──────────────────────────────────────┘

Monitoring:
┌──────────────────────────────────────┐
│ Prometheus :9090 → Alert Rules       │
│ Grafana    :3000 → Dashboards        │
│ Kibana     :5601 → Log Search        │
└──────────────────────────────────────┘
```

## Потоки данных

### Подача заявки кандидатом
```
Кандидат → Telegram Bot / Web → POST /api/v1/candidates/apply
  → ApplicationService.apply()
    → Duplicate check
    → Create Application (status: NEW)
    → EventPublisher → DomainEvent(APPLICATION_NEW)
      → TaskGeneratorService (создаёт задачу рекрутеру)
      → ActivityFeedService (записывает событие)
      → AtsApplicationBridgeService (уведомляет ATS бота)
      → HrmCandidateSyncService (синхронизирует в HRM)
      → NotificationService → SMS/Telegram работодателю
```

### Найм кандидата
```
Рекрутер → PUT /api/v1/applications/{id}/status → HIRED
  → ApplicationStatusMachine (проверка перехода)
  → EventPublisher → DomainEvent(APPLICATION_HIRED)
    → HrmBridgeService → POST /v1/employees (создание в HRM)
    → GovSyncService → reportHiring (ENST реестр)
    → NotificationService → "Поздравляем!" кандидату
    → AtsApplicationBridgeService → уведомление в Telegram
```

## Модули Maven

```
verifix-jobs (parent)
├── verifix-jobs-common      ← DTO, exceptions, utils
├── verifix-jobs-domain      ← Entities, repos, Liquibase
├── verifix-jobs-integration ← External API clients
├── verifix-jobs-service     ← Business logic (90+ services)
├── verifix-jobs-api         ← REST controllers (45+)
└── verifix-jobs-telegram    ← Telegram bot handlers
```
