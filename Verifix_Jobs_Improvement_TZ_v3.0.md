# Verifix Jobs — ТЗ на улучшение v3.0
# На основе анализа конкурента GetAvery (getavery.ai)

> **Дата:** 24.03.2026
> **Версия:** 3.0
> **Основание:** Конкурентный анализ GetAvery + текущее состояние Verifix Jobs

---

## 1. КОНКУРЕНТНЫЙ АНАЛИЗ: GetAvery

### 1.1 Что такое GetAvery
AI-платформа для найма (Нидерланды, 2024). Основатель — Alisher Jafarov (ex-Heineken, Colgate, Carlsberg). Целевая аудитория — рекрутеры, TA-команды, кадровые агентства. Фокус на white-collar найм в Европе.

### 1.2 Ключевые фишки GetAvery

| Фича | Описание | Применимость к Verifix |
|-------|----------|----------------------|
| **Agentic Mode** | AI-агент автоматизирует sourcing, outreach, screening, интервью, отказы. Рекрутер может включать/выключать и вставлять "human checkpoints" | **ВЫСОКАЯ** — адаптировать для массового найма |
| **Semantic Search** | Контекстный поиск кандидатов (не по ключевым словам, а по смыслу) | **ВЫСОКАЯ** — улучшить наш Elasticsearch |
| **База 60M+ кандидатов** | Агрегация из LinkedIn, ATS, открытых источников | **СРЕДНЯЯ** — у нас своя база + Telegram |
| **ATS-интеграции** | Greenhouse, Workable, Teamtailor, Recruitee — двусторонняя синхронизация | **СРЕДНЯЯ** — у нас HRM Bridge |
| **Bias Reduction** | Алгоритм оценивает только компетенции, игнорирует внешность и пол | **ВЫСОКАЯ** — актуально для ЦА |
| **Market Intelligence** | AI-агент "Mark" — анализ рынка, зарплат, конкуренции за кандидатов | **ВЫСОКАЯ** — расширить SalaryPrediction |
| **Batch Outreach** | Массовая рассылка через email + LinkedIn InMail | **ВЫСОКАЯ** — адаптировать для Telegram + SMS |
| **ROI Calculator** | Калькулятор возврата инвестиций для работодателей | **СРЕДНЯЯ** — хороший sales-инструмент |
| **Activity Feed** | Лента активности в реальном времени | **ВЫСОКАЯ** — отсутствует у нас |
| **Task Inbox** | Приоритизированный список задач для рекрутера | **ВЫСОКАЯ** — отсутствует у нас |
| **Video Interview** | AI-интервью с кандидатами | **НИЗКАЯ** — blue-collar не подходит формат |
| **Intake Agent** | AI валидирует требования вакансии перед публикацией | **ВЫСОКАЯ** — уменьшит модерацию |

### 1.3 Ценообразование GetAvery

| План | Цена | Лимиты |
|------|------|--------|
| Start | €299/мес | 1 юзер, 2 активных вакансии, 24/год |
| Crew | €11,999/год | 9 юзеров, 15 активных, 100/год |
| Tribe | €19,999/год | 15 юзеров, 25 активных, 200/год |

### 1.4 Что у GetAvery слабо / чего нет
- Нет фокуса на blue-collar / массовый найм
- Нет Telegram-интеграции
- Нет гос. интеграций
- Нет геолокации (расстояние до работы)
- Нет реферальной системы
- Нет мобильного UX для кандидатов на бюджетных устройствах
- Нет поддержки рынков ЦА (языки, KYC, платежные системы)

---

## 2. ПЛАН УЛУЧШЕНИЙ VERIFIX JOBS

### Приоритизация: P0 = критично, P1 = важно, P2 = желательно

---

### 2.1 AI AGENTIC MODE для работодателей [P0]

**Вдохновлено:** GetAvery Agentic Mode
**Суть:** AI-помощник для работодателей, автоматизирующий рутину массового найма

