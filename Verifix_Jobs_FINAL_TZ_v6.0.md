# Verifix Jobs — Финальное Техническое Задание v6.0
## Единый канонический документ: продукт, архитектура, конкурентный анализ, roadmap, Claude Code prompts

> **Дата:** 26.03.2026
> **Версия:** 6.0 (Final)
> **Статус:** Canonical master — supersedes все предыдущие документы
> **Заменяет:** v1.0, v2.0, v2.1, v3.0, v4.0–v4.5, v5.0, все Competitor Analysis TZ, Employer Branding TZ, Claude Code Master Prompt

---

# ЧАСТЬ I — ПРОДУКТОВОЕ ВИДЕНИЕ

---

## 1. Что такое Verifix Jobs

Платформа массового найма blue-collar и frontline-персонала в Центральной Азии, встроенная в экосистему Verifix HRM.

Полный контур: discovery → отклик → screening → verification → hiring → onboarding в HRM → payroll.

### 1.1 Продуктовая модель

- **Public job marketplace** — для кандидата
- **Mass-hiring operating system** — для работодателя
- **Closed-loop hiring bridge** — в Verifix HRM
- **AI-assisted hiring layer** — поверх core-процесса

### 1.2 Целевые аудитории

**Работодатели:** retail, HoReCa, manufacturing, logistics, construction, FMCG, сервисные сети. Компании от 30 до 5000 сотрудников.

**Кандидаты:** blue-collar / frontline workers, 18–45, часто без классического резюме, основной девайс — бюджетный Android. Каналы: Telegram → SMS fallback → Web → Mini App.

### 1.3 География

- Launch market: Uzbekistan
- Затем: Kazakhstan, Kyrgyzstan, Tajikistan

### 1.4 Ключевые дифференциаторы

| # | Дифференциатор | Описание |
|---|---------------|----------|
| 1 | Telegram-native candidate UX | Бот + Mini App + channel posting |
| 2 | Closed-loop with Verifix HRM | HIRED → employee → payroll |
| 3 | MyID / KYC / verified trust | Государственная верификация обеих сторон |
| 4 | Geolocation / nearby jobs | PostGIS + карта + расстояние + branch hiring |
| 5 | Gov integrations | ARGOS / ENST / ish.mehnat.uz |
| 6 | Referral engine | Вирусный рост через Telegram |
| 7 | Employer intelligence + automation | AI-assisted hiring OS |
| 8 | Central Asia localization | uz/ru/en + кириллица + 6 языков |

---

## 2. Конкурентный ландшафт (сводка)

### 2.1 GetAvery (getavery.ai)

**Что это:** AI-powered hiring intelligence platform (Нидерланды). Фокус на white-collar, 60M+ кандидатов.

**Сильные стороны для заимствования:**
- NLP search ("I am looking for...") → мгновенный подбор
- 3 способа создания Hiring Project: URL / документ / текст
- Avery Agent (AI-автопилот): sourcing → outreach → screening → shortlist
- Auto-evaluate с "Great match" бейджем
- Organization Memory — AI knowledge layer о компании
- Power Centre / Intelligence Levels — maturity progression
- Task Inbox — приоритизированные задачи рекрутера
- Activity Feed — live события
- Value Report / ROI — measurable business value
- Talent Hub — reusable candidate pool

**Слабости (наши преимущества):**
- Не подходит для blue-collar; нет uz/ru; нет Telegram/SMS; нет геолокации; нет job board для кандидатов; нет мобильного приложения; только English UI

### 2.2 HeadHunter UZ (tashkent.hh.uz)

**Что это:** Крупнейший job-портал в Узбекистане. 6.5M+ резюме.

**Сильные стороны для заимствования:**
- Employer Response Index (Индекс вежливости) — 21%
- Vacancy Health — диагностика вакансии (конверсия, salary competitiveness)
- Автопоиск кандидатов — подписка на поисковые запросы
- Шаблоны вакансий (12 шт)
- Колонка "Подходящие резюме: 36892" — в таблице вакансий
- "Поднять" вакансию (bump)
- Пакетная монетизация (bundles: вакансии + контакты + продвижение)
- Система менеджеров (multi-user с ролями)
- Автоматизация обработки откликов
- Автоматический разбор с чат-ботом
- Entitlements dashboard (остатки, баланс, пакеты)

**Слабости (наши преимущества):**
- Ориентирован на white-collar; дорого для малого бизнеса; нет геолокации; нет реферальной системы; нет gov-интеграций; нет AI matching; нет Telegram; нет MyID; UI перегружен для mass-hiring

### 2.3 IshGO (ishgo.uz)

**Что это:** Локальный job-портал Узбекистана. 25K+ резюме, 2K+ вакансий, 200+ компаний.

**Сильные стороны для заимствования:**
- Split-View layout (3 колонки): список + детали без перехода
- TOP-размещение вакансий (оранжевый бейдж)
- Каталог отраслей (Sohalar) с метриками
- Каталог компаний (Korxonalar) с логотипами
- Карта вакансий (отдельная вкладка)
- Простой ATS-пайплайн: Yangi → Jarayonda → Suhbat
- Верификация компаний (✅ бейдж)
- Узбекский язык (латиница) как основной
- Ежедневный отчёт (Kunlik hisobot)
- Sidebar со статистикой и топ-компаниями (social proof)

**Слабости (наши преимущества):**
- Нет геолокации; 4 фильтра; нет бенефитов на карточках; примитивный ATS без Kanban; нет аналитики; нет реферальной системы; нет gov-интеграций; нет AI/ML; нет MyID; слабый mobile; нет подписочной модели

### 2.4 Итоговая конкурентная матрица

