# Конкурентный анализ GetAvery (getavery.ai) и ТЗ на улучшение Verifix Jobs

**Дата:** 24 марта 2026
**Автор:** Claude Code (автоматический анализ)
**Объект:** getavery.ai — AI-powered talent sourcing platform
**Цель:** Выявить AI/UX инновации конкурента, адаптировать для Verifix Jobs (blue-collar рынок Центральной Азии)

---

## 1. Анализ конкурента GetAvery

### 1.1 Общая информация
- **URL:** getavery.ai (landing) + app.getavery.ai (app)
- **Позиционирование:** AI-powered talent sourcing & evaluation platform для рекрутеров
- **Целевая аудитория:** HR/рекрутеры компаний, ищущие white-collar специалистов глобально
- **База:** 60M+ professionals (vetted and evaluated)
- **Клиенты:** VERIFIX, Green White, Technix, Sicuritalia, Heineken, TenMonks, PepsiCo и др.
- **Бизнес-модель:** Freemium (Start for free) + платные тарифы
- **Домен аккаунта:** smartup24.com (Smartup Holding)

### 1.2 Сильные стороны

#### S1. Natural Language AI Search (NLP-first подход)
- **На landing page:** Большое текстовое поле "I am looking for..." — пользователь описывает роль на естественном языке
- **Кнопка:** "Find candidates" → AI мгновенно подбирает кандидатов
- **В app:** "Or describe the role you're hiring for..." — то же в авторизованной зоне
- **Преимущество:** Нет формов с 20 полями. Один текстовый промпт = мгновенные результаты

#### S2. Три способа создания Hiring Project
1. **Paste public URL** — вставить ссылку из ATS или career page (AI парсит JD)
2. **Upload document** — загрузить JD или транскрипт (AI извлекает требования)
3. **Natural language** — описать роль текстом
- **Преимущество:** Любой input → AI создаёт структурированный профиль вакансии

#### S3. Avery Agent (Agentic Mode) — AI-автопилот найма
Модульная система AI-агентов с toggle on/off:
- **AI outreach** — автоматическая рассылка кандидатам (email + LinkedIn InMail)
- **AI video interview** — AI проводит видео-интервью с кандидатами
- **AI phone interview** — AI проводит телефонное интервью
- **Request human input** — human-in-the-loop (AI запрашивает решение рекрутера)
- **Дашборд агента:** 280 candidates, 46 shortlisted, "Last active 2 days ago"
- **Преимущество:** Рекрутер включает автопилот и получает готовые shortlists

#### S4. Auto-evaluate кандидатов
- AI оценивает кандидатов "10x faster than your regular Recruiter"
- "Great match" badge (зелёный) на карточках кандидатов
- Избавляет от bias — контекстное понимание вместо keyword matching
- Карточка кандидата: фото, имя, должность, компания, контактные иконки (phone, email, social, LinkedIn)

#### S5. Company Intelligence (BETA)
- "Add competitor" — добавить конкурента для отслеживания
- Intelligence по компании (для smartup24.com: "currently unavailable")
- **Концепция:** Знать, какие таланты есть у конкурентов

#### S6. Talent Hub (gamification unlock)
- "40/100 candidates shortlisted" — прогресс-бар разблокировки
- Стимулирует активное использование платформы
- Альтернатива: Connect ATS для мгновенного разблокирования
- **Преимущество:** Геймификация + product-led growth

#### S7. Intelligence Level система
- "Intelligence Level 1" — виден в header приложения
- Визуальный индикатор прогресса (progress bars)
- Мотивирует пользователя совершать действия для повышения уровня

#### S8. Интеграции (Outreach + ATS)
**Outreach Integrations:**
- Email (Gmail/Outlook) — отправка персонализированных писем
- LinkedIn — подключение аккаунта для InMail

**ATS Connections (6+):**
- Recruitee (полная интеграция)
- TeamTailor (On Demand)
- Workday (On Demand)
- Greenhouse (On Demand)
- Ashby (On Demand)
- BambooHR (On Demand)

