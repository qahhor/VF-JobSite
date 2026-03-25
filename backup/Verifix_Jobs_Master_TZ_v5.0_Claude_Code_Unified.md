# Verifix Jobs - Master Technical Specification v5.0
## Unified Product Spec, Delivery Roadmap And Claude Code Prompt Pack

> Дата: 24.03.2026
> Версия: 5.0
> Статус: Canonical working master document
> Назначение: единый файл-источник для продукта, архитектуры, roadmap и prompt-driven реализации в Claude Code

---

# 1. Назначение документа

Этот документ объединяет в один canonical source:

- исходные ТЗ `v1.0`, `v2.0 Complete`, `v2.1 Appendix`;
- `Employer Branding TZ`;
- `Claude Code Master Prompt`;
- `CLAUDE.md` с фактическим состоянием репозитория;
- конкурентные улучшения из аудитов:
  - `GetAvery`;
  - `HeadHunter`;
  - `IshGO`.

Документ нужен для того, чтобы:

- убрать конфликтующие версии требований;
- зафиксировать единое направление развития `VF-JobSite`;
- превратить разрозненные ТЗ и промпты в один рабочий master-file;
- дать готовый набор промптов для `Claude Code`, который будет работать от текущего репозитория, а не от воображаемого greenfield.

---

# 2. Приоритет источников и правила разрешения конфликтов

## 2.1 Source of Truth Order

При конфликте документов использовать следующий порядок:

1. текущий код и фактическая структура репозитория `verifix-jobs`;
2. `CLAUDE.md` как сводка фактического состояния проекта;
3. `Verifix_Jobs_TZ_v2.0_Complete.docx`;
4. `Verifix_Jobs_TZ_v2.1_Appendix.docx`;
5. `Verifix_Jobs_Employer_Branding_TZ.docx`;
6. `Verifix_Jobs_Technical_Specification_v1.0.docx`;
7. `CLAUDE_CODE_MASTER_PROMPT.md`;
8. улучшения из конкурентных аудитов `v4.0-v4.5`.

## 2.2 Canonical decisions

Для финального master-spec считать canonical следующие решения:

- проект развивается не как greenfield, а как continuation существующего репозитория;
- технологический baseline не нужно откатывать на более старые версии из ранних промптов;
- если в репозитории уже используется более новая и совместимая версия зависимости, она сохраняется;
- текущий backend и employer-side foundation считаются существующими активами, их не нужно переписывать без причины;
- geography scope на первом этапе:
  - `Uzbekistan` как launch market;
  - затем `Kazakhstan`, `Kyrgyzstan`, `Tajikistan`;
  - `Mongolia` не входит в обязательный core scope данного master-документа;
- candidate experience должен оставаться:
  - `Telegram-first`;
  - `phone-first`;
  - `mobile-first`;
  - `blue-collar-first`.

## 2.3 Product model

Правильная модель продукта:

- `public job marketplace` для кандидата;
- `mass-hiring operating system` для работодателя;
- `closed-loop hiring bridge` в Verifix HRM;
- `AI-assisted hiring layer` поверх core-процесса.

---

# 3. Текущее состояние проекта

## 3.1 Что уже есть по факту

По текущему репозиторию и `CLAUDE.md` в проекте уже есть:

- multi-module Maven backend;
- domain model с десятками сущностей и Liquibase;
- auth, vacancies, applications, moderation, notifications, geo, referral, compliance;
- integrations:
  - SMS;
  - payments;
  - MyID;
  - gov;
  - geo;
  - HRM bridge;
- Telegram bot / mini app foundation;
- Angular employer web foundation;
- billing, branding, analytics, candidate search, bulk ops;
- ML baselines:
  - matching;
  - salary prediction;
  - fraud detection;
  - notification optimizer.

## 3.2 Что остается главным product gap

Относительно полного целевого продукта сейчас сильнее всего не хватает:

- сильного public candidate marketplace слоя уровня `IshGO`;
- employer operations слоя уровня `HeadHunter`;
- employer intelligence / AI workflow слоя уровня `GetAvery`;
- единого canonical roadmap, который учитывает и старые ТЗ, и фактический код.

---

# 4. Продуктовое видение

## 4.1 Что такое Verifix Jobs

`Verifix Jobs` - это платформа массового найма blue-collar и frontline-персонала в Центральной Азии, встроенная в экосистему `Verifix HRM`.