| Категория | IshGO | HH.uz | GetAvery | **Verifix Jobs** |
|-----------|-------|-------|----------|-----------------|
| Blue-collar оптимизация | 🟡 | ❌ | ❌ | **✅** |
| Telegram integration | ❌ | ❌ | ❌ | **✅** |
| Геолокация | ❌ | ❌ | ❌ | **✅** |
| AI matching/scoring | ❌ | ❌ | ✅ | **✅** |
| Employer intelligence | ❌ | 🟡 | **✅** | ✅ (цель) |
| Employer operations | ❌ | **✅** | 🟡 | ✅ (цель) |
| Public marketplace | **✅** | ✅ | ❌ | ✅ (цель) |
| MyID/KYC | ❌ | ❌ | ❌ | **✅** |
| Gov integrations | ❌ | ❌ | ❌ | **✅** |
| HRM bridge | ❌ | ❌ | ❌ | **✅** |
| Referral system | ❌ | ❌ | 🟡 | **✅** |
| Monetization rigor | 🟡 | **✅** | ✅ | ✅ (цель) |
| Central Asia localization | 🟡 | 🟡 | ❌ | **✅** |
| Mobile-first | 🟡 | ❌ | ❌ | **✅** |

**Формула Verifix Jobs:**
- IshGO-уровень public marketplace и local candidate discovery
- HeadHunter-уровень employer operations и monetization
- GetAvery-уровень employer intelligence и AI-assisted hiring
- \+ собственные преимущества: Telegram + MyID + geo + HRM + gov + mass hiring

---

# ЧАСТЬ II — ТЕКУЩЕЕ СОСТОЯНИЕ ПРОЕКТА

---

## 3. Что уже есть

### 3.1 Фактическая реализация

- Multi-module Maven backend (Java 21, Spring Boot 3.5.x)
- 6 core модулей: common, domain, service, api, telegram, integration
- Skeleton модули: web, admin, ml
- 35+ JPA entities + Liquibase
- Auth: JWT + OTP + MyID routes + stateful refresh tokens
- Vacancies: CRUD + status machine + moderation + CSV import
- Applications: CRUD + status machine + bulk ops
- Notifications: multi-channel (SMS, Telegram, push, email)
- Geo: PostGIS + Nominatim geocoding
- Billing: subscriptions + Click.uz + Payme.uz
- Branding: employer pages (8 сервисов, 14 entity)
- Analytics: dashboard metrics
- Candidate: auth + search + profile + work history
- Referrals: program + tracking
- Compliance: GDPR data export + consent
- Gov: ARGOS/ENST/Mehnat sync + HRM bridge
- ML baselines: matching, salary prediction, fraud detection, notification optimizer
- Telegram: bot + Mini App auth baseline
- Angular: employer web + admin (начальные приложения)
- SMS gateways: Eskiz + PlayMobile
- Integration clients: SMS, payment, gov, KYC, geo, storage, HRM

### 3.2 Главные product gaps

| Gap | Уровень-ориентир | Описание |
|-----|-----------------|----------|
| Public candidate marketplace | IshGO | Нет сильного публичного каталога, категорий, компаний, SEO |
| Employer operations | HeadHunter | Нет vacancy health, response inbox, automation, templates, bump, civility |
| Employer intelligence | GetAvery | Нет hiring projects, talent hub, org memory, task inbox, activity feed, value report |
| Unified roadmap | — | Нет единого плана, учитывающего все ТЗ и фактический код |

---

# ЧАСТЬ III — CANONICAL PRODUCT PILLARS

---

## 4. Шесть продуктовых столпов

### Pillar A — Public Candidate Marketplace (источник: IshGO)

- Public vacancy catalog с фильтрами и сортировкой
- Split-View layout (список + детали)
- Category / city / district landing pages (SEO)
- Company directory и company pages
- Map / nearby jobs (PostGIS)
- Phone-first auth (OTP) + quick apply
- Favorites / alerts / saved searches
- Visual benefits на карточках (еда, транспорт, медицина)
- Promoted vacancies (TOP бейдж)
- Statistics sidebar (social proof)
- Telegram continuation CTA
- Branch-aware apply (для сетевых работодателей)

### Pillar B — Employer Mass-Hiring Operating System (источник: HeadHunter)

- Operations dashboard (action-oriented)
- Vacancy operations board (таблица с метриками)
- Vacancy health (диагностика: конверсия, salary competitiveness, рекомендации)
- Response inbox (triage, bulk actions, templates, SLA/aging)
- Candidate database search 2.0 (structured, saved, auto-search)
- Automation hub (auto-parse, auto-screen, auto-message, rules)
- Vacancy templates (12 системных + пользовательские)
- Vacancy bump (поднять в выдаче)
- Storefront / entitlements (пакеты, балансы, остатки)
- Employer Response Index / Civility Score
- Multi-manager / account ops (ADMIN, RECRUITER, VIEWER roles)
- Matching Candidates Counter (рядом с каждой вакансией)
- Candidate activity badges ("Faol ish izlayabman", "Tez javob beradi", "MyID tasdiqlangan")

### Pillar C — Employer Intelligence Layer (источник: GetAvery)

- Hiring Intelligence Dashboard (next best action, blockers, alerts)
- Hiring Project (сущность выше вакансии: URL / doc / template / manual)
- AI Intake Agent (извлекает поля, валидирует, предсказывает)
- Talent Hub (reusable candidate pool, cross-vacancy reuse, talent lists)
- Organization Memory (AI knowledge layer: EVP, patterns, preferences)
- Power Centre / Integration Hub (maturity levels, connectors, adoption)
- Value / ROI Report (hires, time saved, cost reduced, projection)
- Task Inbox (prioritized, AI-generated, snooze/dismiss/done)
- Activity Feed (live events, SSE, history)
- Semantic Search (multilingual, uz/ru/en, cross-script)
- Market Intelligence (competition, supply/demand, salary bands)
- Quick Review Mode (one-card, keyboard shortcuts, swipe mobile)