#### 2.1.1 Intake Agent — Умный помощник создания вакансии
- При создании вакансии AI анализирует введённые данные и предлагает:
  - Оптимальный диапазон зарплат (на основе `SalaryPredictionService`)
  - Корректировки требований (завышенные/заниженные для категории)
  - Рекомендации по описанию (на основе лучших вакансий в категории)
  - Предсказание количества откликов и time-to-fill
- Автоматическая валидация перед публикацией (снижение нагрузки на модерацию)
- **Технология:** Claude API → `AiIntakeAgentService`
- **Endpoint:** `POST /api/v1/ai/intake/validate`
- **Интеграция:** встроить в Vacancy Editor Wizard (шаг 5 — превью)

#### 2.1.2 Sourcing Agent — Автоматический поиск кандидатов
- AI анализирует вакансию и автоматически подбирает кандидатов из базы
- Использует `CandidateMatchingService` + семантический поиск
- Формирует shortlist с scoring и обоснованием каждого кандидата
- Работодатель может одобрить/отклонить каждого кандидата
- **Agentic toggle:** вкл/выкл автоматической работы агента
- **Endpoint:** `POST /api/v1/ai/sourcing/run`, `GET /api/v1/ai/sourcing/{vacancyId}/results`

#### 2.1.3 Outreach Agent — Массовое приглашение кандидатов
- После одобрения shortlist — автоматическая рассылка приглашений
- Каналы: Telegram (приоритет), SMS (фоллбэк)
- AI генерирует персонализированные сообщения для каждого кандидата
- Настраиваемые шаблоны с переменными
- Батч-отправка с учётом `NotificationOptimizer` (оптимальное время)
- **Human checkpoint:** работодатель может просмотреть сообщения перед отправкой
- **Endpoint:** `POST /api/v1/ai/outreach/send-batch`

#### 2.1.4 Screening Agent — Автоматический первичный скрининг
- AI-бот в Telegram задаёт кандидатам уточняющие вопросы:
  - Готовность начать работу (дата)
  - Наличие документов / медкнижки
  - Подтверждение графика и зарплаты
  - Простые квалификационные вопросы (опыт, навыки)
- Результаты скрининга — в карточке кандидата в ATS Pipeline
- Статусы: PASSED / FAILED / NEEDS_REVIEW
- **Endpoint:** `POST /api/v1/ai/screening/{applicationId}/start`

#### Новые entities:
```
ai_agent_run (id, employer_id, vacancy_id, agent_type, status, config_json, results_json, created_at)
ai_agent_action (id, run_id, action_type, target_candidate_id, status, message, created_at)
ai_screening_result (id, application_id, questions_json, answers_json, score, verdict, created_at)
```

#### Новые сервисы:
```
service/ai/
├── AiIntakeAgentService.java
├── AiSourcingAgentService.java
├── AiOutreachAgentService.java
├── AiScreeningAgentService.java
├── AiAgentOrchestrator.java       # управление включением/выключением агентов
└── AiMessageGenerator.java        # генерация персонализированных сообщений
```

---

### 2.2 СЕМАНТИЧЕСКИЙ ПОИСК [P0]

**Вдохновлено:** GetAvery Semantic Search (+20-30% улучшение пула кандидатов)
**Суть:** Замена keyword-based поиска на семантический

#### 2.2.1 Для работодателей — поиск кандидатов
- Поиск по смыслу, а не по точным ключевым словам
- "Повар" должен находить "шеф-повар", "кондитер", "пекарь" (связанные профессии)
- Учёт синонимов на узбекском, русском, кириллице/латинице
- **Реализация:** Elasticsearch + embeddings (multilingual-e5-large или аналог)
- **Новый сервис:** `SemanticSearchService`

#### 2.2.2 Для кандидатов — поиск вакансий
- В Telegram: свободный текст "ищу работу повара рядом с домом"
- AI парсит: профессия=повар, локация=рядом, и формирует запрос
- Комбинация: семантика + геолокация + зарплатные ожидания
- **Интеграция:** `AiChatbotService` + `SemanticSearchService` + `GeoService`