#### S9. UI/UX — минималистичный, AI-first дизайн
- **Цветовая схема:** Purple/Indigo (#5B5BFF) + gradient (purple→pink→blue)
- **Навигация:** Иконки слева (6 пунктов): Home, Inbox, Talent Hub, Chat, Integrations, Calendar
- **Dashboard:** Персонализированное приветствие + action items + hiring projects
- **Типографика:** Крупные bold заголовки, много whitespace
- **CTA:** "Start for free →" — фиолетовая кнопка в header

#### S10. Мульти-канальная коммуникация
- "Emails and LinkedIn InMail, all-in-one" — из одного интерфейса
- Inbox для входящих ответов кандидатов
- Timeline переписки с каждым кандидатом

#### S11. Landing Page — конверсионный дизайн
- Hero: NLP search прямо на landing (можно попробовать без регистрации)
- Client logos: Verifix, Green White, Technix, Heineken, PepsiCo
- Video testimonial
- Глобальная карта с точками кандидатов
- 3 value props в карточках: ATS connect, 60M talent, Fast search
- Секции: Search → Auto-evaluate → Outreach
- Social proof с карточками кандидатов
- Support chat: AI Answers + Help docs + Email

### 1.3 Слабые стороны

#### W1. Не подходит для blue-collar рынка
- Ориентирован на white-collar: Data Scientist, DevOps Lead, AI Researcher
- Нет поддержки узбекского/русского языка
- Нет интеграции с Telegram
- Нет SMS-канала
- Нет геолокации для blue-collar поиска

#### W2. Нет job board (только sourcing)
- Это инструмент РЕКРУТЕРА для поиска кандидатов
- Кандидаты не могут сами найти вакансии и откликнуться
- Нет публичного каталога вакансий
- Односторонний маркетплейс

#### W3. Зависимость от внешних данных
- 60M professionals из LinkedIn и других открытых источников
- Нет собственной базы blue-collar кандидатов
- Для ЦА-рынка данные будут крайне скудными

#### W4. Ценообразование непрозрачно
- Pricing page не найден
- "Book a demo" → sales-driven модель
- Нет self-service pricing

#### W5. Нет мобильного приложения
- Только web-app
- Нет Telegram bot для кандидатов
- Нет PWA

#### W6. Company Intelligence в BETA
- Функция мониторинга конкурентов ещё не работает полностью
- "Currently unavailable for smartup24.com"

#### W7. Нет локализации
- Только английский интерфейс
- Нет поддержки кириллицы в поиске

### 1.4 Уникальные особенности GetAvery

| Фича | Описание | Релевантность для Verifix Jobs |
|-------|----------|-------------------------------|
| NLP Search | Natural language описание → AI ищет кандидатов | ВЫСОКАЯ — адаптировать для поиска вакансий кандидатами |
| Avery Agent | AI-автопилот: outreach, interview, shortlist | СРЕДНЯЯ — адаптировать как AI Matching Agent |
| AI Video Interview | AI проводит видео-собеседование | НИЗКАЯ (blue-collar) — но AI phone screen возможен |
| AI Phone Interview | AI звонит и проводит скрининг | СРЕДНЯЯ — адаптировать для Telegram voice |
| URL/Doc → Project | Вставить URL или загрузить JD → AI создаёт проект | ВЫСОКАЯ — адаптировать для создания вакансий |
| Talent Hub | Геймифицированный пул кандидатов | СРЕДНЯЯ — адаптировать для реферальной системы |
| Intelligence Level | Прогресс-система для работодателей | ВЫСОКАЯ — геймификация активности |
| Company Intelligence | Мониторинг конкурентов | НИЗКАЯ — не релевантно для blue-collar |
| ATS Integrations | 6+ ATS интеграций | СРЕДНЯЯ — Verifix HRM вместо внешних ATS |
| Email + LinkedIn | Мульти-канальный outreach | СРЕДНЯЯ — Telegram + SMS вместо email/LinkedIn |

---

## 2. Рекомендации по улучшению Verifix Jobs

### Приоритет 1 (Критично — AI-first подход)

#### P1-01. AI Natural Language Search для кандидатов (Telegram Chatbot)
- **Описание:** Кандидат пишет в Telegram-бот на естественном языке: "Kassirlik ishi kerak, Chilonzorda, oyiga 5 milliondan" → AI парсит и ищет подходящие вакансии
- **Обоснование:** GetAvery доказал, что NLP-search кратно эффективнее формовых фильтров. Blue-collar аудитория в ЦА предпочитает текстовое общение формам
- **Технология:** Claude API (уже в ТЗ Phase 4) → intent detection + entity extraction (city, category, salary, schedule) → Elasticsearch query
- **Ожидаемый результат:** -70% времени на поиск вакансии, +50% к engagement в Telegram
- **Адаптация:** Вместо английского NLP → узбекский/русский. Вместо professional profiles → blue-collar позиции

#### P1-02. AI-генерация вакансий из описания (для работодателей)
- **Описание:** Работодатель описывает вакансию текстом или голосом → AI автоматически заполняет все поля: название, категория, зарплата, требования, бенефиты, график
- **Обоснование:** GetAvery позволяет создать hiring project из URL/документа/текста. Для mass-hiring HR, который постит 50+ вакансий, это game-changer
- **Три способа ввода (как у Avery):**
  1. Описать текстом: "Нужны 20 кассиров в Чилонзор, зп 4-5 млн, 2/2 график, еда+транспорт"
  2. Загрузить файл (Word/PDF с описанием)
  3. Вставить URL (с hh.uz или другого сайта)
- **Технология:** Claude API → structured output → auto-fill vacancy form
- **Ожидаемый результат:** -80% времени на создание вакансии

#### P1-03. AI Auto-Matching Score (Great Match бейдж)
- **Описание:** Каждый кандидат получает AI match score (0-100) относительно вакансии. Бейджи: "Great match" (80+), "Good match" (60-79), "Partial match" (40-59)
- **Обоснование:** GetAvery показывает "Great match" бейдж на карточках — это мгновенно помогает рекрутеру отсеивать. Для mass-hiring с 200+ откликами это критично
- **Визуализация:**
  - Зелёный: "|||  Ajoyib moslik" (Great match)
  - Жёлтый: "||  Yaxshi moslik" (Good match)
  - Серый: "| Qisman moslik" (Partial match)
- **Факторы скоринга:** навыки, локация (расстояние), зарплатные ожидания, категория, опыт, MyID верификация
- **Ожидаемый результат:** -50% времени на скрининг кандидатов

### Приоритет 2 (Важно — дифференциация)

#### P2-01. Avery Agent → Verifix Hiring Agent (AI-автопилот)
- **Описание:** Работодатель включает "автопилот" для вакансии → AI автоматически:
  1. Ищет подходящих кандидатов в базе
  2. Отправляет приглашения (через Telegram/SMS)
  3. Проводит предварительный скрининг (чат-бот вопросы)
  4. Формирует shortlist
  5. Запрашивает решение HR (human-in-the-loop)
- **Обоснование:** GetAvery Agent обрабатывает 280 кандидатов и shortlist'ит 46 автоматически. Для mass-hiring в ЦА (Makro ищет 200 кассиров) это must-have
- **Адаптация для blue-collar:**
  - Вместо AI video interview → Telegram voice message screening
  - Вместо LinkedIn InMail → Telegram/SMS приглашение
  - Простые скрининг-вопросы: "Siz hozir ishlay olasizmi?", "Qaysi tumanda yashaysiz?", "2/2 grafik qulaylingmi?"
- **Ожидаемый результат:** -90% ручной работы рекрутера на массовом найме

#### P2-02. Intelligence Level / Gamification для работодателей
- **Описание:** Прогресс-система для работодателей:
  - Level 1: Зарегистрирован + заполнил профиль
  - Level 2: Опубликовал 5+ вакансий
  - Level 3: Нанял 10+ кандидатов
  - Level 4: MyID верифицирован + 50+ наймов
  - Level 5: Premium + полная интеграция с HRM
- **Награды за уровни:** Бесплатные TOP-размещения, расширенный лимит просмотров, бейдж "Ishonchli ish beruvchi" (Trusted Employer)
- **Обоснование:** GetAvery использует "Intelligence Level" для product-led growth. Это увеличивает retention и стимулирует использование платных фич
- **Ожидаемый результат:** +40% retention работодателей, +25% конверсия в платный тарифы

#### P2-03. AI-Скрининг через Telegram Bot (вместо AI Interview)
- **Описание:** Когда кандидат откликается на вакансию, AI-бот задаёт 3-5 скрининг-вопросов:
  - "Qachondan ishlashingiz mumkin?" (Когда можете начать?)
  - "Transport bilan borishingiz mumkinmi?" (Удобно ли добираться?)
  - "Oldingi tajribangiz bormi?" (Есть ли предыдущий опыт?)
- AI оценивает ответы и выставляет pre-screening score
- **Обоснование:** GetAvery имеет AI video/phone interview. Для blue-collar Telegram-бот скрининг = адекватная адаптация
- **Ожидаемый результат:** -60% времени HR на первичный скрининг

#### P2-04. Мульти-канальный Unified Inbox для работодателей
- **Описание:** Единый inbox для всех коммуникаций с кандидатами:
  - Telegram сообщения
  - SMS переписка
  - Системные уведомления
  - AI screening результаты
- Timeline по каждому кандидату (как у GetAvery: LinkedIn InMail + Email)
- **Обоснование:** GetAvery объединяет email и LinkedIn в одном интерфейсе. Для Verifix — Telegram + SMS
- **Ожидаемый результат:** +30% к response rate, -40% пропущенных ответов кандидатов

### Приоритет 3 (Желательно — Phase 3+)

#### P3-01. Competitor Intelligence (адаптация для работодателей)
- **Описание:** Показывать работодателю: средний time-to-hire в его отрасли, средняя зарплата конкурентов, количество открытых вакансий у конкурентов в регионе
- **Обоснование:** GetAvery имеет Company Intelligence (BETA). Для UZ-рынка — аналитика по отрасли

#### P3-02. AI-Рекомендации по описанию вакансий
- **Описание:** При создании вакансии AI анализирует и предлагает:
  - "Добавьте бенефиты — вакансии с бенефитами получают на 40% больше откликов"
  - "Укажите зарплату — вакансии без зарплаты получают на 60% меньше откликов"
  - "Рыночная зарплата для кассира в Чилонзоре: 4-5.5 млн"
- **Обоснование:** GetAvery auto-evaluate работает для кандидатов. Адаптация — auto-evaluate вакансий

#### P3-03. Talent Hub / Пул кандидатов для работодателей
- **Описание:** Работодатель формирует собственный пул кандидатов из shortlists разных вакансий. Повторный набор из пула (без повторного поиска)
- **Обоснование:** GetAvery Talent Hub разблокируется после 100 shortlisted. Для mass-hiring — база "проверенных" кандидатов

---

## 3. Функциональные требования

### FR-01. AI Natural Language Vacancy Search (Telegram)
| Параметр | Значение |
|----------|----------|
| **Описание** | Кандидат пишет текст в Telegram → AI извлекает параметры → возвращает релевантные вакансии |
| **Примеры запросов** | "Chilonzorda kassirlik ishi bor?", "5 million maoshli ish kerak Toshkentda", "Oshpazlik ishi 2/2 grafikda" |
| **AI Pipeline** | User text → Claude API (intent: job_search, entity extraction: {city, category, salary, schedule}) → Elasticsearch query → ranked results |
| **Языки** | uz (латиница), uz (кириллица), ru, en |
| **Fallback** | Если AI не может извлечь параметры → показать форму с фильтрами |
| **Обоснование** | GetAvery NLP search — ключевая фича. Адаптация для Telegram + blue-collar |
| **Ожидаемый результат** | +50% к engagement, -70% к времени поиска |

### FR-02. AI Vacancy Generator (для работодателей)
| Параметр | Значение |
|----------|----------|
| **Описание** | Работодатель описывает вакансию любым способом → AI заполняет все поля |
| **Способы ввода** | 1) Текст (textarea), 2) Файл (docx/pdf), 3) URL (hh.uz, ish.mehnat.uz) |
| **AI Output** | title, category, city, salary_from, salary_to, employment_type, shift_schedule, benefits[], description, requirements[], conditions[] |
| **Редактирование** | AI заполняет форму → работодатель может отредактировать любое поле → Publish |
| **Технология** | Claude API → structured JSON output → auto-fill VacancyCreateRequest |
| **Обоснование** | GetAvery: URL/doc/text → hiring project. Адаптация для mass-hiring |
| **Ожидаемый результат** | -80% времени на создание вакансии |