### Pillar D — Commerce & Branding (источники: HH pricing + Employer Branding TZ)

- Subscription tiers: FREE / STANDARD / PREMIUM / ENTERPRISE
- Vacancy promotion: TOP-7 (200K UZS), TOP-14 (350K UZS), TOP-30 (500K UZS)
- Bundle pricing (вакансии + контакты + продвижение)
- Contact credits (просмотр резюме)
- Branding tiers: Basic / Branded / Premium Branding
- Branded employer pages (custom slug, colors, cover, gallery, benefits, FAQ, video, employee stories)
- Branded vacancy templates
- Branding analytics
- Entitlement accounting (balances, expiration, audit trail)

### Pillar E — HRM / Gov / Compliance Backbone

- Verifix HRM bridge: HIRED → create employee → payroll
- Gov sync: ARGOS / ENST / ish.mehnat.uz (idempotent, audit trail, retry)
- Consent management
- Data export / deletion (GDPR-like)
- MyID / KYC verification
- Regional config: multi-country, currency, language packs
- Reporting и compliance diagnostics

### Pillar F — AI / Automation / Intelligence

- AI-assisted intake (URL/doc/text → structured vacancy)
- AI sourcing (build shortlists, justify ranking)
- AI outreach (personalized Telegram/SMS messages, batch, human review)
- AI screening (Telegram bot Q&A, structured result)
- Conversational job search (NLP в Telegram: "Chilonzorda kassirlik ishi bor?")
- AI Match Score (0-100): "Ajoyib moslik" (80+), "Yaxshi moslik" (60-79), "Qisman moslik" (40-59)
- Notification optimization (channel + timing)
- Predictive intelligence (closure probability, churn, fraud)
- Salary prediction (market stats by category/city)
- Verifix Hiring Agent (AI-автопилот с human-in-the-loop)

---

# ЧАСТЬ IV — ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ

---

## 5. Candidate Marketplace (Pillar A)

### FR-A01. Public Vacancy Catalog

| Параметр | Значение |
|----------|----------|
| Layout | Split-View: навигация (240px) + список (flex) + детали (40%). Mobile: single column |
| Фильтры | Зарплата (range), Тип работы, Занятость, Опыт, **Расстояние** (1/3/5/10/20 км), **Бенефиты** (multi-select), **График** (5/2, 2/2, 6/1, гибкий), **Верификация** |
| Сортировка | По дате, по зарплате, по расстоянию, по релевантности |
| Переключение | Список / Карта |
| Pagination | Infinite scroll или efficient pagination |
| SEO | SSR-ready URLs: /vacancies/{city}/{slug}-{id} |
| Promoted | TOP-вакансии первыми, бейдж "TOP ⭐", gradient border |

### FR-A02. Vacancy Detail 2.0

Каждая публичная вакансия показывает:
- Title + salary (bold, green, крупный)
- Company (с бейджем верификации)
- City/region/address + расстояние от кандидата
- Work mode + employment type
- Shifts/schedule на карточке
- Benefits иконки: 🍜 Еда | 🚌 Транспорт | 🏥 Медицина | 🏠 Жильё | 👕 Форма | 📚 Обучение | 💰 Бонусы
- MyID verified + employer response badge
- Branch options (для сетевых)
- Apply CTA (sticky внизу на mobile)
- Employer block + similar vacancies
- Telegram continuation CTA
- Salary Intelligence: "Bozor o'rtachasi: 4-5.5 mln" + "Bozordan yuqori ↑"

### FR-A03. Category / City Hubs

- /categories — плитки отраслей: иконка, название (uz/ru), кол-во вакансий + компаний
- /vacancies/{city} — city landing page с meta tags
- /vacancies/{city}/{category} — пересечение город+категория
- SEO: JSON-LD JobPosting, sitemap, hreflang uz/ru/en

### FR-A04. Company Directory

- /companies — каталог: логотип, название, отрасль, кол-во вакансий, верификация
- /companies/{slug} — branding page (табы: вакансии, о компании, бенефиты)
- Топ-компании в sidebar (social proof)

### FR-A05. Statistics Sidebar

- Правая панель (300px, sticky, скрывается <1280px)
- Метрики: кол-во резюме, вакансий, компаний
- Топ-9 компаний (3×3 grid)
- Ссылки на mobile apps

### FR-A06. Phone-first Auth + Quick Apply

- OTP login (минимальный friction)
- Deferred profile completion
- Web ↔ Telegram continuity
- "1-tap apply" для верифицированных

### FR-A07. Favorites / Alerts / Saved Searches

- Favorite vacancy (❤️)
- Save search (фильтры → подписка)
- Telegram/SMS/push alerts при новых вакансиях
- Digest delivery

---

## 6. Employer Operating System (Pillar B)