#### Технические задачи:
- [ ] Развернуть embedding-модель (Python FastAPI или ONNX в Java)
- [ ] Индексировать вакансии и профили кандидатов с embeddings
- [ ] Создать `SemanticSearchService` с fallback на keyword search
- [ ] Обновить `VacancySearchService` и `CandidateSearchService`
- [ ] Поддержка мультиязычности: uz_lat, uz_cyr, ru, en

---

### 2.3 REAL-TIME ACTIVITY FEED [P0]

**Вдохновлено:** GetAvery Activity Feed (январь 2025)
**Суть:** Лента событий в реальном времени для работодателей

#### Функциональность:
- Новые отклики на вакансии (с аватаром, именем, профессией)
- Изменения статусов заявок
- Результаты AI-скрининга
- Истечение срока вакансий
- Достижение лимитов (план, вакансии)
- Реферальные начисления
- Системные уведомления

#### Техническая реализация:
- **Backend:** Server-Sent Events (SSE) через Spring WebFlux
- **Frontend:** Angular EventSource → NgRx Store
- **Persistence:** Redis Streams для буферизации + PostgreSQL для истории
- **Endpoint:** `GET /api/v1/feed/stream` (SSE), `GET /api/v1/feed/history` (paginated)

#### Новые entities:
```
activity_event (id, employer_id, event_type, title, body_json, is_read, created_at)
```

#### Новые сервисы:
```
service/feed/
├── ActivityFeedService.java        # публикация и чтение событий
├── ActivityFeedSseEmitter.java     # SSE-стриминг
└── ActivityEventPublisher.java     # Kafka → Activity Feed
```

---

### 2.4 TASK INBOX для работодателей [P1]

**Вдохновлено:** GetAvery Task Inbox (декабрь 2024)
**Суть:** Приоритизированный список задач / to-do для рекрутера

#### Функциональность:
- Автоматически генерируемые задачи:
  - "Просмотрите 15 новых откликов на вакансию Продавец"
  - "Вакансия Курьер истекает через 3 дня — продлите или закройте"
  - "5 кандидатов ожидают скрининг-звонка"
  - "Пора обновить описание вакансии (низкая конверсия)"
- AI-приоритизация задач (urgency + impact)
- Mark as done / snooze / dismiss
- Интеграция с ATS Pipeline

#### Endpoint:
- `GET /api/v1/tasks` (с фильтрами: priority, type, status)
- `PATCH /api/v1/tasks/{id}` (обновление статуса)

#### Новые entities:
```
employer_task (id, employer_id, vacancy_id, task_type, priority, title, description, status, due_date, created_at, completed_at)
```

---

### 2.5 MARKET INTELLIGENCE — Аналитика рынка [P1]

**Вдохновлено:** GetAvery Market Intelligence Agent "Mark"
**Суть:** Расширение текущего `SalaryPredictionService` до полноценной рыночной аналитики

#### 2.5.1 Salary Intelligence (расширение существующего)
- Текущее: p25, median, p75 по категории/городу
- **Добавить:**
  - Динамика зарплат за последние 3/6/12 месяцев (тренд)
  - Сравнение зарплаты вакансии с рынком (ниже/в рынке/выше)
  - Рекомендации по зарплате для привлечения кандидатов
  - Виджет "Ваша зарплата vs рынок" в редакторе вакансий

#### 2.5.2 Competition Intelligence
- Количество активных вакансий в той же категории/городе
- Среднее количество откликов на аналогичные вакансии
- Время закрытия аналогичных вакансий (time-to-fill benchmark)
- Индекс конкуренции за кандидатов (высокий/средний/низкий)

#### 2.5.3 Candidate Supply Dashboard
- Количество активных кандидатов по профессиям/городам
- Карта предложения: где много/мало кандидатов
- Прогноз доступности (сезонность: весна — стройка, лето — HoReCa)