### FR-03. AI Match Score
| Параметр | Значение |
|----------|----------|
| **Описание** | Каждая пара (candidate, vacancy) получает AI score 0-100 |
| **Бейджи** | 80-100: "Ajoyib moslik" (зелёный), 60-79: "Yaxshi moslik" (жёлтый), 40-59: "Qisman moslik" (серый), <40: не показывать |
| **Факторы** | skill_overlap (30%), distance_km (25%), salary_fit (20%), category_match (15%), verification_bonus (10%) |
| **Отображение** | На карточке кандидата в ATS pipeline + в списке откликов + в Telegram (при отклике) |
| **Реализация** | Phase 1: rule-based scoring. Phase 4: CatBoost ML model |
| **Обоснование** | GetAvery "Great match" badge. Критично для mass-hiring с 200+ откликами |
| **Ожидаемый результат** | -50% времени на скрининг |

### FR-04. Verifix Hiring Agent
| Параметр | Значение |
|----------|----------|
| **Описание** | AI-агент автоматизирует найм: поиск → приглашение → скрининг → shortlist |
| **Модули (toggles)** | AI Search (поиск кандидатов), AI Invite (Telegram/SMS приглашение), AI Screen (чат-бот вопросы), AI Shortlist (формирование шортлиста), Human Review (запрос решения HR) |
| **Dashboard** | candidates: N, shortlisted: N, invited: N, screened: N. Last active: timestamp |
| **Управление** | Toggle ON/OFF для каждого модуля. HR может в любой момент вмешаться |
| **Скрининг-вопросы** | Настраиваемые per-vacancy. Default: availability, location, experience, schedule_ok |
| **Обоснование** | GetAvery Agent = 280 candidates → 46 shortlisted автоматически |
| **Ожидаемый результат** | -90% ручной работы при массовом найме |