### FR-B01. Operations Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │ 99+ yangi    │ │ Balans       │ │ Javob indeksi│            │
│ │ arizalar     │ │ 2,450,000 UZS│ │    72%       │            │
│ │ [Ko'rish]    │ │ [To'ldirish] │ │ ✅ Yaxshi    │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                │
│ 2 action items                                                 │
│ 🔔 5 yangi nomzod - "Kassir" vakansiyaga                      │
│ ⚡ Vakansiya muddati 2 kunda tugaydi                          │
│                                                                │
│ Vakansiyalar                              [+ Yangi vakansiya]  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│ │ Kassir   │ │ Oshpaz   │ │ Haydovchi│                       │
│ │ 134 apps │ │ 19 apps  │ │ 28 apps  │                       │
│ │ 458 match│ │ 234 match│ │ 156 match│                       │
│ └──────────┘ └──────────┘ └──────────┘                       │
│                                                                │
│ Qidiruvlar    Tanlanganlar    Avto-qidiruvlar                  │
│ "Kassir Toshkent" → 3 yangi nomzod                            │
└─────────────────────────────────────────────────────────────────┘
```

### FR-B02. Vacancy Operations Board

```
┌──┬─────────────┬──────────┬─────────┬──────────┬────────┬──────────┬─────────┬────────────┐
│☐ │ Vakansiya    │ Hudud    │Ko'rishlar│ Arizalar │ Ishda  │ Nomzodlar│ Muddati │ Reklama    │
├──┼─────────────┼──────────┼─────────┼──────────┼────────┼──────────┼─────────┼────────────┤
│☐ │ Kassir       │ Toshkent │   726   │ 134 +132 │   5    │   458    │ 11.04   │ TOP ⭐     │
│☐ │ Oshpaz       │ Toshkent │   182   │  19  +5  │   2    │   234    │ 11.04   │ Ko'tarish ⬆│
└──┴─────────────┴──────────┴─────────┴──────────┴────────┴──────────┴─────────┴────────────┘
Фильтры: [🔍 Qidirish] [Menejer ∨] [Avtomatizatsiya ∨]
Табы: [Faol 4] [Qoralama 0] [Arxiv 292] [Shablonlar 12]
```

### FR-B03. Vacancy Health

Диагностика каждой вакансии:
- Impressions → Opens → Applies → Conversion rate
- Time to first response
- Salary competitiveness (vs market: "Bozordan past ↓")
- Geo competitiveness
- Benchmark vs similar vacancies
- Recommended fixes ("Maosh ko'rsating — +60% arizalar")

### FR-B04. Employer Response Index (Civility Score)

| Параметр | Значение |
|----------|----------|
| Формула | (responses_within_48h / total_applications) × 100, rolling 30 дней |
| Бейджи | >70%: "Tez javob beradi" (зелёный), 40-70%: без бейджа, <40%: "Sekin javob beradi" (серый) |
| Влияние | +10% к позиции в поиске для >70% |
| Отображение | Dashboard, профиль компании, карточка вакансии |

### FR-B05. Auto-Search (Автопоиск кандидатов)

| Параметр | Значение |
|----------|----------|
| Создание | Кнопка "Saqlash" на странице поиска кандидатов |
| Параметры | Категория, город, зарплата, опыт, MyID, активность |
| Уведомления | "3 yangi nomzod topildi" → Telegram/Email/Push |
| Частота | Real-time или ежедневный дайджест |
| Лимит | FREE: 2, STANDARD: 10, PREMIUM: unlimited |

### FR-B06. Vacancy Templates

| Параметр | Значение |
|----------|----------|
| Системные (12) | Kassir, Sotuvchi, Oshpaz, Haydovchi, Yuk tashuvchi, Tozalovchi, Qorovul, Ofitsant, Ishchi, Tikuvchi, Barmen, Omborchi |
| Пользовательские | Сохранить любую вакансию как шаблон |
| Действие | "Shablondan yaratish" → форма заполнена → редактирование → Publish |

### FR-B07. Vacancy Bump

| Параметр | Значение |
|----------|----------|
| Бесплатно | 1 раз в 7 дней per vacancy |
| Платно | 50,000 UZS за каждый дополнительный |
| Эффект | updated_at = now() → поднимается в сортировке |

### FR-B08. Auto-Action Rules

| Параметр | Значение |
|----------|----------|
| Правила | IF match_score < X → auto_reject(message) / IF match_score > Y → auto_invite / IF no_response > 48h → remind_hr |
| Шаблоны | Стандартные + настраиваемые per vacancy |
| UI | Секция "Avtomatizatsiya" в настройках вакансии |

### FR-B09. Response Inbox

Mass-hiring workflow:
- Triage (NEW → REVIEW → SHORTLISTED → INVITED → INTERVIEWED → OFFERED → HIRED / REJECTED)
- Kanban board (desktop: drag-drop, mobile: swipe)
- Bulk actions (invite all, reject all with message)
- Templates для ответов
- Notes по каждому кандидату
- SLA / aging indicators
- Keyboard shortcuts (J/K navigate, L advance, H reject)

### FR-B10. Candidate Database Search 2.0

- Structured search с фильтрами
- Saved searches + auto-search
- Favorites / shortlist
- Notes per candidate
- Contact reveal (credit-based)
- Invite to vacancy
- Match to vacancy score
- Activity badges: "Faol ish izlayabman", "Tez javob beradi", "MyID tasdiqlangan", "Oxirgi faollik: bugun"

---

## 7. Employer Intelligence (Pillar C)

### FR-C01. Hiring Project

Сущность выше вакансии:
- Entry points: Paste URL / Upload doc / Start from template / Clone existing / Manual
- AI intake: извлекает title, category, city, salary, requirements, shifts, benefits
- Предсказывает: applications volume, time-to-fill
- Предлагает: market salary, screening questions
- Переводит/нормализует: RU / UZ / UZ_CYR / EN

### FR-C02. Organization Memory

AI knowledge layer о работодателе:
- Auto-generated company summary
- Industries, hiring patterns, languages
- Branch geography, benefits patterns
- Preferred candidate profiles
- Employer-specific heuristics
- Manually added facts ("Add fact" / "Reset memory")
- Источники: employer profile, website parsing, vacancies, HRM data, analytics

### FR-C03. Talent Hub

- Reusable candidate pool (отдельно от applicants конкретной вакансии)
- Cross-vacancy: "Кандидат уже shortlisted по другой вакансии"
- Cross-HRM: "Кандидат уже работал в HRM ecosystem"
- Talent lists + smart tags
- Save/hide/revive
- Bulk invite to vacancy
- Quick review mode

### FR-C04. Power Centre / Integration Hub

Maturity stages:
1. **FOUNDATION** — зарегистрирован, заполнил профиль
2. **CONNECTED** — подключил Telegram/HRM/Calendar
3. **AUTOMATED** — настроил auto-actions, templates
4. **INTELLIGENT** — использует AI intake, matching, org memory
5. **PREDICTIVE** — полная автоматизация + ML predictions

Connectors (приоритет): Verifix HRM → Google Calendar → Outlook → Telegram employer → hh.uz CSV import → Email → Click/Payme → future ATS adapters

### FR-C05. Value / ROI Report

- Recruiter hours saved
- Time-to-fill reduced
- Cost-per-hire reduced
- Applications processed / Shortlists generated / Hires completed
- No-show reduction
- Hires moved to HRM/onboarding
- Monthly report + trial report + annual projection

### FR-C06. Task Inbox

Приоритизированные задачи:
- Auto-created from business events
- AI-prioritized by urgency
- Snooze / dismiss / done
- Примеры: "17 yangi arizalarni ko'rib chiqing", "Vakansiya 2 kunda tugaydi", "AI 12 nomzodni tanladi"

### FR-C07. Activity Feed

- Live SSE events: new applications, candidate advanced/rejected, AI screening passed, referral earned, vacancy expiring, integration sync
- Read/unread + history
- Entity deep links
- Employer-level + recruiter-level views

### FR-C08. Semantic Search

- Multilingual: uz_lat + uz_cyr + ru + en
- Synonym expansion (kassir = кассир = cashier)
- Related profession expansion
- Reasoning tags: "Why this candidate matches"
- Связка: semantic + geo + shift + salary + availability

### FR-C09. Market Intelligence

- Category-city competition index
- Supply-demand view
- Salary competitiveness by city/category
- Branch-level staffing difficulty
- Candidate availability forecast
- Company competitor tracker

---

## 8. Commerce & Branding (Pillar D)

### FR-D01. Subscription Tiers

| Tier | Цена (UZS/мес) | Вакансии | Просмотры | TOP | Другое |
|------|----------------|----------|-----------|-----|--------|
| FREE | 0 | 3 | 50 | 1 | — |
| STANDARD | 990,000 | 10 | 200 | 3 | Аналитика |
| PREMIUM | 2,990,000 | Unlimited | 500 | 10 | Branding + API |
| ENTERPRISE | По запросу | Unlimited | Unlimited | Unlimited | Dedicated support |

### FR-D02. Promotion Packages

| Тип | Срок | Цена (UZS) |
|-----|------|------------|
| TOP-7 | 7 дней | 200,000 |
| TOP-14 | 14 дней | 350,000 |
| TOP-30 | 30 дней | 500,000 |

Лимит: не более 20% TOP-вакансий в выдаче.

### FR-D03. Branding Tiers

| Tier | Возможности |
|------|------------|
| Basic | Логотип + описание |
| Branded | + custom slug + colors + cover + gallery |
| Premium Branding | + FAQ + video + employee stories + branded vacancy cards + analytics |

---

## 9. AI & Automation (Pillar F)

### FR-F01. AI NLP Vacancy Search (Telegram)

| Параметр | Значение |
|----------|----------|
| Описание | Кандидат пишет текст → AI извлекает параметры → возвращает вакансии |
| Примеры | "Chilonzorda kassirlik ishi bor?", "5 million maoshli ish kerak Toshkentda" |
| Pipeline | User text → Claude API (intent + entity extraction: city, category, salary, schedule) → ES query → ranked results |
| Языки | uz (латиница), uz (кириллица), ru, en |
| Fallback | Если AI не извлёк параметры → показать форму с фильтрами |
| Latency | < 3 seconds |

### FR-F02. AI Vacancy Generator

| Параметр | Значение |
|----------|----------|
| Описание | Работодатель описывает вакансию → AI заполняет все поля |
| Ввод | 1) Текст, 2) Файл (docx/pdf), 3) URL (hh.uz, ish.mehnat.uz) |
| Output | title, category, city, salary_from/to, employment_type, shift_schedule, benefits[], description, requirements[], conditions[] |
| Действие | AI заполняет → работодатель редактирует → Publish |
| Latency | < 10 seconds |

### FR-F03. AI Match Score

| Параметр | Значение |
|----------|----------|
| Описание | Каждая пара (candidate, vacancy) → score 0-100 |
| Бейджи | 80-100: "Ajoyib moslik" (зелёный), 60-79: "Yaxshi moslik" (жёлтый), 40-59: "Qisman moslik" (серый) |
| Факторы | skill_overlap (30%), distance_km (25%), salary_fit (20%), category_match (15%), verification_bonus (10%) |
| Phase 1 | Rule-based scoring |
| Phase 4 | CatBoost ML model |

### FR-F04. AI Screening Bot (Telegram)

Когда кандидат откликается → AI-бот задаёт 3-5 вопросов:
- "Qachondan ishlashingiz mumkin?" (Когда можете начать?)
- "Transport bilan borishingiz mumkinmi?" (Удобно ли добираться?)
- "Oldingi tajribangiz bormi?" (Есть ли опыт?)

AI оценивает ответы → pre-screening score.

### FR-F05. Verifix Hiring Agent (AI-автопилот)

| Модуль | Toggle | Описание |
|--------|--------|----------|
| AI Search | ON/OFF | Поиск кандидатов в базе |
| AI Invite | ON/OFF | Telegram/SMS приглашение |
| AI Screen | ON/OFF | Чат-бот скрининг-вопросы |
| AI Shortlist | ON/OFF | Формирование шортлиста |
| Human Review | Always ON | Запрос решения HR |

Dashboard: candidates: N, shortlisted: N, invited: N, screened: N. Last active: timestamp.

**КРИТИЧНО:** AI Agent НИКОГДА не auto-hires. Всегда требует HR approval.

---

# ЧАСТЬ V — UI/UX ТРЕБОВАНИЯ

---

## 10. Визуальные стандарты

### 10.1 Цветовая схема

| Элемент | Цвет |
|---------|------|
| Primary | Blue (#1B5E8C) |
| CTA / Success | Green (#2ECC71) |
| TOP бейдж | Orange (#F39C12) |
| Salary text | Green bold |
| Background | Light blue-gray (#F8FAFE) |
| Navigation | Blue sidebar с hover-эффектами |

### 10.2 Принципы

**Candidate-side:**
- Mobile-first, low-bandwidth
- Salary, location, schedule above the fold
- One dominant CTA
- Telegram continuity
- Simple trust signals
- No long resume friction

**Employer-side:**
- Action-oriented, not decorative
- Progressive disclosure
- Strong table/board ergonomics
- Visible urgency
- Mobile-safe mode for branch managers

**Design rule:** Clearer than HH. More practical than IshGO. More local and mobile-native than Avery.

### 10.3 Карточка вакансии (candidate view)

```
┌─────────────────────────────────────────────────────┐
│ [Logo]  Kassir                           [TOP ⭐]   │
│         💰 3,500,000 - 6,440,000 so'm / Oylik       │
│         ✅ OQTEPA LAVASH · Tez javob beradi         │
│         📍 Toshkent, Chilonzor (2.3 km)             │
│         ⏰ 08:00-20:00 (2/2 smenali)                │
│         🍜 Ovqat | 🚌 Transport | 🏥 Tibbiy         │
│                                          19.03.2026  │
└─────────────────────────────────────────────────────┘
```

### 10.4 Карточка кандидата (employer view)

```
┌─────────────────────────────────────────┐
│ [Photo] Aziz Karimov                    │
│         Kassir | Korzinka (hozirgi)     │
│ ||| Ajoyib moslik  85%                  │
│ 📍 1.2 km | ✅ MyID | 🔄 3 oy tajriba  │
│ 🟢 Faol ish izlayabman                  │
│ [📨 Taklif] [👁 Batafsil] [❤️ Saqlash] │
└─────────────────────────────────────────┘
```

### 10.5 Employer Intelligence Dashboard

```
┌─────────────────────────────────────────────────────┐
│ 🏢 Verifix Jobs          Intelligence Level 3  ████░│
│                                    + Yangi vakansiya│
├─────────────────────────────────────────────────────┤
│ Xayrli kun, Abdukakhkhor!                           │
│                                                     │
│ ┌─────────────────────────────────────────┐         │
│ │ 2 action items                           │         │
│ │ 🔔 5 yangi nomzod - "Kassir" vakansiyaga │         │
│ │ ⚡ AI Agent 12 nomzodni tanladi          │         │
│ └─────────────────────────────────────────┘         │
│                                                     │
│ 📊 Hiring projects                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ Kassir   │ │ Oshpaz   │ │ Haydovchi│             │
│ │ 45 apps  │ │ 12 apps  │ │ 28 apps  │             │
│ │ 8 short  │ │ 3 short  │ │ 5 short  │             │
│ │ ✅ Agent │ │ ⏸ Paused │ │ ✅ Agent │             │
│ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