#### Endpoint:
- `GET /api/v1/intelligence/salary?category=X&city=Y`
- `GET /api/v1/intelligence/competition?category=X&city=Y`
- `GET /api/v1/intelligence/supply?category=X&city=Y`

#### Новые сервисы:
```
service/intelligence/
├── MarketIntelligenceService.java
├── CompetitionAnalyzer.java
├── CandidateSupplyAnalyzer.java
└── SalaryTrendService.java          # расширение SalaryPredictionService
```

---

### 2.6 УЛУЧШЕНИЕ ATS PIPELINE [P1]

**Вдохновлено:** GetAvery Candidate Review Screen
**Суть:** Ускорение обработки откликов для массового найма

#### 2.6.1 Quick Review Mode
- Swipe-интерфейс для быстрого просмотра кандидатов (approve/reject/maybe)
- Мобильная версия: свайп влево/вправо (как Tinder)
- Десктоп: горячие клавиши (A = approve, R = reject, S = skip)
- AI-подсказки: "Этот кандидат подходит на 87% потому что..."

#### 2.6.2 Bulk Actions 2.0
- Текущее: bulk invite, reject, import
- **Добавить:**
  - Bulk SMS/Telegram с персонализацией
  - Bulk перенос между стадиями пайплайна
  - Bulk назначение на интервью (выбор слота)
  - Фильтры для выделения (по score, городу, опыту)

#### 2.6.3 Candidate Card Enhancements
- Match Score (%) с обоснованием
- Расстояние до места работы (из PostGIS)
- Статус верификации MyID
- История откликов (на другие вакансии этого работодателя)
- AI-саммари профиля (1-2 предложения)
- Пометки рекрутера (notes, tags)

---

### 2.7 BIAS REDUCTION SYSTEM [P1]

**Вдохновлено:** GetAvery Bias Reduction Algorithm
**Суть:** Снижение предвзятости при найме (актуально для ЦА — гендер, регион, этнос)

#### Функциональность:
- Опция "Анонимный просмотр" — скрывает фото, пол, возраст, регион
- Оценка только по: опыт, навыки, квалификация, верификация
- Аналитика bias: статистика отказов по полу/возрасту/региону
- Отчёт для compliance: распределение нанятых по демографии
- **Настройка:** включается работодателем в настройках вакансии

#### Endpoint:
- `PATCH /api/v1/vacancies/{id}/settings` (anonymous_review: true/false)
- `GET /api/v1/analytics/bias-report`

---

### 2.8 ROI CALCULATOR [P2]

**Вдохновлено:** GetAvery ROI Calculator
**Суть:** Инструмент для работодателей — расчёт экономии от использования Verifix

#### Входные параметры:
- Количество вакансий в месяц
- Средний time-to-fill сейчас (дней)
- Стоимость одного рекрутера
- Процент текучести
- Стоимость замены сотрудника

#### Выходные метрики:
- Экономия времени (часы/месяц)
- Снижение cost-per-hire
- Экономия на текучести (с referral-программой)
- Окупаемость подписки Verifix (месяцев)

#### Реализация:
- Frontend-виджет (Angular) на лендинге + внутри дашборда
- Backend: `GET /api/v1/calculator/roi` с параметрами
- **Новый сервис:** `RoiCalculatorService`

---

### 2.9 УЛУЧШЕНИЕ TELEGRAM BOT [P0]

**Суть:** Telegram — основной канал (65%), нужно максимально усилить

#### 2.9.1 AI Chatbot (доработка текущего)
- Текущее: Claude API integration (skeleton)
- **Реализовать полностью:**
  - Свободный диалог: "Ищу работу повара в Ташкенте от 3 млн"
  - AI парсит intent → формирует поисковый запрос
  - Подбирает и показывает вакансии в формате карусели
  - Follow-up вопросы: "А ещё ближе к метро Чиланзар?"
  - Помощь с заполнением профиля: "Расскажи о своём опыте" → AI структурирует
  - FAQ: "Как работает реферальная программа?"

