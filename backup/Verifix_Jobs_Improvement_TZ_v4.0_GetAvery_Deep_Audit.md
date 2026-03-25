# Verifix Jobs — ТЗ на улучшение v4.0
## На основе глубокого аудита VF-JobSite + конкурентного анализа GetAvery

> Дата: 24.03.2026
> Версия: 4.0
> Статус: supersedes `Verifix_Jobs_Improvement_TZ_v3.0.md`
> Основание: фактический аудит репозитория `verifix-jobs`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы Avery и просмотр авторизованного продукта Avery в Google Chrome

---

## 1. Цель документа

Этот документ фиксирует:

- текущее реальное состояние проекта `VF-JobSite`;
- разрыв между текущей реализацией и ТЗ `v2.0/v2.1`;
- продуктовые и UX-практики, подсмотренные у `GetAvery`;
- адаптированное ТЗ для улучшения `Verifix Jobs` без потери нашего core-differentiator: `Telegram + mass hiring + geo + HRM/gov integrations`.

Ключевой принцип:

- `Verifix Jobs` не должен копировать Avery буквально.
- Он должен заимствовать сильные employer-side паттерны Avery и адаптировать их под blue-collar рынок Центральной Азии.

---

## 2. Что изучено

### 2.1 Внутренние источники

- `Verifix_Jobs_TZ_v2.0_Complete.docx`
- `Verifix_Jobs_TZ_v2.1_Appendix.docx`
- текущий репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- текущий draft `Verifix_Jobs_Improvement_TZ_v3.0.md`

### 2.2 Что изучено по GetAvery

Публичные источники:

- [Avery Home](https://www.getavery.ai/)
- [Avery Changelog](https://www.getavery.ai/changelog)
- [Avery Blog](https://www.getavery.ai/blog)
- [Avery Privacy Policy](https://www.getavery.ai/privacy-policy)

Авторизованный продукт в Google Chrome:

- `https://app.getavery.ai/dashboard`
- `https://app.getavery.ai/dashboard/talent-hub`
- `https://app.getavery.ai/dashboard/power-centre`
- `https://app.getavery.ai/dashboard/easy-pilot/report`
- `https://app.getavery.ai/dashboard/organization/details`
- `https://app.getavery.ai/dashboard/organization/manage`
- `https://app.getavery.ai/dashboard/organization/manage/organization-members`
- `https://app.getavery.ai/dashboard/organization/subscription`
- `https://app.getavery.ai/dashboard/organization/clients`
- `https://app.getavery.ai/dashboard/organization/presets`

---

## 3. Фактическое состояние VF-JobSite

## 3.1 Что уже есть в проекте

- Multi-module Maven backend.
- Основные backend-модули: `common`, `domain`, `service`, `api`, `telegram`, `integration`.
- Skeleton-модули: `web`, `admin`, `ml`.
- Liquibase + JPA доменная модель.
- Security baseline: JWT, OTP, MyID routes, stateful refresh tokens, tenant-aware security baseline.
- Telegram bot и Mini App auth baseline.
- Billing/subscription/reporting baselines.
- Branding, referrals, moderation, compliance, gov-reporting, HRM bridge baselines.
- Angular employer/admin приложения уже не пустые папки, а начальные приложения с layout/features.

## 3.2 Что уже выглядит сильной базой

- Очень хороший backend foundation для B2B hiring platform.
- Правильный региональный differentiation:
  - Telegram-first candidate UX
  - SMS fallback
  - MyID / verification
  - PostGIS / nearby jobs
  - HRM bridge
  - gov integrations
- Архитектурно проект уже ближе к platform-product, чем к MVP-лендингу.

## 3.3 Что отсутствует или недоделано относительно реального product pull

Самый большой пробел сейчас не в backend coverage, а в employer product layer:

- нет сильного employer home dashboard с actionable intelligence;
- нет task inbox;
- нет activity feed в реальном времени;
- нет guided hiring-project intake уровня Avery;
- нет organization memory / AI knowledge layer про работодателя;
- нет reusable presets для найма;
- нет полноценного talent hub / reusable candidate pool;
- нет productized ROI/value reporting для работодателя;
- нет удобной integration hub surface;
- нет market/company intelligence продукта для работодателя;
- нет выраженного quick-review режима для ускорения recruiter workflow.

## 3.4 Вывод по текущему состоянию

`VF-JobSite` уже силен как backend-platform, но пока слабее как `employer operating system for hiring`.

Именно в этой части Avery заметно опережает.

---

## 4. Что реально обнаружено у Avery

## 4.1 Dashboard

На `app.getavery.ai/dashboard` обнаружено:

- hiring intelligence dashboard;
- приветственный employer home;
- блок `action items`;
- CTA `Connect ATS`;
- `Company Intelligence` блок в beta;
- блок `Your hiring projects`;
- реферальный блок с invite link/code.

Что важно:

- dashboard у Avery не декоративный;
- он управляет следующими действиями работодателя;
- home screen работает как control tower.

## 4.2 New Hiring Project

На dashboard есть создание нового hiring project.
В модальном окне обнаружено:

- `Paste public URL`
- `Upload document`
- старт workflow по intake

Вывод:

- Avery строит вход в процесс найма не только от ручной формы, а от источника вакансии/JD;
- это резко снижает friction для recruiter/hiring manager.

## 4.3 Talent Hub

На `.../dashboard/talent-hub` обнаружено:

- отдельный talent pool;
- блокировка до накопления shortlist/ATS candidates;
- привязка к hiring projects;
- зависимость от ATS sync и shortlisted candidates.

Вывод:

- Avery отделяет `pipeline candidates` от `organizational talent memory`.

## 4.4 Power Centre / Intelligence Levels

На `.../dashboard/power-centre` обнаружено:

- maturity model:
  - `Basic`
  - `Connected`
  - `Engaged`
  - `Intelligent`
  - `Predictive`
- unlocked features;
- ROI and savings view;
- metrics:
  - people in talent hub
  - time saved
  - great matches found
- connections hub:
  - email
  - calendar
  - ATS
- easy pilot report entrypoint.

Вывод:

- Avery очень хорошо productizes value.
- Пользователь видит не только features, но и progression, adoption и экономический эффект.

## 4.5 Organization Memory

Внутри Power Centre обнаружен `Organization Memory`:

- AI-собранный профиль компании;
- location/team/company facts;
- tech stack;
- key highlights;
- `what we look for`;
- editable knowledge:
  - `Add fact`
  - `Reset memory`

Вывод:

- это один из самых сильных паттернов Avery.
- Система запоминает контекст компании и затем может использовать его для matching, sourcing, outreach, intake и screening.

## 4.6 Easy Pilot Report

На `.../dashboard/easy-pilot/report` обнаружено:

- trial report;
- total value unlocked;
- annual value projection;
- value at scale;
- activity metrics:
  - shortlisted
  - outreach sent
  - hiring intakes
  - uploaded candidates
- milestone model;
- subscription CTA.

Вывод:

- Avery умеет конвертировать AI activity в понятный business case.

## 4.7 Organization Workspace

В блоке organization обнаружено:

- `Details`
- `Manage`
- `Subscription`
- `Clients`
- `Filter Presets`

### Details

- organization name
- preferred language
- website
- linkedin page
- address

### Manage

- general
- members
- leave organization
- delete organization

### Members

- список пользователей
- роли
- invite flow

### Subscription

- current plan
- usage limits
- team members
- AI agents enabled
- ATS included

### Clients

- отдельный client layer для hiring projects

### Filter Presets

- reusable location presets

Вывод:

- Avery строит не только подбор, но и полноценный organization workspace.

## 4.8 Account / Security

В user menu обнаружено:

- manage account
- sign out

В account modal:

- profile
- connected accounts
- email addresses
- phone numbers
- password
- two-step verification
- active devices
- delete account

Вывод:

- security и account management являются first-class частью продукта, а не buried settings.

## 4.9 ATS Connect

В модальном окне подключения ATS обнаружен широкий список провайдеров:

- Workday
- SAP SuccessFactors
- SmartRecruiters
- Lever
- Greenhouse
- Teamtailor
- Recruitee
- Workable
- Fountain
- Ashby
- BambooHR
- Bullhorn
- Personio
- Jobvite
- Pinpoint
- JOIN
- Odoo
- Eightfold
- Loxo
- и другие

Вывод:

- Avery продает себя как integration-native слой поверх существующего hiring stack.

## 4.10 Что подтверждает публичный changelog Avery

По [Avery Changelog](https://www.getavery.ai/changelog) зафиксированы релизы:

- `01 Jan 2026`: guided setup + intake agent.
- `08 Jan 2026`: candidate review screen.
- `15 Jan 2026`: real-time activity feed и PLG pricing.
- `18 Dec 2025`: task inbox.
- `02 Dec 2025`: semantic search.
- `25 Nov 2025`: location presets.
- `18 Nov 2025`: 2-way ATS sync.
- `30 Oct 2025`: market intel report with cited sources.
- `20 Oct 2025`: Ask Avery + market intelligence agent.

Это критично:

- observed Chrome-session и официальный changelog хорошо совпадают;
- значит увиденная нами продуктовая картина не случайна, а системно развиваемая.

---

## 5. Что нужно копировать, адаптировать и не копировать

## 5.1 Копировать почти как есть

- employer action-oriented dashboard;
- task inbox;
- activity feed;
- organization memory;
- power centre / maturity progression;
- value report / ROI report;
- clients layer;
- filter presets;
- integration hub;
- guided hiring project creation.

## 5.2 Адаптировать под Verifix Jobs

- talent hub:
  - у нас нужен не LinkedIn-like sourcing hub, а `telegram/sms/web + hrm/gov candidate pool`;
- outreach:
  - у Avery email-first;
  - у нас должно быть `Telegram -> Push -> SMS`;
- market intelligence:
  - у Avery white-collar market intel;
  - у нас нужен `mass hiring city/category/salary/shift/geo intelligence`;
- ROI:
  - у Avery ROI завязан на agency-fee savings;
  - у нас нужен ROI по:
    - time-to-fill
    - no-show reduction
    - recruiter time saved
    - branch staffing stability
    - hired-to-start conversion

## 5.3 Не копировать напрямую

- LinkedIn/InMail-heavy flows как core сценарий;
- white-collar-first candidate UX;
- video-first screening как default;
- overly complex enterprise ATS-first UX в ущерб Telegram candidate flow;
- EU-only compliance assumptions без адаптации под UZ/Central Asia reality.

---

## 6. Продуктовая стратегия для Verifix Jobs

Новый product thesis:

`Verifix Jobs` должен стать не только job portal, а `Hiring OS for high-volume frontline hiring in Central Asia`.

Две главные оси продукта:

- Candidate OS:
  - Telegram
  - Mini App
  - geo
  - verification
  - referrals
  - onboarding bridge

- Employer Hiring OS:
  - dashboard
  - intake
  - task inbox
  - activity feed
  - talent hub
  - org memory
  - intelligence
  - integrations
  - value analytics

---

## 7. ТЗ на улучшение Verifix Jobs

## 7.1 Epic P0 — Employer Intelligence Dashboard

### Цель

Сделать employer main screen operational, а не informational.

### Функциональность

- Главный dashboard работодателя:
  - active vacancies
  - new applications today
  - candidates awaiting action
  - expiring vacancies
  - pending moderation
  - hires this week
  - time-to-fill trend
- Блок `Action items`:
  - нужно обработать 17 новых откликов
  - по вакансии низкая конверсия
  - вакансия истекает через 2 дня
  - нужно подтвердить интервью
  - нужно подключить Telegram/Push/HRM integration
- Блок `Company Intelligence`:
  - конкуренция за категорию
  - рыночный salary band
  - supply shortage flag
  - suggested actions
- Блок `Referral performance`
- Блок `Notification centre`
- Блок `Quick actions`

### Новые сущности

- `employer_task`
- `activity_event`
- `employer_dashboard_snapshot`
- `company_intelligence_snapshot`

### Backend

- `GET /api/v1/employer/dashboard`
- `GET /api/v1/tasks`
- `PATCH /api/v1/tasks/{id}`
- `GET /api/v1/feed/history`
- `GET /api/v1/feed/stream`

### Frontend

- новый dashboard screen в `verifix-jobs-web`
- mobile-first variant для branch manager
- sticky task rail

---

## 7.2 Epic P0 — Guided Hiring Project + AI Intake

### Цель

Сместить создание вакансии с тяжелой формы на guided intake.

### Функциональность

- Entry points:
  - `Paste public URL`
  - `Upload JD / transcript / doc`
  - `Start from template`
  - `Clone existing vacancy`
- AI intake agent:
  - извлекает title, category, city, salary hints, requirements, shifts, benefits;
  - валидирует описание;
  - предлагает market salary;
  - предсказывает applications volume;
  - предсказывает time-to-fill;
  - предлагает recommended screening questions;
  - переводит/нормализует в RU / UZ / UZ_CYR / EN.
- Hiring Project becomes top-level object above vacancy.

### Новые сущности

- `hiring_project`
- `hiring_intake`
- `hiring_intake_source`
- `intake_validation_result`
- `screening_template`

### Backend

- `POST /api/v1/hiring-projects`
- `POST /api/v1/hiring-projects/intake/url`
- `POST /api/v1/hiring-projects/intake/upload`
- `POST /api/v1/hiring-projects/{id}/generate-vacancy`
- `GET /api/v1/hiring-projects/{id}`

### Встраивание в текущий код

Нужно переиспользовать и расширить:

- `SalaryPredictionService`
- moderation rules
- vacancy wizard
- matching baseline

---

## 7.3 Epic P0 — Talent Hub и reusable candidate pool

### Цель

Отделить `applicants for one vacancy` от `long-term reusable candidate pool`.

### Функциональность

- employer talent hub:
  - shortlisted candidates
  - hidden candidates
  - invited candidates
  - previous applicants
  - imported candidates
  - HRM-alumni/internal referral pool
- cross-project visibility:
  - кандидат уже был shortlisted по другой вакансии
  - кандидат уже работал в HRM ecosystem
- save/hide/revive
- saved candidate lists
- smart tags
- quick review mode
- bulk invite to vacancy

### Новые сущности

- `talent_pool_candidate`
- `saved_candidate_list`
- `candidate_tag`
- `candidate_review_action`

### Backend

- `GET /api/v1/talent-hub`
- `POST /api/v1/talent-hub/save`
- `POST /api/v1/talent-hub/hide`
- `POST /api/v1/talent-hub/lists`
- `POST /api/v1/talent-hub/invite`

---

## 7.4 Epic P0 — Organization Memory

### Цель

Сделать AI knowledge layer о работодателе, чтобы система понимала компанию глубже, чем просто поля employer profile.

### Что хранить

- auto-generated company summary;
- industries;
- hiring patterns;
- languages;
- branch geography;
- benefits patterns;
- preferred candidate profiles;
- important facts added by employer;
- inferred employer brand signals.

### Источники памяти

- employer profile
- company page
- website parsing
- current and past vacancies
- HRM data
- analytics
- manually added facts

### Новые сущности

- `organization_memory`
- `organization_memory_fact`
- `organization_memory_refresh_log`

### Backend

- `GET /api/v1/organization/memory`
- `POST /api/v1/organization/memory/facts`
- `POST /api/v1/organization/memory/refresh`
- `POST /api/v1/organization/memory/reset`

### Где использовать

- matching
- outreach generation
- vacancy intake
- screening question suggestions
- employer branding page

---

## 7.5 Epic P0 — Power Centre и Integration Hub

### Цель

Показать работодателю уровень зрелости аккаунта, adoption и integrations.

### Функциональность

- maturity stages:
  - `FOUNDATION`
  - `CONNECTED`
  - `AUTOMATED`
  - `INTELLIGENT`
  - `PREDICTIVE`
- unlocked features
- usage counters
- adoption checkpoints
- integration hub

### Connectors priority for Verifix Jobs

- `Verifix HRM` first-class
- `Google Calendar`
- `Outlook Calendar`
- `Telegram employer notifications`
- `hh.uz CSV / import`
- `Email sender`
- `Click / Payme billing`
- future ATS adapters

### Новые сущности

- `integration_connection`
- `integration_sync_status`
- `organization_capability_level`

### Backend

- `GET /api/v1/power-centre`
- `GET /api/v1/integrations`
- `POST /api/v1/integrations/{type}/connect`
- `POST /api/v1/integrations/{type}/disconnect`

---

## 7.6 Epic P0 — Value Report / ROI Report

### Цель

Показывать работодателю measurable value от платформы.

### Метрики

- recruiter hours saved
- time-to-fill reduced
- cost-per-hire reduced
- applications processed
- shortlists generated
- hires completed
- no-show/interview drop-off reduction
- hires moved to HRM/onboarding

### Форматы

- monthly report
- trial report
- annual projection
- plan upgrade suggestions

### Backend

- `GET /api/v1/value-report/current`
- `GET /api/v1/value-report/monthly`
- `GET /api/v1/value-report/export.pdf`

---

## 7.7 Epic P1 — Task Inbox

### Функциональность

- prioritized tasks for recruiter / employer admin;
- auto-created tasks from business events;
- snooze / dismiss / mark done;
- AI prioritization by urgency and impact;
- link to related vacancy / application / report.

### Примеры задач

- review new applicants
- approve AI shortlist
- salary below market, update vacancy
- expiring vacancy
- candidate waiting for call
- screening incomplete
- moderation response required

---

## 7.8 Epic P1 — Activity Feed

### Функциональность

- live feed of events:
  - new applications
  - candidate advanced/rejected
  - AI screening passed/failed
  - referral payout earned
  - vacancy expiring
  - integration sync complete/failed
  - report ready

### Технология

- Spring WebFlux SSE
- Redis Streams or Kafka-backed fanout
- persisted history in PostgreSQL

---

## 7.9 Epic P1 — Semantic Search + reasoning

### Цель

Закрыть разрыв с Avery semantic search, но адаптировать под multilingual frontline hiring.

### Функциональность

- semantic candidate search;
- semantic vacancy search;
- synonyms across `uz_lat`, `uz_cyr`, `ru`, `en`;
- related profession expansion;
- reasoning tags:
  - why this candidate matches
  - why vacancy is recommended

### Особо важно для VF

- связка semantic + geo + shift + salary + availability;
- search for low-structure candidate profiles without formal CV.

---

## 7.10 Epic P1 — Company / Market Intelligence

### Цель

Дать работодателю live insight по рынку труда, а не только static analytics.

### Функциональность

- category-city competition index;
- supply-demand view;
- salary competitiveness;
- branch-level staffing difficulty;
- candidate availability forecast;
- company competitor tracker;
- sourced report with citations for external/public data.

### Backend

- `GET /api/v1/intelligence/company`
- `GET /api/v1/intelligence/market`
- `GET /api/v1/intelligence/competition`
- `POST /api/v1/intelligence/competitors`

---

## 7.11 Epic P1 — Clients и Presets

### Цель

Поддержать agency-like and multi-brand hiring workflows внутри одной организации.

### Функциональность

- clients within organization;
- assign hiring project to client / brand / branch group;
- location presets;
- shift presets;
- screening presets;
- outreach presets;
- vacancy templates.

### Новые сущности

- `organization_client`
- `location_preset`
- `outreach_preset`
- `vacancy_template`

---

## 7.12 Epic P1 — Recruiter Quick Review

### Цель

Сделать сверхбыстрый review flow, как у Avery candidate review, но под mass hiring.

### Функциональность

- one-card review;
- keyboard shortcuts;
- swipe mobile;
- approve / reject / maybe;
- AI summary;
- distance / salary fit / readiness / documents badges;
- cross-project warning.

---

## 7.13 Epic P2 — Full Agentic Employer Layer

### Последовательность агентов

- intake agent
- sourcing agent
- outreach agent
- screening agent
- scheduling agent
- conversion-risk agent

### Human in the loop

- toggle on/off per vacancy/project;
- approval checkpoints before outreach;
- visible audit log of AI actions.

---

## 8. Что использовать из текущего Verifix Jobs, а не переписывать

Нужно расширять, а не изобретать заново:

- `VacancyService`
- `CandidateMatchingService`
- `SalaryPredictionService`
- `NotificationService`
- `ModerationService`
- `BrandingService`
- `BillingService`
- `VerificationService`
- `Hrm*` integration baselines
- Telegram flows

Новый слой должен сесть поверх текущего domain/service baseline.

---

## 9. Изменения в архитектуре

### 9.1 Новые backend-пакеты

- `service/dashboard`
- `service/feed`
- `service/task`
- `service/hiringproject`
- `service/orgmemory`
- `service/intelligence`
- `service/preset`
- `service/integrationhub`

### 9.2 Новые frontend feature-модули

В `verifix-jobs-web`:

- `features/home-intelligence`
- `features/tasks`
- `features/feed`
- `features/hiring-projects`
- `features/talent-hub`
- `features/power-centre`
- `features/organization`
- `features/value-report`

### 9.3 Новые Kafka topics

- `activity-events`
- `task-events`
- `integration-events`
- `org-memory-refresh-events`
- `hiring-project-events`

### 9.4 Search / ML

- embedding search service
- reasoning generation
- market intelligence pipeline
- structured explanation storage

---

## 10. Приоритеты реализации

## Wave 1

- employer intelligence dashboard
- task inbox
- activity feed
- guided hiring project intake

## Wave 2

- organization memory
- power centre
- integration hub
- value report

## Wave 3

- talent hub
- semantic search
- quick review mode
- clients and presets

## Wave 4

- company intelligence
- competitor tracking
- full agentic layer
- advanced predictive workflows

---

## 11. KPI успеха

- dashboard weekly active rate among employers
- avg time from login to first recruiter action
- shortlist creation rate
- vacancy creation completion rate
- recruiter time saved per vacancy
- time-to-fill
- invite-to-apply conversion
- apply-to-hire conversion
- share of employers using presets
- share of employers using integration hub
- share of employers reaching `Connected` and above

---

## 12. Чего в итоговом продукте быть не должно

- копии Avery без адаптации к blue-collar reality;
- employer UX, который ломает Telegram-first candidate funnel;
- зависимость от LinkedIn как главного источника кандидатов;
- AI features without measurable operational value;
- тяжелые enterprise screens без мобильного branch-manager режима.

---

## 13. Итоговый вывод

Главный урок Avery:

- выигрывает не тот, у кого больше CRUD и интеграций,
- а тот, кто превращает hiring process в понятную, умную и action-oriented operating system.

Главный шанс Verifix Jobs:

- у нас уже есть гораздо более сильная региональная база для frontline hiring, чем у Avery;
- если добавить employer intelligence layer уровня Avery, но поверх `Telegram + geo + MyID + HRM + gov + mass hiring`, продукт станет не просто конкурентоспособным, а уникальным для Центральной Азии.

Следующий рекомендуемый шаг после утверждения этого ТЗ:

- сделать `Implementation Plan v4.0` на 8-12 недель с decomposition по backend, web, telegram, ml и data.

