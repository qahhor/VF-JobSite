# Verifix Jobs - Development Plan

## Repository Status Snapshot

- [x] Backend multi-module Maven structure exists
- [x] Docker Compose infrastructure exists and now includes Prometheus + Grafana
- [x] Liquibase schema, JPA entities, repositories, and seed data exist
- [x] Canonical auth routes and stateful refresh-token handling are in place
- [x] Shared `dev/staging/prod` config split exists
- [x] Telegram module now has a dedicated Spring Boot entrypoint
- [x] Workspace skeletons exist for `verifix-jobs-web`, `verifix-jobs-admin`, and `verifix-jobs-ml`
- [~] Unit and integration test baseline has started
- [ ] Full frontend/admin implementations are still pending
- [ ] Full CI/CD and production hardening are still pending

## Phase 1: MVP Core (Weeks 1-10)

### Sprint 1 (Week 1-2): Foundation
- [x] Project structure + Docker Compose
- [x] Liquibase schema (all tables, indexes, seed data)
- [x] JPA entities + repositories
- [x] Spring Security config (JWT + OTP + roles)
- [x] Global exception handler
- [x] Swagger/OpenAPI config

### Sprint 2 (Week 3-4): Core API
- [~] SMS Gateway (Eskiz + PlayMobile + NotificationRouter)
- [x] Employer auth (register, login, refresh, logout)
- [x] Candidate auth (OTP via SMS/Telegram)
- [x] Vacancy CRUD + status machine
- [~] Vacancy moderation (auto-rules + manual queue)
- [~] GeoService (Nominatim geocoding + PostGIS queries)

### Sprint 3 (Week 5-6): Telegram Bot
- [x] Bot setup + webhook/long-polling config
- [~] Registration wizard (5 steps with Redis state)
- [x] /search command + vacancy card formatting
- [x] Apply callback handler
- [x] /nearby command (location-based search)
- [x] /my_applications command
- [~] Referral code generation + deep-link sharing
- [~] Notification consumer (Kafka -> Telegram/SMS)

### Sprint 4 (Week 7-8): Employer Portal
- [x] Angular project setup (Material + Tailwind + PWA) skeleton
- [ ] Auth module (login, JWT interceptor)
- [ ] Layout (responsive side-nav/bottom-nav)
- [ ] Dashboard (KPI cards + chart)
- [ ] Vacancy list + editor wizard (5 steps)
- [ ] ATS Pipeline (Kanban desktop + swipe mobile)
- [ ] Candidate drawer (profile + map)

### Sprint 5 (Week 9-10): Integration & Polish
- [~] MyID verification (employer + candidate)
- [~] Elasticsearch vacancy indexing + search
- [ ] PWA config (offline, push notifications)
- [x] Telegram Mini App auth baseline
- [~] Basic notification system (Telegram + SMS fallback)
- [~] Testing: unit + integration (Testcontainers)
- [~] Docker build + local deployment test

## Phase 2: Employer Tools & Growth (Weeks 11-18)

### Sprint 6 (Week 11-12): Monetization
- [x] Subscription tiers (FREE/STANDARD/PREMIUM) baseline
- [~] Click.uz payment integration
- [~] Payme.uz payment integration
- [ ] Billing dashboard in employer portal

### Sprint 7 (Week 13-14): Referrals & Geo
- [~] Referral system (candidate + employer referrals)
- [~] Referral reward engine + anti-fraud
- [~] Geolocation search (/nearby, map view)
- [ ] Distance badges on vacancy cards
- [x] Referral leaderboard in Mini App/API baseline

### Sprint 8 (Week 15-16): Engagement
- [x] Telegram channel autoposting (@verifixjobs) baseline
- [x] Daily/weekly digest for candidates baseline
- [ ] ATS advanced (interview scheduling, notes)
- [x] Employer branding pages baseline
- [x] Analytics dashboard backend baseline

### Sprint 9 (Week 17-18): Scale
- [x] Candidate database search (for employers) baseline
- [x] Bulk operations (invite, reject, import) baseline
- [~] hh.uz vacancy import (CSV)
- [ ] Employer Telegram bot (notifications)
- [~] SEO: Angular Universal SSR + JSON-LD + sitemap

## Phase 3: Gov & Ecosystem (Weeks 19-26)

### Sprint 10 (Week 19-20): Admin Panel
- [x] Admin Angular project setup skeleton
- [ ] Moderation queue UI
- [ ] User management
- [ ] System config editor
- [ ] Audit log viewer

### Sprint 11 (Week 21-22): Government
- [~] ARGOS/ENST integration (bidirectional sync)
- [~] ish.mehnat.uz sync
- [x] Gov reporting (employment stats, salary analytics) baseline
- [ ] Multi-language support (4 languages)

### Sprint 12 (Week 23-24): Verifix Bridge
- [~] Verifix HRM bridge (HIRED -> create employee)
- [ ] SSO between Verifix HRM and Verifix Jobs
- [ ] Employee referral program (pull from HRM)
- [ ] Legal documents in platform (ToS, Privacy, Consent)

### Sprint 13 (Week 25-26): Compliance & Regional
- [x] Consent management system baseline
- [x] Data export / account deletion baseline
- [ ] Regional expansion config (KZ, KG, TJ)
- [ ] Currency support
- [ ] Load testing (Gatling)

## Phase 4: AI/ML (Weeks 27-36)

### Sprint 14-15 (Week 27-30): ML Foundation
- [x] Python FastAPI microservice setup skeleton
- [ ] gRPC interface to Spring Boot
- [ ] Training pipeline (PostgreSQL -> features -> CatBoost)
- [x] Smart matching (candidate <-> vacancy) rules baseline
- [ ] Profile scoring + gamification

### Sprint 16-17 (Week 31-34): Intelligence
- [x] Salary prediction model baseline
- [x] Churn prediction baseline
- [x] Fraud detection baseline
- [ ] Smart notification timing

### Sprint 18 (Week 35-36): AI Chatbot
- [ ] Claude API integration
- [x] Conversational job search in Telegram baseline
- [x] A/B testing framework baseline
- [ ] Model monitoring (MLflow)