#### 2.9.2 Smart Notifications
- Текущее: базовые уведомления
- **Добавить:**
  - "Горячие" вакансии (новые, подходящие, рядом) — push утром
  - Напоминание завершить профиль (с подсказками)
  - Статус заявки изменился — мгновенное уведомление
  - "X компаний посмотрели ваш профиль" (мотивация)
  - Еженедельный дайджест с персональными рекомендациями

#### 2.9.3 Mini App Enhancements
- Карта вакансий рядом (OpenStreetMap + PostGIS)
- Swipe-карточки вакансий (влево = пропустить, вправо = откликнуться)
- Прогресс-бар заполнения профиля
- Рейтинг кандидата (gamification)

---

### 2.10 EMPLOYER ONBOARDING [P1]

**Вдохновлено:** GetAvery — setup за "минуты", guided onboarding
**Суть:** Упрощение первого опыта для работодателей

#### Функциональность:
- Guided Tour (step-by-step) при первом входе
- Setup Wizard: профиль компании → первая вакансия → приглашение менеджеров
- Template Gallery: готовые шаблоны вакансий по категориям
  - "Продавец-консультант" — шаблон с типовым описанием, требованиями, зарплатой
  - "Курьер" — шаблон
  - "Повар" — шаблон
  - (50+ шаблонов для популярных blue-collar позиций)
- Onboarding checklist с прогрессом (0% → 100%)
- AI-помощник: "Хотите, я помогу создать первую вакансию?"

#### Новые entities:
```
vacancy_template (id, category, title, description_template, requirements_json, salary_min, salary_max, language, is_active)
onboarding_progress (id, employer_id, step, completed, completed_at)
```

---

### 2.11 CHANGELOG / PRODUCT UPDATES [P2]

**Вдохновлено:** GetAvery Changelog
**Суть:** Публичная страница обновлений продукта

#### Функциональность:
- Страница /changelog с хронологией обновлений
- Уведомление о новых фичах в дашборде ("NEW" badge)
- В Telegram: команда /whatsnew
- Popup при входе: "Новое! Теперь доступен AI-скрининг"

---

### 2.12 РАСШИРЕНИЕ ПОДПИСОК [P1]

**Вдохновлено:** Pricing-модель GetAvery
**Суть:** Доработать текущие тарифы с учётом AI-функций

#### Обновлённые тарифы:

| | FREE | STANDARD | PREMIUM | ENTERPRISE |
|--|------|----------|---------|------------|
| Цена | 0 UZS | 990,000 UZS/мес | 2,990,000 UZS/мес | Индивидуально |
| Активные вакансии | 2 | 10 | 50 | Безлимит |
| Пользователи | 1 | 3 | 10 | Безлимит |
| AI Intake Agent | - | 5 запусков/мес | Безлимит | Безлимит |
| AI Sourcing Agent | - | - | 20 запусков/мес | Безлимит |
| AI Outreach Agent | - | - | 10 кампаний/мес | Безлимит |
| AI Screening Agent | - | - | 100 скринингов/мес | Безлимит |
| Market Intelligence | Базовая | Полная | Полная + экспорт | Полная + API |
| Bias Report | - | - | Да | Да |
| Branding Page | - | Basic | Premium | Custom |
| Task Inbox | - | Да | Да | Да |
| Activity Feed | - | Да | Да | Да |
| Gov Integration | - | - | - | Да |
| Dedicated Support | - | Email 48h | Chat 24h | Менеджер |

---

## 3. ТЕХНИЧЕСКИЙ ПЛАН РЕАЛИЗАЦИИ

### Phase 5: AI & Intelligence (Weeks 37-48)

#### Sprint 19-20 (Weeks 37-40): AI Foundation
- [ ] Развернуть embedding-модель для семантического поиска
- [ ] `SemanticSearchService` с индексацией embeddings в Elasticsearch
- [ ] `AiIntakeAgentService` — валидация вакансий через Claude API
- [ ] `ActivityFeedService` + SSE endpoint
- [ ] Entity: `ai_agent_run`, `ai_agent_action`, `activity_event`
- [ ] Liquibase changelog-009-ai-tables.xml