Платформа должна закрывать полный контур:

- discovery вакансии;
- отклик;
- screening / verification;
- hiring;
- onboarding в HRM;
- учет и payroll downstream.

## 4.2 Целевые аудитории

### Работодатели

- retail;
- HoReCa;
- manufacturing;
- logistics;
- construction;
- FMCG;
- сервисные сети;
- компании от 30 до 5000 сотрудников.

### Кандидаты

- blue-collar / frontline workers;
- 18-45;
- часто без классического resume;
- основной девайс - бюджетный Android;
- каналы:
  - Telegram;
  - SMS fallback;
  - web;
  - Mini App.

## 4.3 Ключевые дифференциаторы

- Telegram-native candidate UX;
- closed-loop with Verifix HRM;
- MyID / KYC / verified trust;
- geolocation / nearby jobs / branch hiring;
- gov integrations;
- referral engine;
- employer intelligence + automation;
- Central Asia localization.

---

# 5. Canonical product pillars

## 5.1 Pillar A - Public Candidate Marketplace

Источник вдохновения:

- в первую очередь `IshGO`;
- частично `HH`;
- адаптация под Telegram-first flow.

Что входит:

- public vacancy catalog;
- category and city hubs;
- company directory;
- SEO pages;
- map / nearby;
- phone-first auth;
- quick apply;
- favorites / alerts;
- public employer branding.

## 5.2 Pillar B - Employer Mass-Hiring Operating System

Источник вдохновения:

- в первую очередь `HeadHunter`;
- адаптация под mobile-friendly Central Asia use cases.

Что входит:

- operations dashboard;
- vacancy board;
- vacancy health;
- response inbox;
- candidate DB search;
- automation hub;
- storefront;
- entitlements;
- account ops;
- civility score.

## 5.3 Pillar C - Employer Intelligence Layer

Источник вдохновения:

- в первую очередь `GetAvery`.

Что входит:

- hiring intelligence dashboard;
- hiring project;
- talent hub;
- organization memory;
- integration hub;
- value report;
- task inbox;
- activity feed;
- semantic search;
- company / market intelligence.

## 5.4 Pillar D - Commerce And Branding

Источник вдохновения:

- `Employer Branding TZ`;
- `HeadHunter` pricing/storefront logic.

Что входит:

- subscription tiers;
- add-ons;
- branded employer pages;
- branded vacancy templates;
- promotion packages;
- contact credits;
- transparency of usage and expiration.

## 5.5 Pillar E - HRM / Gov / Compliance Backbone

Что входит:

- Verifix HRM bridge;
- gov sync;
- auditability;
- consent;
- export/delete;
- compliance;
- reporting;
- regional rollout.

## 5.6 Pillar F - AI / Automation / Intelligence

Что входит:

- AI-assisted intake;
- AI-assisted sourcing;
- AI screening;
- semantic search;
- market intelligence;
- notification optimization;
- chatbot job search;
- predictive readiness;
- churn / fraud / scoring.

---

# 6. Canonical tech stack

## 6.1 Backend

- Java 21
- Spring Boot 3.5.x baseline allowed
- Spring Security 6
- Spring Data JPA
- Spring WebFlux where async/event streaming is justified
- Liquibase
- Kafka
- Redis
- Elasticsearch

## 6.2 Data and infra

- PostgreSQL 16
- PostGIS
- Redis 7
- Elasticsearch 8.x
- Kafka
- MinIO
- Docker / Docker Compose
- GitHub Actions
- Prometheus / Grafana / ELK

## 6.3 Frontend surfaces

- Angular 17+ employer web
- Angular-based public web / PWA
- Telegram bot
- Telegram Mini App
- Admin web

## 6.4 AI / ML

- Python FastAPI microservice
- CatBoost / XGBoost
- gRPC or stable HTTP/gRPC bridge
- embeddings / semantic search support
- Claude API for conversational and generative layers

## 6.5 Important stack rule

Не делать downgrades только потому, что они были в старом промпте.

Canonical rule:

- preserve newer stable versions already adopted in repo;
- upgrade cautiously;
- no regressions to older prompt-pinned versions without a concrete compatibility reason.

---

# 7. Domain model and core entities

## 7.1 Core entities

Обязательные базовые сущности:

- employer
- manager
- vacancy
- candidate
- work_history
- application
- referral
- notification
- sms_log
- verification_log
- moderation_queue
- geo_city
- payment
- pricing_plan
- consent_log
- gov_sync_log
- ml_candidate_score
- branding entities

## 7.2 Additional entities required by unified roadmap

### Marketplace

- public_vacancy_read_model
- public_company_read_model
- category_landing_snapshot
- city_landing_snapshot
- favorite_vacancy
- saved_search
- branch_apply_option

### Employer operations

- vacancy_health_snapshot
- vacancy_promotion
- vacancy_template
- candidate_contact_credit_usage
- recruiter_workload_snapshot
- employer_task
- activity_event
- civility_score_snapshot

### Intelligence

- hiring_project
- hiring_project_vacancy
- talent_hub_candidate
- talent_list
- organization_memory
- org_memory_fact
- org_connector
- value_report_snapshot
- intelligence_signal

### Automation / AI

- ai_agent_run
- ai_agent_action
- ai_screening_result
- automation_rule
- automation_execution_log
- semantic_embedding_job
- semantic_embedding_candidate

### Branding / commerce

- employer_branding
- branding_cover_image
- branding_gallery
- branding_gallery_image
- branding_benefit
- branding_faq
- branding_analytics
- pricing_entitlement
- account_balance_event

---

# 8. Unified functional scope

# 8.1 Candidate-facing public marketplace

## 8.1.1 Public vacancy catalog

Нужно реализовать:

- search-first list;
- filters;
- sorting;
- list/map switch;
- infinite scroll or efficient pagination;
- SEO-friendly URLs;
- platform trust markers;
- promoted vacancies.

## 8.1.2 Vacancy detail 2.0

Каждая публичная вакансия должна содержать:

- title;
- salary;
- company;
- city/region/address;
- work mode;
- employment type;
- shifts/schedule;
- benefits;
- verification markers;
- branch options;
- apply CTA;
- employer block;
- similar vacancies;
- Telegram continuation CTA.

## 8.1.3 Branch-aware apply

Для сетевых работодателей отклик должен поддерживать:

- branch selection;
- district selection;
- preferred work point;
- geo-aware routing.

## 8.1.4 Company directory

Нужны:

- public company catalog;
- company pages;
- active vacancies;
- branding tiers;
- reviews / trust markers when appropriate.

## 8.1.5 Category / city / geo hubs

Нужны:

- category landing pages;
- city landing pages;
- district landing pages;
- nearby map pages;
- SEO templates.

## 8.1.6 Phone-first auth and quick apply

Нужно:

- OTP login;
- minimal friction;
- deferred profile completion;
- web ↔ Telegram continuity.

## 8.1.7 Favorites, alerts, saved searches

Нужно:

- favorite vacancy;
- save search;
- Telegram/SMS/push alerts;
- digest delivery.

---

# 8.2 Employer operating system

## 8.2.1 Operations dashboard

Должен показывать:

- active vacancies;
- urgent queue;
- new responses;
- recruiter workload;
- entitlements;
- balance and packages;
- quick candidate search;
- quick actions;
- help/content/support rail.

## 8.2.2 Vacancy operations board

Нужна таблица или board с полями:

- status;
- views;
- applies;
- in progress;
- matched candidates;
- expiration;
- promotion;
- automation;
- owner;
- health;
- hiring progress.

## 8.2.3 Vacancy health

Нужна диагностика:

- impressions;
- opens;
- applies;
- conversion;
- time to first response;
- lost candidate signals;
- salary competitiveness;
- geo competitiveness;
- benchmark vs similar vacancies;
- recommended fixes.

## 8.2.4 Response inbox

Нужен mass-hiring workflow:

- triage;
- statuses;
- bulk actions;
- templates;
- notes;
- next step;
- SLA / aging;
- invite / reject / route.

## 8.2.5 Candidate database

Нужен отдельный employer product:

- structured search;
- saved searches;
- auto search;
- favorites;
- shortlist;
- notes;
- contact reveal;
- invite;
- match to vacancy.

## 8.2.6 Automation hub

Нужно:

- auto parse;
- auto screen;
- auto message;
- Telegram bot follow-up;
- SMS fallback;
- ROI / time saved indicators.

## 8.2.7 Vacancy creation wizard 3.0

Нужно:

- structured form;
- quality hints;
- AI drafting;
- hiring plan;
- branch support;
- geo-aware fields;
- anti-discrimination checks;
- content quality scoring.