### FR-05. Employer Gamification (Intelligence Level)
| Параметр | Значение |
|----------|----------|
| **Описание** | Прогресс-система мотивации работодателей |
| **Уровни** | L1: Registered (0 points), L2: Active (fill profile + 5 vacancies = 100 pts), L3: Growing (10 hires + MyID = 500 pts), L4: Pro (50 hires + analytics = 2000 pts), L5: Enterprise (Premium + HRM integration = 5000 pts) |
| **Награды** | L2: 1 free TOP, L3: "Ishonchli" badge, L4: 3 free TOPs/month + extended resume views, L5: API access + dedicated support |
| **Визуализация** | Progress bar в header (как у GetAvery), бейджи на профиле компании |
| **Обоснование** | GetAvery Intelligence Level = product-led growth |
| **Ожидаемый результат** | +40% retention, +25% paid conversion |

---

## 4. UI/UX требования

### 4.1 Визуальные улучшения (вдохновлённые GetAvery)

#### UX-01. AI-first дизайн поиска
| Элемент | GetAvery | Verifix Jobs (адаптация) |
|---------|---------|--------------------------|
| Hero search | NLP textarea "I am looking for..." | Telegram bot: "Qanday ish qidiryapsiz?" + Web: textarea "Ish tavsifi..." |
| Search button | "Find candidates" (purple) | "Vakansiyalarni topish" (green) |
| Results | AI-ranked card list | AI-ranked + distance sorted |
| Score badge | "Great match" (green bars) | "Ajoyib moslik |||" (green) |