#### Sprint 21-22 (Weeks 41-44): Agentic Mode
- [ ] `AiSourcingAgentService` — автоподбор кандидатов
- [ ] `AiOutreachAgentService` — массовое приглашение через Telegram/SMS
- [ ] `AiScreeningAgentService` — бот-скрининг в Telegram
- [ ] `AiAgentOrchestrator` — управление toggle on/off
- [ ] AI Chatbot в Telegram — полная реализация диалогового поиска
- [ ] Entity: `ai_screening_result`, `employer_task`
- [ ] Quick Review Mode в ATS Pipeline (frontend)

#### Sprint 23-24 (Weeks 45-48): Intelligence & Polish
- [ ] `MarketIntelligenceService` — конкуренция, предложение, тренды
- [ ] `BiasReductionService` — анонимный просмотр + аналитика
- [ ] Task Inbox — backend + frontend
- [ ] Employer Onboarding Wizard + Template Gallery
- [ ] Entity: `vacancy_template`, `onboarding_progress`
- [ ] Обновление подписок (AI-лимиты в `PricingPlan`)
- [ ] ROI Calculator (frontend + backend)
- [ ] Changelog страница

---

## 4. НОВЫЕ МОДУЛИ И ФАЙЛЫ

### Backend (verifix-jobs-service)
```
service/
├── ai/                          # СУЩЕСТВУЕТ (расширить)
│   ├── AiChatbotService.java    # СУЩЕСТВУЕТ (доработать)
│   ├── AiIntakeAgentService.java      # НОВЫЙ
│   ├── AiSourcingAgentService.java    # НОВЫЙ
│   ├── AiOutreachAgentService.java    # НОВЫЙ
│   ├── AiScreeningAgentService.java   # НОВЫЙ
│   ├── AiAgentOrchestrator.java       # НОВЫЙ
│   └── AiMessageGenerator.java        # НОВЫЙ
├── intelligence/                # НОВЫЙ пакет
│   ├── MarketIntelligenceService.java
│   ├── CompetitionAnalyzer.java
│   ├── CandidateSupplyAnalyzer.java
│   └── SalaryTrendService.java
├── feed/                        # НОВЫЙ пакет
│   ├── ActivityFeedService.java
│   ├── ActivityFeedSseEmitter.java
│   └── ActivityEventPublisher.java
├── task/                        # НОВЫЙ пакет
│   └── EmployerTaskService.java
├── search/                      # СУЩЕСТВУЕТ (расширить)
│   └── SemanticSearchService.java     # НОВЫЙ
├── onboarding/                  # НОВЫЙ пакет
│   ├── OnboardingService.java
│   └── VacancyTemplateService.java
└── bias/                        # НОВЫЙ пакет
    └── BiasReductionService.java
```

### Backend (verifix-jobs-api)
```
controller/
├── AiAgentController.java             # НОВЫЙ — все AI-agent endpoints
├── ActivityFeedController.java        # НОВЫЙ — SSE + history
├── EmployerTaskController.java        # НОВЫЙ — task inbox
├── MarketIntelligenceController.java  # НОВЫЙ — market data
├── RoiCalculatorController.java       # НОВЫЙ
├── OnboardingController.java          # НОВЫЙ — wizard + templates
├── BiasController.java                # НОВЫЙ — bias settings + report
└── ChangelogController.java           # НОВЫЙ
```

### Database (новые таблицы)
```sql
-- AI Agent System
ai_agent_run
ai_agent_action
ai_screening_result

-- Activity & Tasks
activity_event
employer_task

-- Onboarding & Templates
vacancy_template
onboarding_progress

-- Changelog
product_changelog
```