---

## 11. Оптимизация ключевых сценариев

### Сценарий: Массовый найм 50 кассиров

| Шаг | Без AI (текущий) | С AI (целевой) |
|-----|-----------------|----------------|
| Создать вакансию | 5 мин (форма) | 1 мин (AI из текста/URL) |
| Ждать откликов | 3-7 дней | AI Agent ищет проактивно |
| Скрининг | 2-3 часа (200+ вручную) | 15 мин (AI shortlist + score) |
| Приглашения | 30 мин | AI через Telegram/SMS |
| Собеседования | 2 дня | AI pre-screening, HR подтверждает |
| **Итого** | **3-7 дней, 3+ часов** | **1 день, 20 минут** |

### Конверсионные улучшения

| Метрика | Текущий | Целевой | Улучшение |
|---------|---------|---------|-----------|
| Time to create vacancy | 5-10 мин | 1 мин | -90% |
| Time to screen 200 apps | 2-3 часа | 15 мин | -90% |
| Time to first invite | 3-7 дней | 24 часа | -80% |
| Candidate relevance | 30-40% | 70-80% | +100% |
| Employer retention | 40% | 65% | +60% |
| Apply rate | Baseline | +40% (1-tap + verified) | +40% |
| Vacancies viewed/session | Baseline | +30% (Split-View) | +30% |