## 8.2.8 Storefront and entitlements

Нужно:

- publication packages;
- candidate DB access packages;
- contact credits;
- promotion packages;
- branding add-ons;
- remaining balances;
- expiration dates;
- audit trail.

## 8.2.9 Recruiter / account ops

Нужно:

- employer roles;
- branch managers;
- permissions;
- addresses;
- documents;
- audit logs;
- usage visibility.

## 8.2.10 Civility score

Нужно:

- response rate;
- response time;
- ignored candidate share;
- clean closure of applications;
- employer behavior scoring.

---

# 8.3 Employer intelligence layer

## 8.3.1 Hiring intelligence dashboard

Нужно:

- next best action;
- blockers;
- opportunity alerts;
- live hiring projects;
- value metrics;
- integration status.

## 8.3.2 Hiring project

Нужна сущность выше вакансии:

- hiring project;
- one or many vacancies;
- source inputs:
  - URL;
  - file;
  - template;
  - manual entry.

## 8.3.3 Talent hub

Нужно:

- reusable candidate pool;
- cross-vacancy reuse;
- talent lists;
- candidate tagging;
- export into hiring flows.

## 8.3.4 Organization memory

Нужно хранить:

- EVP;
- branch context;
- preferred traits;
- rejection patterns;
- employer-specific heuristics;
- hiring policies.

## 8.3.5 Power centre / integration hub

Нужно показывать:

- maturity level;
- connected integrations;
- recommended next integrations;
- unlocked functionality;
- adoption progress.

## 8.3.6 Value / ROI report

Нужно показывать:

- hires;
- time saved;
- money saved;
- activation progress;
- traffic/value at scale;
- projection.

## 8.3.7 Task inbox

Нужно:

- prioritized tasks;
- due dates;
- urgency;
- AI-generated to-dos;
- snooze / dismiss / done.

## 8.3.8 Activity feed

Нужно:

- live activity events;
- read/unread;
- history;
- entity deep links;
- employer-level and recruiter-level views.

## 8.3.9 Semantic search and market intelligence

Нужно:

- semantic candidate search;
- semantic vacancy search;
- multilingual retrieval;
- salary intelligence;
- competition signals;
- supply heatmaps.

---

# 8.4 Branding, SEO, growth and distribution

## 8.4.1 Employer branding tiers

Canonical model:

- Basic
- Branded
- Premium Branding

## 8.4.2 Branding capabilities

Нужно:

- custom slug;
- custom colors;
- cover / gallery;
- benefits section;
- FAQ;
- office map;
- social links;
- video blocks;
- employee stories;
- branded vacancy cards;
- analytics.

## 8.4.3 SEO and discovery

Нужно:

- SSR or equivalent indexable rendering;
- sitemap;
- JSON-LD JobPosting;
- company schema;
- hreflang;
- category pages;
- city pages;
- canonical URLs;
- performance budgets.

## 8.4.4 Telegram channel autoposting

Нужно:

- channel posting service;
- city/category channels;
- deduplication;
- smart scheduling;
- rate limiting;
- deep links back to product.

## 8.4.5 Referral loops

Нужно:

- referral deep links;
- track invited → registered → applied → hired;
- reward logic;
- anti-fraud;
- employer and candidate referral programs.

---

# 8.5 HRM, Gov, Compliance and regionalization

## 8.5.1 HRM bridge

Нужно поддерживать:

- HIRED → create employee;
- SSO / continuity;
- referral sync;
- downstream status sync.

## 8.5.2 Government integrations

Нужно:

- ARGOS/ENST;
- ish.mehnat.uz;
- reporting;
- idempotent sync;
- audit trail.

## 8.5.3 Compliance

Нужно:

- consent management;
- export;
- deletion;
- privacy controls;
- role-based disclosure;
- data minimization.

## 8.5.4 Regional rollout

Нужно поддержать:

- multi-country config;
- currency;
- language packs;
- localization layers.

---

# 8.6 AI and automation scope

## 8.6.1 AI intake

Нужно:

- parse vacancy context;
- suggest salary;
- suggest edits;
- detect weak descriptions;
- pre-moderation risk hints.

## 8.6.2 AI sourcing

Нужно:

- build shortlists;
- justify ranking;
- support employer approval.

## 8.6.3 AI outreach

Нужно:

- generate personalized messages;
- support Telegram and SMS;
- batch sending;
- human review option.

