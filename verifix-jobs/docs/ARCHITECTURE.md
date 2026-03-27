# Архитектура Verifix Jobs

## Диаграмма компонентов

```
                    ┌─────────────┐
                    │   Internet  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │ :443 TLS + Rate Limiting
                    │  (1.27)    │ :80  → redirect HTTPS
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌──────────┐  ┌──────────────┐
   │  API Server │  │ Telegram │  │  Angular 19  │
   │  (Spring    │  │   Bot    │  │  PWA (49     │
   │  Boot :8080)│  │  (:8081) │  │  components) │
   │  58 REST    │  │  9 handl │  │  7 languages │
   │  controllers│  │  AI chat │  │  Split-view  │
   └──────┬──────┘  └────┬─────┘  └──────────────┘
          │               │
          └───────┬───────┘
                  │ (89 services)
    ┌─────────────┼─────────────────────┐
    │             │                     │
    ▼             ▼                     ▼
┌────────┐  ┌─────────┐  ┌──────────────────┐
│Postgres│  │  Redis   │  │  Elasticsearch   │
│ 16 +   │  │  7       │  │  8.17            │
│ PostGIS│  │ (cache,  │  │  (multilingual   │
│ :5432  │  │  session)│  │   synonyms)      │
│ 22 migr│  │ :6379    │  │  :9200           │
└────────┘  └─────────┘  └──────────────────┘
    │
    ├── Liquibase (22 миграций)
    ├── 60+ JPA entities
    │
    ▼
┌──────────────────────────────────────┐
│         Service Layer (89)           │
│ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────┐ │
│ │Auth  │ │Vacan-│ │Appli- │ │ATS  │ │
│ │JWT   │ │cies  │ │cation │ │Pipe-│ │
│ │OTP   │ │Search│ │Status │ │line │ │
│ │MyID  │ │Templ.│ │Machine│ │     │ │
│ └──────┘ └──────┘ └───────┘ └─────┘ │
│ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────┐ │
│ │Notif-│ │Billi-│ │Brand- │ │Intel│ │
│ │ication│ │ng   │ │ing    │ │ligen│ │
│ │SMS/TG│ │Click │ │Tiers  │ │ce   │ │
│ │Push  │ │Payme │ │Premium│ │ROI  │ │
│ └──────┘ └──────┘ └───────┘ └─────┘ │
│ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────┐ │
│ │Hiring│ │Talent│ │Org    │ │AI   │ │
│ │Projct│ │Hub   │ │Memory │ │Agent│ │
│ │      │ │Pool  │ │Facts  │ │Scrn │ │
│ └──────┘ └──────┘ └───────┘ └─────┘ │
└──────────────────────────────────────┘
          │         │
    ┌─────┘         └──────┐
    ▼                      ▼
┌────────┐          ┌──────────┐
│ Kafka  │          │ ML Svc   │
│ (msgs) │          │ Python   │
│ :9092  │          │ FastAPI  │
└────────┘          │ gRPC     │
                    │ :50051   │
                    └──────────┘

External Integrations:
┌──────────────────────────────────────┐
│ SMS: Eskiz.uz → PlayMobile (fallback)│
│ Pay: Click.uz, Payme.uz             │
│ KYC: MyID.uz                        │
│ Gov: ARGOS, ENST, ish.mehnat.uz     │
│ HRM: Verifix HRM (SSO, sync)        │
│ AI:  Claude API (Anthropic)          │
│ Geo: OpenStreetMap Nominatim         │
│ Storage: MinIO (S3-compatible)       │
└──────────────────────────────────────┘

Monitoring:
┌──────────────────────────────────────┐
│ Prometheus :9090 → Alert Rules       │
│ Grafana    :3000 → Dashboards        │
└──────────────────────────────────────┘
```

## Модули Maven