---

# ЧАСТЬ VI — ТЕХНИЧЕСКИЙ СТЕК И АРХИТЕКТУРА

---

## 12. Canonical Tech Stack

### Backend
- Java 21, Spring Boot 3.5.x, Spring Security 6, Spring Data JPA, Spring WebFlux (SSE/async)
- Liquibase, Kafka, Redis 7, Elasticsearch 8.x

### Data & Infra
- PostgreSQL 16 + PostGIS, MinIO (S3), Docker/Docker Compose
- GitHub Actions, Prometheus/Grafana/ELK

### Frontend
- Angular 17+ (employer web + public web/PWA + admin)
- Telegram Bot + Telegram Mini App

### AI/ML
- Python FastAPI microservice, CatBoost/XGBoost, gRPC bridge
- Embeddings / semantic search, Claude API (conversational + generative)

### Stack rule
Не делать downgrade. Preserve newer stable versions already in repo.

---

## 13. Domain Model

### 13.1 Core entities (уже есть)

employer, manager, vacancy, candidate, work_history, application, referral, notification, sms_log, verification_log, moderation_queue, geo_city, payment, pricing_plan, consent_log, gov_sync_log, ml_candidate_score, branding entities (14)

### 13.2 Новые entities (по unified roadmap)

**Marketplace:**
public_vacancy_read_model, public_company_read_model, category_landing_snapshot, city_landing_snapshot, favorite_vacancy, saved_search, branch_apply_option

