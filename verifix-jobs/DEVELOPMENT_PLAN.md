# Verifix Jobs — Development Plan

## Phase 1: MVP Core (Weeks 1-10)

### Sprint 1 (Week 1-2): Foundation
- [ ] Project structure + Docker Compose
- [ ] Liquibase schema (all tables, indexes, seed data)
- [ ] JPA entities + repositories
- [ ] Spring Security config (JWT + OTP + roles)
- [ ] Global exception handler
- [ ] Swagger/OpenAPI config

### Sprint 2 (Week 3-4): Core API
- [ ] SMS Gateway (Eskiz + PlayMobile + NotificationRouter)
- [ ] Employer auth (register, login, refresh, logout)
- [ ] Candidate auth (OTP via SMS/Telegram)
- [ ] Vacancy CRUD + status machine
- [ ] Vacancy moderation (auto-rules + manual queue)
- [ ] GeoService (Nominatim geocoding + PostGIS queries)

### Sprint 3 (Week 5-6): Telegram Bot
- [ ] Bot setup + webhook/long-polling config
- [ ] Registration wizard (5 steps with Redis state)
- [ ] /search command + vacancy card formatting
- [ ] Apply callback handler
- [ ] /nearby command (location-based search)
- [ ] /my_applications command
- [ ] Referral code generation + deep-link sharing
- [ ] Notification consumer (Kafka → Telegram/SMS)

### Sprint 4 (Week 7-8): Employer Portal
- [ ] Angular project setup (Material + Tailwind + PWA)
- [ ] Auth module (login, JWT interceptor)
- [ ] Layout (responsive side-nav/bottom-nav)
- [ ] Dashboard (KPI cards + chart)
- [ ] Vacancy list + editor wizard (5 steps)
- [ ] ATS Pipeline (Kanban desktop + swipe mobile)
- [ ] Candidate drawer (profile + map)

### Sprint 5 (Week 9-10): Integration & Polish
- [ ] MyID verification (employer + candidate)
- [ ] Elasticsearch vacancy indexing + search
- [ ] PWA config (offline, push notifications)
- [ ] Telegram Mini App (swipe cards, map, profile editor)
- [ ] Basic notification system (Telegram + SMS fallback)
- [ ] Testing: unit + integration (Testcontainers)
- [ ] Docker build + local deployment test

## Phase 2: Employer Tools & Growth (Weeks 11-18)

### Sprint 6 (Week 11-12): Monetization
- [ ] Subscription tiers (FREE/STANDARD/PREMIUM)
- [ ] Click.uz payment integration
- [ ] Payme.uz payment integration
- [ ] Billing dashboard in employer portal

### Sprint 7 (Week 13-14): Referrals & Geo
- [ ] Referral system (candidate + employer referrals)
- [ ] Referral reward engine + anti-fraud
- [ ] Geolocation search (/nearby, map view)
- [ ] Distance badges on vacancy cards
- [ ] Referral leaderboard in Mini App

### Sprint 8 (Week 15-16): Engagement
- [ ] Telegram channel autoposting (@verifixjobs)
- [ ] Daily/weekly digest for candidates
- [ ] ATS advanced (interview scheduling, notes)
- [ ] Employer branding pages
- [ ] Analytics dashboard

### Sprint 9 (Week 17-18): Scale
- [ ] Candidate database search (for employers)
- [ ] Bulk operations (invite, reject, import)
- [ ] hh.uz vacancy import (CSV)
- [ ] Employer Telegram bot (notifications)
- [ ] SEO: Angular Universal SSR + JSON-LD + sitemap

## Phase 3: Gov & Ecosystem (Weeks 19-26)

### Sprint 10 (Week 19-20): Admin Panel
- [ ] Admin Angular project setup
- [ ] Moderation queue UI
- [ ] User management
- [ ] System config editor
- [ ] Audit log viewer

### Sprint 11 (Week 21-22): Government
- [ ] ARGOS/ENST integration (bidirectional sync)
- [ ] ish.mehnat.uz sync
- [ ] Gov reporting (employment stats, salary analytics)
- [ ] Multi-language support (4 languages)

### Sprint 12 (Week 23-24): Verifix Bridge
- [ ] Verifix HRM bridge (HIRED → create employee)
- [ ] SSO between Verifix HRM and Verifix Jobs
- [ ] Employee referral program (pull from HRM)
- [ ] Legal documents in platform (ToS, Privacy, Consent)

### Sprint 13 (Week 25-26): Compliance & Regional
- [ ] Consent management system
- [ ] Data export / account deletion
- [ ] Regional expansion config (KZ, KG, TJ)
- [ ] Currency support
- [ ] Load testing (Gatling)

## Phase 4: AI/ML (Weeks 27-36)

### Sprint 14-15 (Week 27-30): ML Foundation
- [ ] Python FastAPI microservice setup
- [ ] gRPC interface to Spring Boot
- [ ] Training pipeline (PostgreSQL → features → CatBoost)
- [ ] Smart matching (candidate ↔ vacancy)
- [ ] Profile scoring + gamification

### Sprint 16-17 (Week 31-34): Intelligence
- [ ] Salary prediction model
- [ ] Churn prediction
- [ ] Fraud detection
- [ ] Smart notification timing

### Sprint 18 (Week 35-36): AI Chatbot
- [ ] Claude API integration
- [ ] Conversational job search in Telegram
- [ ] A/B testing framework
- [ ] Model monitoring (MLflow)