## 8.6.4 AI screening

Нужно:

- candidate Q&A;
- readiness screening;
- structured result;
- needs review path.

## 8.6.5 Conversational job search

Нужно:

- natural language search in Telegram;
- parse profession + salary + location + schedule;
- return cards + map + nearby.

## 8.6.6 Predictive intelligence

Нужно:

- vacancy closure probability;
- lost candidate risk;
- churn risk;
- optimal outreach timing;
- fraud risk.

---

# 9. UI/UX principles

## 9.1 Candidate-side principles

- mobile-first;
- low-bandwidth-first;
- no long resume-first friction;
- salary, location and schedule above the fold;
- one dominant CTA;
- Telegram continuity;
- fast apply;
- simple trust signals.

## 9.2 Employer-side principles

- action-oriented, not decorative;
- dense when needed, but not chaotic;
- progressive disclosure;
- strong table/board ergonomics;
- visible urgency;
- visible monetization only in context;
- mobile-safe mode for branch managers.

## 9.3 Marketplace principles

- public pages indexable;
- market liquidity visible;
- verified signals visible;
- company and vacancy pages should look trustworthy;
- map mode and nearby must feel natural, not secondary.

## 9.4 Design rule

Не копировать визуальную тяжесть `HH` и не копировать AI-sterility `Avery`.

Итоговый интерфейс должен быть:

- clearer than `HH`;
- more practical than `IshGO`;
- more local and mobile-native than `Avery`.

---

# 10. Non-functional requirements

## 10.1 Performance

Target baselines:

- public LCP < 2.5 s on 4G;
- vacancy board open < 2 s;
- recruiter filters < 300 ms perceived response;
- SSE / live updates stable under load;
- search latency low enough for typeahead / quick filtering.

## 10.2 Security

Нужно обеспечить:

- JWT + refresh security;
- OTP anti-abuse;
- RBAC;
- tenant isolation;
- audit logs;
- safe contact reveal;
- rate limiting;
- bot protection;
- data minimization for KYC and verification logs.

## 10.3 Scalability

Нужно проектировать отдельные read-models и bounded contexts для:

- public marketplace;
- employer operations;
- intelligence;
- billing/entitlements;
- notifications/automation;
- analytics.

## 10.4 Observability

Нужно:

- Prometheus / Grafana metrics;
- structured logs;
- business funnel events;
- alerting on failed integrations;
- monitoring for batch/async pipelines.

---

# 11. Unified roadmap

## Wave 0 - Canonical alignment and stabilization

Цель:

- выровнять README, env, configs, docs и source-of-truth;
- зафиксировать текущую архитектуру;
- убрать drift между prompt и repo.

## Wave 1 - Public marketplace and candidate acquisition

Источник:

- в первую очередь `IshGO`;
- SEO appendix `v2.1`.

Входит:

- public vacancy catalog;
- vacancy detail 2.0;
- company directory;
- city/category pages;
- map/nearby;
- phone-first auth;
- favorites/alerts;
- SSR/SEO;
- Telegram continuation.

## Wave 2 - Employer operations and performance

Источник:

- в первую очередь `HeadHunter`.

Входит:

- operations dashboard;
- vacancy board;
- vacancy health;
- response inbox;
- candidate DB search 2.0;
- recruiter/account ops;
- civility score.

## Wave 3 - Automation and AI-assisted hiring

Источник:

- `HeadHunter automation`;
- `GetAvery`.

Входит:

- automation hub;
- AI intake;
- AI sourcing;
- AI outreach;
- AI screening;
- task inbox;
- activity feed.

## Wave 4 - Employer intelligence and reusable talent layer

Источник:

- `GetAvery`.

Входит:

- hiring project;
- talent hub;
- organization memory;
- integration hub;
- value report;
- semantic search;
- market intelligence.

## Wave 5 - Commerce, branding, growth

Источник:

- `Employer Branding TZ`;
- `HH storefront`;
- `IshGO public company strength`.

Входит:

- branding tiers;
- branded company pages;
- storefront;
- entitlements;
- promotion packages;
- referral growth;
- channel autoposting.

## Wave 6 - Gov, HRM, regional scale

Входит:

- deeper HRM bridge;
- gov sync hardening;
- compliance;
- multi-country rollout;
- legal layers;
- reporting.

## Wave 7 - Predictive and ML differentiation

Входит:

- smarter matching;
- salary intelligence;
- churn;
- fraud;
- optimization;
- conversational AI at scale.

---

# 12. KPI framework

## 12.1 Candidate marketplace KPIs

- organic traffic growth;
- visit → vacancy detail;
- detail → apply start;
- apply start → apply complete;
- favorites/alerts retention;
- geo-based applications share.

## 12.2 Employer operating KPIs

- employer WAU;
- login → useful action;
- publish → first contact;
- time to first response;
- backlog aging;
- share of processed responses;
- vacancy health improvement adoption.

## 12.3 Commerce KPIs

- attach rate of paid products;
- branding adoption;
- promotion adoption;
- candidate DB usage;
- entitlement utilization;
- expansion revenue.

## 12.4 Intelligence KPIs

- task inbox engagement;
- automation adoption;
- talent hub reuse rate;
- semantic search usage;
- value report consumption;
- AI-assisted flow completion.

---

# 13. Canonical implementation rules for Claude Code

## 13.1 Work from existing repo

Claude Code must:

- treat `verifix-jobs` as the active implementation baseline;
- inspect existing code before changing architecture;
- preserve compatible current module structure;
- avoid greenfield assumptions.

## 13.2 Preserve stronger current choices

Claude Code must not:

- downgrade Spring Boot or major dependencies without necessity;
- rewrite implemented modules just to match an old prompt;
- remove valid current features because they were absent in older specs.

## 13.3 Delivery style

Claude Code should:

- implement in waves;
- ship vertical slices;
- include tests when feasible;
- update docs when contracts change;
- prefer incremental improvements over massive rewrites.

## 13.4 Product adaptation rule

When importing competitor ideas:

- copy the principle;
- adapt the UX and logic to blue-collar Central Asia context;
- do not copy enterprise-heavy complexity blindly.

---

# 14. Claude Code Prompt Pack

Ниже — готовые prompts, которые можно вставлять в `Claude Code`. Они написаны так, чтобы агент работал от текущего репозитория и не ломал уже существующую архитектуру.

---

## Prompt 0 - Canonical Repo Audit And Alignment

```text
You are working on the existing Verifix Jobs repository, not a greenfield project.

Context:
- Product: Verifix Jobs, a mass-hiring platform for blue-collar workers in Central Asia.
- The current repository already contains a substantial backend, employer web foundation, integrations, Telegram, branding, analytics, billing, and ML baselines.
- Your job is to align the repo with the canonical master spec, not to recreate it from scratch.

Critical rules:
- Inspect the existing codebase first.
- Preserve current compatible architecture and newer dependency versions already adopted in the repo.
- Do not downgrade frameworks only because older prompts mention older versions.
- Treat the repo as the source of truth, then reconcile against the master spec.

Tasks:
1. Audit the repository structure, active modules, configs, missing pieces, and drift against the master spec.
2. Produce a gap report grouped by:
   - public marketplace
   - employer operations
   - intelligence / AI
   - branding / commerce
   - gov / HRM / compliance
   - testing / CI / observability
3. For each gap, classify:
   - already implemented
   - partially implemented
   - missing
   - implemented but inconsistent with canonical contract
4. Produce an implementation order with P0/P1/P2 priorities.
5. Then begin the highest-value P0 slice immediately.

Output requirements:
- Update docs if source-of-truth drift is discovered.
- Keep answers concrete and repository-aware.
- Prefer direct implementation over theory.
```

---

## Prompt 1 - Public Marketplace Wave

```text
Implement Wave 1 for the existing Verifix Jobs repository.

Goal:
Build the public candidate marketplace layer on top of the existing platform.

Required scope:
- Public vacancy catalog
- Vacancy detail 2.0
- Public company directory and company pages
- Category and city landing pages
- Map / nearby mode
- Phone-first candidate auth and quick apply
- Favorites and saved searches
- Telegram continuation from public web
- SEO foundations: SSR-ready routing, sitemap, JSON-LD, canonical pages

Business constraints:
- Blue-collar and frontline hiring in Uzbekistan first
- Mobile-first, budget Android, unstable networks
- Telegram is primary channel, web is discovery and conversion layer

Implementation rules:
- Reuse existing vacancy, candidate, geo, notification, branding, and search modules where possible
- Do not fork a parallel architecture if current modules can be extended
- Make public read-models or projections where necessary
- Add tests for public search, apply flow, and SEO-critical endpoints where feasible

Required deliverables:
1. Backend endpoints and read-models for public vacancies, companies, categories, and geo views
2. Frontend public web scaffolding and routes
3. Branch-aware apply flow for multi-location employers
4. Favorites / alerts persistence and delivery
5. SEO and sitemap baseline

Start by auditing what already exists, then implement the smallest end-to-end vertical slice:
- public vacancy list
- vacancy detail
- apply action
```