**Employer operations:**
vacancy_health_snapshot, vacancy_promotion, vacancy_template, candidate_contact_credit_usage, recruiter_workload_snapshot, employer_task, activity_event, civility_score_snapshot

**Intelligence:**
hiring_project, hiring_project_vacancy, talent_hub_candidate, talent_list, organization_memory, org_memory_fact, org_connector, value_report_snapshot, intelligence_signal

**Automation / AI:**
ai_agent_run, ai_agent_action, ai_screening_result, automation_rule, automation_execution_log, semantic_embedding_job, semantic_embedding_candidate

**Commerce:**
pricing_entitlement, account_balance_event

### 13.3 Новые backend-пакеты

service/dashboard, service/feed, service/task, service/hiringproject, service/orgmemory, service/intelligence, service/preset, service/integrationhub

### 13.4 Новые Kafka topics

activity-events, task-events, integration-events, org-memory-refresh-events, hiring-project-events

---

## 14. Non-Functional Requirements

### Performance
| Метрика | Цель |
|---------|------|
| Public LCP | < 2.5s on 4G |
| Vacancy board open | < 2s |
| Recruiter filters | < 300ms perceived |
| Search response | < 200ms |
| NLP query → results | < 3s |
| AI vacancy generation | < 10s |
| Match scoring (batch 100) | < 5s |

### Security
- JWT + refresh, OTP anti-abuse, RBAC, tenant isolation
- Audit logs, safe contact reveal, rate limiting, bot protection
- Prompt injection protection (sanitize all inputs before Claude API)
- AI decision audit (log all scores/reasons in ml_candidate_score)
- Don't send personal data (phone, passport) to external AI APIs

### Scalability targets
| Аспект | Phase 1 | Phase 4 |
|--------|---------|---------|
| Резюме | 5K | 500K |
| Вакансии | 200 | 15,000 |
| Concurrent users | 500 | 10,000 |
| Search QPS | 10 | 1,000 |
| Отклики/день | 500 | 10,000 |

---

# ЧАСТЬ VII — ROADMAP

---

## 15. Unified Roadmap (7 Waves)

### Wave 0 — Canonical Alignment
- Выровнять README, env, configs, docs
- Зафиксировать текущую архитектуру
- Убрать drift между prompt и repo

### Wave 1 — Public Marketplace (источник: IshGO)
- Public vacancy catalog + Split-View
- Vacancy detail 2.0 (benefits, distance, schedule)
- Company directory + company pages
- Category/city landing pages (SEO)
- Map/nearby mode
- Phone-first auth + quick apply
- Favorites/alerts/saved searches
- Statistics sidebar
- Telegram continuation

### Wave 2 — Employer Operations (источник: HeadHunter)
- Operations dashboard (action-oriented)
- Vacancy operations board (table with metrics)
- Vacancy health diagnostics
- Response inbox (Kanban + bulk actions)
- Candidate DB search 2.0
- Vacancy templates (12 системных)
- Vacancy bump
- Auto-search candidates
- Civility score
- Recruiter/account ops (multi-manager)

### Wave 3 — Automation & AI-Assisted Hiring (источники: HH + GetAvery)
- Automation hub (auto-action rules)
- AI intake assistant (vacancy generation)
- AI sourcing (shortlist generation)
- AI outreach (Telegram/SMS)
- AI screening (bot Q&A)
- Task inbox
- Activity feed

### Wave 4 — Employer Intelligence (источник: GetAvery)
- Hiring project
- Talent hub
- Organization memory
- Integration hub / Power centre
- Value / ROI report
- Semantic search
- Market intelligence

### Wave 5 — Commerce, Branding, Growth
- Branding tiers (Basic/Branded/Premium)
- Branded company pages
- Storefront + entitlements
- Promotion packages (TOP)
- Bundle pricing
- Referral growth loops
- Channel autoposting

### Wave 6 — Gov, HRM, Regional Scale
- HRM bridge hardening
- Gov sync reliability + audit
- Compliance flows
- Multi-country rollout
- Currency/language scaling

### Wave 7 — Predictive & ML Differentiation
- CatBoost matching model
- Salary intelligence
- Churn prediction
- Advanced fraud detection
- Optimization + conversational AI at scale

---

## 16. KPI Framework

### Candidate Marketplace
- Organic traffic growth
- Visit → vacancy detail → apply start → apply complete
- Favorites/alerts retention
- Geo-based applications share

### Employer Operations
- Employer WAU
- Login → useful action
- Publish → first contact
- Time to first response
- Backlog aging
- Share of processed responses
- Vacancy health improvement adoption

### Commerce
- Attach rate of paid products
- Branding / promotion adoption
- Candidate DB usage
- Entitlement utilization
- Expansion revenue

### Intelligence
- Task inbox engagement
- Automation adoption
- Talent hub reuse rate
- Semantic search usage
- Value report consumption
- AI-assisted flow completion

---

# ЧАСТЬ VIII — CLAUDE CODE IMPLEMENTATION GUIDE

---

## 17. Правила реализации

### 17.1 Source of Truth Order (при конфликтах)

1. Текущий код и фактическая структура repo
2. CLAUDE.md
3. Этот документ (v6.0 Final TZ)

### 17.2 Canonical Rules

- Проект развивается как continuation, не greenfield
- Не делать downgrade зависимостей без причины
- Расширять существующие модули, не переписывать
- Inspect existing code before changing architecture
- Ship vertical slices, include tests
- Copy the principle from competitors, adapt UX to blue-collar Central Asia

### 17.3 Чего НЕ делать