#### UX-02. Dashboard для работодателя (по мотивам GetAvery)
```
┌─────────────────────────────────────────────────────┐
│ 🏢 Verifix Jobs          Intelligence Level 3  ████░│
│                                    + Yangi vakansiya│
├─────────────────────────────────────────────────────┤
│ Xayrli kun, Abdukakhkhor!                           │
│ Sizning ishga qabul dashbordingiz                   │
│                                                     │
│ ┌─────────────────────────────────────────┐         │
│ │ 2 action items for you                   │         │
│ │ 🔔 5 yangi nomzod - "Kassir" vakansiyaga │         │
│ │ ⚡ AI Agent 12 nomzodni tanladi          │         │
│ └─────────────────────────────────────────┘         │
│                                                     │
│ 📊 Hiring projects    Shared with team              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ Kassir   │ │ Oshpaz   │ │ Haydovchi│             │
│ │ 45 apps  │ │ 12 apps  │ │ 28 apps  │             │
│ │ 8 short  │ │ 3 short  │ │ 5 short  │             │
│ │ ✅ Agent │ │ ⏸ Paused │ │ ✅ Agent │             │
│ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

#### UX-03. Карточка кандидата с AI Score
```
┌─────────────────────────────────────────┐
│ [Photo] Aziz Karimov                    │
│         Kassir | Korzinka (hozirgi)     │
│ ||| Ajoyib moslik  85%                  │
│ 📍 1.2 km | 📞 +998 90 *** ** **       │
│ ✅ MyID verified | 🔄 3 oy tajriba     │
│ [📨 Taklif] [👁 Batafsil] [❤️ Saqlash] │
└─────────────────────────────────────────┘
```

### 4.2 Оптимизация пользовательских сценариев

#### Сценарий: Массовый найм 50 кассиров (с AI Agent)
**Без AI (текущий flow):**
1. Создать вакансию (5 мин) → 2. Ждать откликов (3-7 дней) → 3. Просмотреть 200+ откликов вручную (2 часа) → 4. Отправить приглашения (30 мин) → 5. Провести собеседования (2 дня)
**Total: 3-7 дней, 3+ часов ручной работы**

**С AI Agent (как у GetAvery):**
1. Описать вакансию текстом (1 мин) → AI генерирует вакансию
2. Включить AI Agent → AI ищет в базе + принимает отклики + скринит через Telegram
3. Через 24 часа: shortlist из 50 кандидатов с match scores
4. HR просматривает shortlist (15 мин) → утверждает/отклоняет
5. AI отправляет приглашения на собеседование
**Total: 1 день, 20 минут ручной работы**

### 4.3 Улучшение конверсии

| Метрика | Без AI | С AI (GetAvery-inspired) | Улучшение |
|---------|--------|--------------------------|-----------|
| Time to create vacancy | 5-10 мин | 1 мин (AI генерация) | -90% |
| Time to screen 200 apps | 2-3 часа | 15 мин (AI shortlist) | -90% |
| Time to first invite | 3-7 дней | 24 часа (AI Agent) | -80% |
| Candidate relevance | 30-40% | 70-80% (AI matching) | +100% |
| Employer retention | 40% | 65% (gamification) | +60% |

---

## 5. Технические рекомендации

### 5.1 AI/ML Stack (вдохновлённый GetAvery)

| Компонент | GetAvery (предположительно) | Verifix Jobs (рекомендация) |
|-----------|---------------------------|----------------------------|
| NLP Engine | LLM (GPT-4/Claude) для intent/entity extraction | Claude API → intent detection + entity extraction |
| Matching | Embedding-based similarity + scoring model | Phase 1: Rule-based scoring. Phase 4: CatBoost |
| Agent | Custom agentic pipeline (search→outreach→interview→shortlist) | Spring Boot scheduler + Kafka events + Claude API |
| Interview | AI video/phone via custom models | Telegram bot скрининг questions |
| Outreach | Email + LinkedIn automation | Telegram + SMS automation (NotificationRouter) |

### 5.2 AI Integration Architecture для Verifix Jobs

```
Candidate (Telegram) → NLP Query → Claude API → Intent/Entity → Elasticsearch → Results