---

## Prompt 2 - Employer Operations Wave

```text
Implement the employer operations layer for Verifix Jobs based on the canonical master spec.

Goal:
Turn the current employer web from a basic cabinet into a mass-hiring operating system.

Required scope:
- Operations dashboard
- Vacancy operations board
- Vacancy health
- Response inbox / mass-hiring workflow
- Candidate database search 2.0
- Recruiter and account operations
- Civility score

Key product principle:
Do not blindly copy HeadHunter density. Keep the workflows powerful but cleaner, faster, and better adapted to Central Asia and mobile branch-manager use cases.

Implementation details:
- Reuse existing dashboard, vacancy list, vacancy detail, pipeline, analytics, billing, and candidate search modules
- Extend them instead of rewriting everything
- Add missing entities and projections where needed:
  - vacancy_health_snapshot
  - recruiter_workload_snapshot
  - candidate_contact_credit_usage
  - civility_score_snapshot
- Add API contracts for health, workload, queue summaries, and operational filters

Required outputs:
1. Updated employer dashboard with action-oriented sections
2. Performance-centric vacancy board
3. Diagnostic vacancy health screen
4. Response inbox with triage and bulk actions
5. Candidate database search with shortlist and saved filters
6. Account-role and manager-aware operations support

Begin with:
- dashboard
- vacancy board
- vacancy health
Then continue into response inbox and candidate DB.
```

---

## Prompt 3 - Automation And AI Hiring Wave

```text
Implement the automation and AI-assisted hiring layer for Verifix Jobs.

Goal:
Add visible, controllable, employer-facing automation for high-volume hiring.

Required scope:
- Automation hub
- AI intake assistant for vacancy creation
- AI sourcing assistant for shortlist generation
- AI outreach for Telegram/SMS messaging
- AI screening for structured candidate Q&A
- Task inbox
- Activity feed

Constraints:
- Keep human-in-the-loop controls
- Automation must be explainable and reversible
- Telegram and SMS are primary channels, not email-first assumptions
- Candidate UX must stay lightweight and suitable for blue-collar flows

Technical guidance:
- Reuse current ML services and notification infrastructure where possible
- Introduce new entities only where required:
  - ai_agent_run
  - ai_agent_action
  - ai_screening_result
  - employer_task
  - activity_event
  - automation_rule
  - automation_execution_log
- Add event-driven processing where appropriate

Implementation order:
1. Task inbox and activity feed
2. Automation hub UI and rules model
3. AI intake assistant
4. AI outreach and screening
5. AI sourcing and orchestration

Focus on a production-ready architecture, not mock AI buttons.
```

---

## Prompt 4 - Employer Intelligence Wave

```text
Implement the employer intelligence layer for Verifix Jobs.

Goal:
Move beyond ATS screens into hiring intelligence and reusable talent memory.

Required scope:
- Hiring Intelligence Dashboard
- Hiring Project
- Talent Hub
- Organization Memory
- Power Centre / Integration Hub
- Value / ROI Report
- Semantic Search
- Company / Market Intelligence

Critical product rule:
This is inspired by Avery, but must be adapted for Verifix Jobs:
- mass-hiring context
- blue-collar roles
- Telegram-first channel logic
- Central Asia localization

Technical scope:
- Introduce domain entities and read-models where necessary:
  - hiring_project
  - hiring_project_vacancy
  - talent_hub_candidate
  - talent_list
  - organization_memory
  - org_memory_fact
  - org_connector
  - value_report_snapshot
  - intelligence_signal
  - semantic embeddings
- Reuse existing candidate search, ML, analytics, and employer modules

Delivery order:
1. Hiring project
2. Talent hub
3. Organization memory
4. Intelligence dashboard
5. Power centre
6. ROI report
7. Semantic search and intelligence signals

Do not build fake intelligence. Every screen must be backed by real data sources or clearly defined computed signals.
```

---

## Prompt 5 - Branding, Storefront And Growth Wave