- Копия Avery без адаптации к blue-collar
- Employer UX, ломающий Telegram-first candidate funnel
- Зависимость от LinkedIn как главного источника
- AI features без measurable operational value
- Enterprise screens без mobile branch-manager режима
- Desktop-first UI (мы mobile-first)
- Russian-only UX (мы uz-first + ru)

---

## 18. Claude Code Prompt Pack

### Prompt 0 — Canonical Repo Audit

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
2. Produce a gap report grouped by: public marketplace, employer operations, intelligence/AI, branding/commerce, gov/HRM/compliance, testing/CI/observability.
3. For each gap, classify: already implemented, partially implemented, missing, implemented but inconsistent.
4. Produce an implementation order with P0/P1/P2 priorities.
5. Then begin the highest-value P0 slice immediately.
```

### Prompt 1 — Public Marketplace Wave

```text
Implement Wave 1 for Verifix Jobs: the public candidate marketplace layer.

Scope: Public vacancy catalog, vacancy detail 2.0, company directory, category/city pages, map/nearby, phone-first auth, quick apply, favorites, saved searches, Telegram continuation, SEO foundations.

Constraints: Blue-collar Uzbekistan first. Mobile-first, budget Android, unstable networks. Telegram is primary, web is discovery.

Rules: Reuse existing vacancy, candidate, geo, notification, branding, search modules. Don't fork parallel architecture. Add tests for public search, apply flow, SEO endpoints.

Start by auditing what exists, then implement: public vacancy list → vacancy detail → apply action.
```

### Prompt 2 — Employer Operations Wave

```text
Implement Wave 2: employer operations layer.

Scope: Operations dashboard, vacancy board, vacancy health, response inbox, candidate DB search 2.0, recruiter/account ops, civility score, vacancy templates, bump, auto-search.

Principle: Don't copy HH density. Keep workflows powerful but cleaner, faster, mobile-friendly.

Rules: Reuse existing dashboard, vacancy list, pipeline, analytics, billing, candidate search. Extend, don't rewrite. Add vacancy_health_snapshot, recruiter_workload_snapshot, civility_score_snapshot entities.

Start with: dashboard → vacancy board → vacancy health → response inbox → candidate DB.
```

### Prompt 3 — Automation & AI Wave

```text
Implement Wave 3: automation and AI-assisted hiring layer.

Scope: Automation hub, AI intake, AI sourcing, AI outreach, AI screening, task inbox, activity feed.

Constraints: Human-in-the-loop always. Telegram/SMS primary channels. Candidate UX stays lightweight.

Entities: ai_agent_run, ai_agent_action, ai_screening_result, employer_task, activity_event, automation_rule, automation_execution_log.

Order: Task inbox → activity feed → automation hub → AI intake → AI outreach/screening → AI sourcing.
```

### Prompt 4 — Employer Intelligence Wave

```text
Implement Wave 4: employer intelligence layer.

Scope: Hiring project, talent hub, organization memory, power centre, value/ROI report, semantic search, market intelligence.

Rule: Inspired by Avery but adapted for mass-hiring, blue-collar, Telegram-first, Central Asia.

Entities: hiring_project, talent_hub_candidate, talent_list, organization_memory, org_memory_fact, value_report_snapshot, intelligence_signal, semantic embeddings.

Order: Hiring project → talent hub → org memory → intelligence dashboard → power centre → ROI report → semantic search.
```

### Prompt 5 — Branding & Commerce Wave

```text
Implement Wave 5: branding, storefront, and growth layer.

Scope: Branding tiers (Basic/Branded/Premium), branded pages, storefront, entitlements, promotion packages, Telegram channel autoposting, referral growth loops.

Rules: Reuse existing branding, billing, payment, analytics, notification modules. Keep package accounting explicit and auditable.

Start with: entitlement visibility → premium branding pages → promotion mechanics → autoposting → referral growth.
```

### Prompt 6 — Gov/HRM/Compliance Wave

```text
Implement Wave 6: ecosystem and regulatory layer.

Scope: HRM bridge hardening, gov sync reliability, consent management, data export/deletion, regional config, currency/language scaling, reporting.

Rules: Idempotency and traceability for all external sync. Minimal sensitive data storage. Audit logs + retry + failure visibility.

Order: Auditability/sync hardening → compliance flows → regional config → legal/document integration.
```

### Prompt 7 — QA & Security Pass

```text
Production-readiness pass for Verifix Jobs.

Scope: Unit tests for core services, integration tests (Testcontainers), security tests (auth, OTP, tenant isolation, contact reveal), Liquibase validation, CI/CD pipeline, monitoring/health endpoints, docs update.

Rules: Focus on real risks. No placeholder tests. Cover marketplace, employer ops, integration boundaries.

Output: Failing risks list → fixes → updated tests → release checklist.
```

### Prompt 8 — Final Consolidation Review

```text
Final architectural and product consistency review.

Check: Does repo match canonical spec? Are marketplace, employer ops, intelligence, commerce, ecosystem layers coherent? Duplicate concepts? Parallel architectures? API/UI/events aligned? Docs accurate?

Output: Findings by severity → missing tests → tech debt → change summary.

Stance: Prioritize bugs, regressions, security, operational gaps over style commentary.
```

---

# ЧАСТЬ IX — ЗАКЛЮЧЕНИЕ

---

## 19. Canonical Target State

`Verifix Jobs` = IshGO marketplace + HeadHunter operations + GetAvery intelligence + собственные преимущества (Telegram + MyID + geo + HRM + gov + mass hiring + Central Asia localization).

Это не копия ни одного конкурента. Это уникальная комбинация лучших практик, адаптированная под blue-collar рынок Центральной Азии.

---

> **Этот документ является единственным каноническим источником требований для проекта Verifix Jobs. Все предыдущие документы (v1.0–v5.0, competitor analyses, improvement TZs) считаются superseded и могут быть удалены.**