### Frontend (verifix-jobs-web)
```
features/
├── ai-agents/                   # НОВЫЙ модуль
│   ├── agent-settings/          # Toggle on/off для каждого агента
│   ├── sourcing-results/        # Результаты подбора
│   ├── outreach-campaign/       # Настройка и запуск рассылки
│   └── screening-results/       # Результаты скрининга
├── feed/                        # НОВЫЙ модуль — Activity Feed
├── tasks/                       # НОВЫЙ модуль — Task Inbox
├── intelligence/                # НОВЫЙ модуль — Market Intelligence
│   ├── salary-widget/
│   ├── competition-widget/
│   └── supply-map/
├── pipeline/                    # СУЩЕСТВУЕТ (расширить)
│   ├── quick-review/            # НОВЫЙ — swipe mode
│   └── candidate-card/          # расширить (score, distance, AI-summary)
├── onboarding/                  # НОВЫЙ модуль
│   ├── setup-wizard/
│   ├── template-gallery/
│   └── guided-tour/
├── calculator/                  # НОВЫЙ — ROI Calculator
└── changelog/                   # НОВЫЙ
```

---

## 5. МЕТРИКИ УСПЕХА

| Метрика | Текущее (оценка) | Цель после v3.0 |
|---------|------------------|------------------|
| Time-to-fill | 14 дней | 5-7 дней |
| Отклики на вакансию | 10-20 | 30-50 |
| Конверсия отклик→найм | 5% | 15% |
| Время обработки откликов | 2-3 дня | < 4 часов |
| Employer retention (3 мес) | — | > 70% |
| Candidate engagement (weekly) | — | > 40% |
| Заполнение профилей | 30% | 60% |
| NPS работодателей | — | > 50 |

---

## 6. РИСКИ И МИТИГАЦИИ

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Высокая стоимость Claude API | Высокая | Кэширование, rate limiting, лимиты по тарифам, переход на lighter модели для простых задач |
| Качество семантического поиска на узбекском | Средняя | Фоллбэк на keyword search, fine-tuning embedding-модели, словари синонимов |
| Кандидаты не понимают AI-скрининг | Средняя | Простые вопросы, кнопки вместо текста, объяснение "это бот" |
| Перегрузка Telegram API при массовой рассылке | Средняя | Очередь через Kafka, rate limiting 30 msg/sec, приоритизация |
| Работодатели не используют AI-фичи | Низкая | Onboarding, tutorials, бесплатный trial premium |

---

## 7. ЗАВИСИМОСТИ

- **Claude API** — для всех AI-агентов и chatbot
- **Embedding Model** — multilingual-e5-large или аналог (нужен GPU или API)
- **Elasticsearch 8.12+** — kNN vector search для embeddings
- **Kafka** — для Activity Feed и async AI-задач
- **Redis** — для SSE и кэширования AI-ответов

---

## 8. ОЦЕНКА ТРУДОЗАТРАТ

| Блок | Backend | Frontend | ML/AI | Итого |
|------|---------|----------|-------|-------|
| AI Agentic Mode | 3 нед | 2 нед | 1 нед | 6 нед |
| Semantic Search | 2 нед | 0.5 нед | 1 нед | 3.5 нед |
| Activity Feed | 1 нед | 1 нед | — | 2 нед |
| Task Inbox | 1 нед | 1 нед | — | 2 нед |
| Market Intelligence | 1.5 нед | 1.5 нед | — | 3 нед |
| ATS Improvements | 1 нед | 2 нед | — | 3 нед |
| Bias Reduction | 1 нед | 0.5 нед | — | 1.5 нед |
| Onboarding + Templates | 1 нед | 1.5 нед | — | 2.5 нед |
| ROI Calculator | 0.5 нед | 1 нед | — | 1.5 нед |
| Telegram Bot AI | 2 нед | 1 нед | 1 нед | 4 нед |
| Subscriptions Update | 0.5 нед | 0.5 нед | — | 1 нед |
| Changelog | 0.5 нед | 0.5 нед | — | 1 нед |
| **ИТОГО** | **15.5 нед** | **12.5 нед** | **3 нед** | **~31 нед** |

> При параллельной работе backend + frontend: **~16 недель** (4 спринта по 4 недели)