```text
Implement the branding, storefront, and growth layer for Verifix Jobs.

Goal:
Productize employer brand, promotion, packaging, and marketplace growth.

Required scope:
- Branding tiers: Basic / Branded / Premium Branding
- Branded public company pages
- Branded vacancy templates
- Branding builder and analytics
- Commerce storefront for packages and add-ons
- Entitlement accounting and expiration visibility
- Promotion packages and featured vacancy logic
- Telegram channel autoposting
- Referral growth loops

Business constraints:
- Branding is a premium monetization feature
- Commerce must be understandable to SMB and scalable to larger employers
- Promotion and branding should be measurable

Technical guidance:
- Reuse existing branding, billing, payment, analytics, and notification modules
- Extend existing payment gateways
- Add missing projections for commercial visibility and usage
- Keep package accounting explicit and auditable

Start with:
1. entitlement visibility and storefront cleanup
2. premium branding public surfaces
3. promotion package mechanics
4. autoposting and referral growth add-ons
```

---

## Prompt 6 - Gov, HRM, Compliance And Regional Scale Wave

```text
Implement the ecosystem and regulatory layer for Verifix Jobs.

Goal:
Harden Verifix Jobs as a platform connected to HRM, government systems, compliance, and regional rollout needs.

Required scope:
- Verifix HRM bridge hardening
- Gov sync reliability and auditability
- Consent management
- Data export and deletion
- Legal document surfaces
- Regional configuration
- Currency and language scaling
- Reporting and compliance diagnostics

Rules:
- Preserve idempotency and traceability for all external sync flows
- Store only minimal sensitive data where possible
- Every external sync must have audit logs, retry logic, and failure visibility

Deliver in this order:
1. auditability and sync hardening
2. compliance flows
3. regional config scaffolding
4. legal/document integration
```

---

## Prompt 7 - QA, Security And Release Readiness

```text
Perform a production-readiness implementation pass for Verifix Jobs.

Goal:
Close the final gaps in testing, security, observability, and release readiness.

Required scope:
- Unit tests for core services
- Integration tests with Testcontainers where feasible
- Security tests for auth, OTP abuse, tenant isolation, and contact reveal
- Marketplace funnel analytics event validation
- Liquibase validation
- CI/CD build and test pipeline
- Monitoring and health endpoints
- Documentation updates for actual runtime and deployment

Rules:
- Focus on real risks and real regressions
- Do not add placeholder tests that assert nothing meaningful
- Cover public marketplace, employer operations, and integration boundaries

Output:
1. failing risks list
2. fixes
3. updated tests
4. release checklist
```

---

## Prompt 8 - Final Consolidation And Architectural Review

```text
Do a final architectural and product consistency review for Verifix Jobs after the implementation waves.

Review scope:
- Does the repo now match the canonical master spec?
- Are marketplace, employer operations, intelligence, commerce, and ecosystem layers coherent?
- Are there duplicate concepts or parallel architectures that should be unified?
- Are the public API, UI routes, background jobs, and event models aligned?
- Are current docs accurate?

Required output:
- findings ordered by severity
- missing tests or risk areas
- technical debt that should be scheduled
- concise change summary

Default review stance:
prioritize bugs, regressions, security issues, operational gaps, and product incoherence over style commentary.
```

---

# 15. Recommended operational usage of this file

Используйте этот документ так:

1. Сначала вставляйте `Prompt 0` в Claude Code.
2. После аудита выбирайте одну wave-последовательность:
   - marketplace
   - employer ops
   - automation/AI
   - intelligence
   - branding/commerce
   - gov/compliance
3. После каждого крупного этапа запускайте `Prompt 7`.
4. После нескольких волн запускайте `Prompt 8`.

---

# 16. Final canonical conclusion

`Verifix Jobs` не должен становиться копией ни `IshGO`, ни `HeadHunter`, ни `GetAvery`.

Правильная итоговая форма продукта:

- `IshGO`-уровень public marketplace и local candidate discovery;
- `HeadHunter`-уровень employer operations и monetization rigor;
- `GetAvery`-уровень employer intelligence и AI-assisted hiring;
- плюс ваши собственные преимущества:
  - Telegram-first;
  - MyID;
  - geolocation;
  - HRM bridge;
  - gov integrations;
  - Central Asia localization.

Именно эта комбинация и является canonical target state для `Verifix Jobs`.