```
verifix-jobs (parent)
├── verifix-jobs-common       ← DTO, exceptions, utils, shared config
├── verifix-jobs-domain       ← 60+ JPA entities, repos, 22 Liquibase migrations
├── verifix-jobs-integration  ← External API clients (SMS, KYC, Gov, HRM, AI)
├── verifix-jobs-service      ← 89 business services
├── verifix-jobs-api          ← 58 REST controllers, Spring Security
└── verifix-jobs-telegram     ← Bot handlers (9), AI chat, channel posting
```

## Frontend (Angular 19)

```
verifix-jobs-web/src/app/
├── core/
│   ├── services/       ← AuthService, I18nService (7 языков), PublicApiService
│   ├── interceptors/   ← JWT token refresh, error handling
│   └── guards/         ← AuthGuard
├── features/
│   ├── public/         ← Home, vacancy list/detail, company list/detail, map
│   ├── auth/           ← Login/Register
│   ├── employer/       ← Dashboard (layout + sidebar + routes)
│   ├── vacancies/      ← Vacancy form (5-step wizard), list
│   ├── pipeline/       ← ATS Kanban board
│   ├── candidates/     ← Candidate database search
│   ├── analytics/      ← Charts, funnel
│   ├── billing/        ← Subscriptions, promotions, contact credits
│   ├── settings/       ← Company profile, notifications
│   └── admin/          ← Admin panel
└── shared/
    ├── components/     ← Header, footer, toast, sidebar
    └── utils/          ← Benefit icons, formatters
```

## Telegram Bot

```
verifix-jobs-telegram/src/main/java/uz/verifix/jobs/telegram/
├── bot/
│   └── VerifixJobsBot.java       ← Main bot, routing, language change, favorites
├── handler/
│   ├── StartHandler.java          ← /start, language selection, main menu
│   ├── RegistrationHandler.java   ← 5-step registration wizard
│   ├── SearchHandler.java         ← Text/category/city search with pagination
│   ├── NearbyHandler.java         ← Location-based search (PostGIS)
│   ├── ApplyHandler.java          ← Job application with confirmation
│   ├── ProfileHandler.java        ← View/edit profile
│   ├── ReferralHandler.java       ← Referral code sharing
│   ├── CallbackQueryHandler.java  ← All inline button callbacks
│   └── AiChatHandler.java         ← AI-powered natural language search
├── conversation/
│   └── ConversationManager.java   ← Redis-backed conversation state
├── channel/
│   └── ChannelPostingService.java ← Auto-post new vacancies
└── formatter/
    └── VacancyCardFormatter.java  ← HTML vacancy card formatting
```

## Потоки данных

### Подача заявки кандидатом
```
Кандидат → Telegram Bot / Web → POST /api/v1/candidates/apply
  → ApplicationService.apply()
    → Duplicate check
    → Create Application (status: NEW)
    → EventPublisher → DomainEvent(APPLICATION_NEW)
      → TaskGeneratorService (создает задачу рекрутеру)
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

### i18n — Поддержка языков
```
Frontend: I18nService → localStorage('vjw_lang') → 7 языков
  uz_lat (O'zbek), uz_cyr (Ўзбек), ru, en, kk, tg, ky

Telegram: ConversationState.language → выбор при регистрации
  uz, ru, en, kk, tg, ky

Elasticsearch: SearchSynonyms → 14 категорий × 7 языков
```

## Ключевые технические решения

1. **Telegram bot** использует ручную конфигурацию (не starter) из-за несовместимости `telegrambots-spring-boot-starter` v6 с Spring Boot 3.x
2. **PostGIS** для гео-поиска ближайших вакансий (ST_DWithin, ST_Distance)
3. **Elasticsearch multilingual** — синонимы для 14 категорий на 7 языках
4. **PWA** — Angular Service Worker с offline кэшированием API-ответов (freshness + performance стратегии)
5. **Resilience4j** — circuit breaker для внешних интеграций (SMS, Gov, Payment)
6. **Event-driven** — DomainEvent для decoupled side-effects (уведомления, HRM sync, gov reporting)
