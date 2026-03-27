# Verifix Jobs — Development Plan

## Repository Status (March 2026)

- [x] Backend multi-module Maven structure (6 modules)
- [x] Docker Compose infrastructure (PostgreSQL + PostGIS, Redis, Elasticsearch, Kafka, MinIO)
- [x] Liquibase schema — 22 migrations, 60+ JPA entities
- [x] 89 business services, 58 REST controllers
- [x] JWT + OTP + MyID auth with token refresh
- [x] Angular 19 frontend — 49 components, PWA, i18n (7 languages)
- [x] Telegram bot — 9 handlers, AI chat, language selection, channel posting
- [x] Employer portal (dashboard, ATS pipeline, vacancies, billing, analytics)
- [x] Public marketplace (split-view, map, filters, favorites, saved searches)
- [x] Production deployment on Hetzner (Docker, Nginx, Let's Encrypt)
- [x] Monitoring (Prometheus + Grafana)
- [~] CI/CD pipeline (manual Docker deploy, no automated pipeline)
- [~] ML service (skeleton only)
- [ ] Full test coverage (unit + integration)

## Completed Phases

### Phase 1: MVP Core (Sprints 1-5) ✅
- [x] Project structure + Docker Compose
- [x] Full Liquibase schema + seed data
- [x] JPA entities + repositories
- [x] Spring Security (JWT + OTP + roles)
- [x] Employer auth (register, login, refresh)
- [x] Candidate OTP auth (SMS/Telegram)
- [x] Vacancy CRUD + status machine
- [x] Telegram bot (registration, search, apply, nearby, referral)
- [x] Elasticsearch vacancy search with multilingual synonyms
- [x] Angular frontend skeleton + PWA config
- [x] Notification system (Telegram + SMS)

### Phase 2: Employer Tools & Growth (Sprints 6-9) ✅
- [x] Subscription tiers (FREE/STANDARD/PREMIUM)
- [x] Click.uz + Payme.uz payment integration (backend)
- [x] Referral system with anti-fraud
- [x] Geolocation search + PostGIS
- [x] Telegram channel autoposting
- [x] Employer branding pages
- [x] Analytics dashboard
- [x] Candidate database search for employers
- [x] Bulk operations (invite, reject)

### Phase 3: Gov & Ecosystem (Sprints 10-13) ✅
- [x] Admin panel (base structure)
- [x] ARGOS/ENST/ish.mehnat.uz integration
- [x] Verifix HRM bridge (SSO, employee sync)
- [x] Consent management + data export
- [x] Multi-language support (7 languages)

### Phase 4: AI/ML (Sprints 14-18) — Partial
- [x] Python FastAPI microservice skeleton
- [x] Rule-based matching (candidate ↔ vacancy)
- [x] Salary prediction model (backend)
- [x] AI agents skeleton (screening, intake, sourcing)
- [~] Claude API integration (skeleton, not connected)
- [ ] gRPC interface to Spring Boot
- [ ] CatBoost training pipeline
- [ ] Model monitoring

## ТЗ v6.0 Gap Analysis — 5 Этапов

Полный gap analysis: см. plan file `plans/concurrent-wandering-wave.md`

### Этап 1 — Quick Wins ✅ COMPLETE (8/8)
- Benefits icons, TOP badge, candidate badges
- Vacancy templates (12 system + custom), bump endpoint
- Statistics sidebar, keyboard shortcuts (J/K/L/H)
- Matching candidates counter

### Этап 2 — Production Polish ✅ COMPLETE (8/8)
- Split-view layout for vacancy search
- Map / Nearby toggle (Leaflet + PostGIS)
- Branded employer pages (cover, gallery, FAQ, video)
- Multi-manager roles (ADMIN/RECRUITER/VIEWER)
- Contact credits deduction
- Promotion purchase UI (TOP-7/14/30)
- Alerts delivery (Telegram)
- JSON-LD + hreflang structure

### Этап 3 — Intelligence Layer ✅ COMPLETE (7/7)
- Hiring Project UI + dashboard
- Organization Memory UI (facts, preferences)
- Talent Hub UI (reusable pool, cross-vacancy)
- AI Vacancy Generator (text → structured vacancy)
- AI Screening Bot (Telegram Q&A)
- Quick Review Mode
- Market Intelligence (salary, competition)

### Этап 4 — Commerce ✅ COMPLETE (6/6)
- Bundle pricing UI
- Branding tiers enforcement
- Subscription enforcement (limits per tier)
- Multi-country config (skeleton)
- Resilience4j circuit breaker config
- Gov sync reliability improvements

### Этап 5 — AI Differentiation ✅ COMPLETE (7/7)
- Claude API integration structure in Telegram
- AI Sourcing Agent (auto shortlists)
- AI Outreach (personalized invitations)
- Verifix Hiring Agent dashboard
- AI Vacancy Generator UI
- Churn prediction alerts
- Market intelligence dashboard

## Post-Plan Work (Quality & i18n)

### Deep Quality Round ✅
- Token refresh interceptor (401 → refresh → retry)
- Vacancy form step validation with error banners
- Pipeline optimistic updates with rollback
- 404 error states for vacancy detail
- Fix: LazyInitializationException in Telegram bot
- Fix: OrgMemoryFact entity schema mismatch
- Fix: White screen on F5 (Service Worker caching fix)

### i18n Translation ✅
- 7 languages across all public pages
- Home page: hero, categories, stats, CTA
- Header/nav: desktop + mobile bottom tabs
- Login/Register form labels
- PWA install/update banners
- /jobs page: all filters, sort, benefits, category chips
- Split-view sidebar labels
- Telegram bot: language selection for new users + profile change

## Current Coverage vs ТЗ v6.0

| Pillar | Coverage |
|--------|----------|
| A — Public Marketplace | ~90% |
| B — Employer Operations | ~85% |
| C — Employer Intelligence | ~80% |
| D — Commerce & Branding | ~80% |
| E — HRM/Gov/Compliance | ~85% |
| F — AI/Automation | ~60% |
| **Average** | **~80%** |

## Remaining Work

1. **AI/ML Integration** — Connect Claude API, train CatBoost model, pgvector embeddings
2. **Test Coverage** — Unit + integration tests with Testcontainers
3. **CI/CD** — Automated build/deploy pipeline
4. **Multi-country** — Full KZ/KG/TJ support with currency
5. **Performance** — Load testing, caching optimization
6. **SEO** — Server-side rendering or prerendering for public pages