Employer (Web) → Text/URL/File → Claude API → Structured JD → Auto-fill Form → Vacancy

AI Agent:
  Scheduler (every 1h) →
    1. Search new matching candidates (ES + PostGIS)
    2. Score candidates (rule-based/ML)
    3. Filter: score >= 60
    4. Send Telegram invite via NotificationRouter
    5. Bot asks screening questions
    6. Store screening results
    7. Update shortlist
    8. Notify employer: "AI tanladi: 12 yangi nomzod"
```

### 5.3 Производительность AI

| Метрика | Цель |
|---------|------|
| NLP query → results | < 3 seconds (Claude API + ES) |
| AI vacancy generation | < 10 seconds |
| Match scoring (batch 100) | < 5 seconds |
| Agent cycle (1 vacancy) | < 5 minutes |
| Screening bot response | < 2 seconds |

### 5.4 Безопасность AI

- **Prompt injection protection:** Sanitize all user inputs before Claude API
- **AI decision audit:** Log all AI decisions (match scores, shortlist reasons) in ml_candidate_score table
- **Human-in-the-loop:** AI Agent NEVER auto-hires. Always requires HR approval
- **Bias mitigation:** Don't use gender/age in scoring. Monitor match score distribution by demographics
- **Data privacy:** Don't send personal data (phone, passport) to external AI APIs. Only send anonymized features

---

## 6. Приоритизированный план внедрения AI-фич

### Phase 1 — Rule-based (Sprint текущий)
1. **AI Match Score (rule-based)** — 3 дня backend
2. **Match бейджи на карточках** — 1 день frontend

### Phase 2 — Claude API Integration (Sprint 6-8)
3. **AI Vacancy Generator** (text → structured) — 5 дней backend + 3 дня frontend
4. **AI NLP Search в Telegram** — 5 дней backend + Telegram handler

### Phase 3 — AI Agent (Sprint 9-12)
5. **Verifix Hiring Agent** — 10 дней backend
6. **AI Telegram Screening Bot** — 5 дней
7. **Unified Inbox** — 5 дней frontend

### Phase 4 — ML Models (Sprint 14+)
8. **CatBoost matching model** — Python ML service
9. **Employer Gamification** — 3 дня backend + 2 дня frontend
10. **Talent Hub** — 5 дней

---

## 7. Резюме: Ключевые заимствования из GetAvery

| # | Фича GetAvery | Адаптация для Verifix Jobs | Приоритет |
|---|--------------|---------------------------|-----------|
| 1 | NLP Search ("I am looking for...") | Telegram NLP поиск на uz/ru | P1 — Критично |
| 2 | URL/Doc/Text → Hiring Project | AI-генерация вакансий | P1 — Критично |
| 3 | "Great match" badge | AI Match Score на карточках | P1 — Критично |
| 4 | Avery Agent (autopilot) | Verifix Hiring Agent | P2 — Важно |
| 5 | AI Video/Phone Interview | Telegram Bot Screening | P2 — Важно |
| 6 | Intelligence Level | Employer Gamification | P2 — Важно |
| 7 | Unified Inbox (Email+LinkedIn) | Unified Inbox (Telegram+SMS) | P2 — Важно |
| 8 | Talent Hub | Candidate Pool | P3 — Желательно |
| 9 | Company Intelligence | Industry Analytics | P3 — Желательно |
| 10 | ATS Integrations | Verifix HRM Bridge (есть) | Уже в ТЗ |

**Ключевой вывод:** GetAvery — это AI-first sourcing tool для white-collar рынка. Его AI-подходы (NLP search, auto-evaluate, agent mode) можно мощно адаптировать для blue-collar mass-hiring в Центральной Азии через Telegram + SMS. Это создаст уникальное конкурентное преимущество, которого нет ни у IshGO, ни у hh.uz.
