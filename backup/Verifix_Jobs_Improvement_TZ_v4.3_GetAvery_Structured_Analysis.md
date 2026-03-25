# Verifix Jobs - ТЗ на улучшение v4.3
## Конкурентный анализ GetAvery и прикладные требования для развития проекта

> Дата: 24.03.2026
> Версия: 4.3
> Основание: аудит репозитория `VF-JobSite`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы GetAvery и проход по авторизованной части Avery в Google Chrome

---

## Вводные

Этот документ нужен не для копирования Avery, а для переноса его сильных employer-side паттернов в `VF-JobSite`.

Важно:

- `GetAvery` - не job board и не классический ATS.
- Это `hiring intelligence product` для работодателя.
- Его главная сила не в публикации вакансий, а в ускорении принятия hiring-решений, запуске найма, работе с talent pool и в productized value reporting.

Для `VF-JobSite` это означает:

- не нужно превращаться в клон Avery;
- нужно забрать сильные паттерны employer intelligence и наложить их на наши преимущества:
  - Telegram-first;
  - mass hiring;
  - geolocation;
  - MyID;
  - HRM bridge;
  - gov integrations;
  - Central Asia localization.

---

## Что изучено

### Внутренние источники

- `Verifix_Jobs_TZ_v2.0_Complete.docx`
- `Verifix_Jobs_TZ_v2.1_Appendix.docx`
- репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- ранее подготовленный аналитический документ:
  - `Verifix_Jobs_Improvement_TZ_v4.0_GetAvery_Deep_Audit.md`

### Публичные источники GetAvery

- [GetAvery home](https://www.getavery.ai/)
- [GetAvery changelog](https://www.getavery.ai/changelog)
- [GetAvery blog](https://www.getavery.ai/blog)
- [GetAvery privacy policy](https://www.getavery.ai/privacy-policy)

### Что пройдено в Google Chrome

В Chrome были изучены ключевые public и authorized surfaces Avery:

- `https://www.getavery.ai/`
- `https://app.getavery.ai/dashboard`
- `https://app.getavery.ai/dashboard/talent-hub`
- `https://app.getavery.ai/dashboard/power-centre`
- `https://app.getavery.ai/dashboard/easy-pilot/report`
- organization/account-related surfaces, доступные в текущей авторизованной среде
- modal `New hiring project`
- `Connect ATS` entrypoints

---

## Сопоставление с текущим VF-JobSite

По текущему коду `VF-JobSite` уже имеет хорошую основу:

- backend platform;
- Angular employer cabinet;
- ATS/pipeline basis;
- analytics/billing/profile surfaces;
- Telegram and integration foundation.

Но employer-side слой все еще слабее Avery в ключевых местах:

- нет настоящего `hiring intelligence dashboard`;
- нет project-centric входа в hiring flow;
- нет отдельного `talent hub` как памяти о кандидатах;
- нет `organization memory`;
- нет `power centre` с прогрессом внедрения и ценностью;
- нет productized ROI/value reporting;
- нет сильного action-oriented onboarding внутри employer кабинета.

Текущие индикаторы этого видны в коде:

- `verifix-jobs-web/src/app/features/dashboard/dashboard.component.ts`
- `verifix-jobs-web/src/app/features/vacancies/vacancy-list.component.ts`
- `verifix-jobs-web/src/app/features/pipeline/pipeline.component.ts`
- `verifix-jobs-web/src/app/features/candidates/candidates.component.ts`

Эти части уже рабочие, но пока выглядят как набор базовых screens, а не как цельная hiring operating system.

---

# 1. Анализ конкурента

## 1.1 Сильные стороны GetAvery

### 1. Hiring intelligence dashboard вместо обычного home screen

Avery делает dashboard не декоративным, а управляющим.

Что видно:

- приветственный, но action-oriented home;
- выделенный блок `action item`;
- отдельный CTA `Connect ATS`;
- блок `Company Intelligence`;
- блок `Your hiring projects`;
- referral/invite module.

Почему это сильно:

- работодатель сразу понимает, что делать дальше;
- первый экран не про статистику ради статистики, а про next best action;
- продукт ведет пользователя к activation.

### 2. Project-based hiring entry

Через `New hiring project` Avery заводит пользователя не в форму вакансии, а в hiring workflow.

На старте есть:

- intake от публичного URL;
- upload документа;
- guided project creation.

Почему это сильно:

- снижает friction на входе;
- переносит логику с "заполни форму" на "запусти hiring case";
- лучше подходит для совместной работы hiring manager + recruiter.

### 3. Talent Hub как постоянная talent memory

`Talent hub` у Avery не равен просто shortlist или pipeline.

Это:

- накапливаемый talent pool;
- reusable candidate memory;
- слой выше конкретной вакансии;
- база для повторного использования контактов и совпадений.

Почему это сильно:

- кандидаты не теряются после закрытия вакансии;
- продукт усиливает долгосрочную ценность, а не только разовый найм;
- повышается ROI с каждого найма и каждого imported candidate.

### 4. Power Centre и maturity model

Avery productizes adoption через:

- `Level 1`, `Level 2`, `Level 3`, `Intelligent`, `Predictive`;
- connections hub;
- feature unlock logic;
- integration progress;
- next milestones.

Почему это сильно:

- платформа продает не просто функции, а progression;
- пользователю понятно, что уже включено и что дает следующий шаг;
- это повышает activation и retention.

### 5. ROI и value reporting

`Easy Pilot Report` у Avery переводит продукт в язык бизнеса:

- total value unlocked;
- annual value projection;
- value at scale;
- stages completed;
- outreach, shortlist, intake, upload metrics;
- subscription CTA на основе доказанной ценности.

Почему это сильно:

- продукт говорит на языке CFO/CEO, а не только recruiter;
- ценность доказывается цифрами;
- trial превращается в measurable business case.

### 6. Organization Memory

В Avery есть слой знаний о компании:

- what Avery knows;
- organization facts;
- reusable context for matching and outreach;
- editable memory.

Почему это сильно:

- система работает с контекстом компании, а не только с текстом вакансии;
- это повышает качество matching, sourcing и outreach;
- продукт становится умнее по мере использования.

### 7. Низкий шум интерфейса

В UI Avery заметны:

- очень ограниченная верхнеуровневая навигация;
- крупная типографика;
- много воздуха;
- card-based layout;
- один доминирующий CTA в зоне внимания;
- понятные empty states и gated states.

Почему это сильно:

- интерфейс воспринимается как дорогой и уверенный;
- пользователь не тонет в функциях;
- фокус держится на задаче.

## 1.2 Слабые стороны GetAvery

### 1. Сильный enterprise bias

Avery очень хорошо подходит для white-collar recruiting, sourcing и intelligence workflows, но хуже ложится на blue-collar mass hiring без адаптации.

Ограничения:

- высокая зависимость от ATS, email, outreach;
- мало локальной географии;
- слабая публичная candidate marketplace logic;
- нет Telegram-first UX;
- нет low-friction mass-hiring candidate flow.

### 2. Сильная зависимость от интеграций

Много ценности Avery раскрывается только после:

- ATS connect;
- email connect;
- calendar connect;
- накопления usage data.

Риск:

- time-to-value для части клиентов может удлиняться;
- без интеграций часть продукта выглядит gated.

### 3. Неочевидность некоторых маршрутов

Часть organization/account/power surfaces у Avery ощущается как hidden product graph.

Риск:

- новому пользователю трудно построить mental model без guided onboarding;
- часть сильных возможностей может оставаться невидимой.

### 4. Слабый public acquisition layer

У Avery нет силы job marketplace.

Это значит:

- он не заменяет public job portal;
- он усиливает employer operations, но не решает local candidate acquisition сам по себе.

## 1.3 Уникальные особенности GetAvery

У Avery реально выделяются следующие фишки:

- hiring intelligence dashboard;
- guided hiring project intake;
- talent hub как organizational talent memory;
- power centre с maturity model;
- organization memory;
- value and ROI report;
- connections hub;
- action-item driven onboarding;
- company intelligence surface;
- very clear "next step" UX.

---

# 2. Рекомендации по улучшению

## Приоритет 1 (критично)

### 1. Построить Hiring Intelligence Dashboard

Нужно заменить текущий базовый dashboard на action-oriented employer home.

На экране должны быть:

- next best action;
- integration status;
- live hiring projects;
- urgent tasks;
- top candidate opportunities;
- value metrics;
- quick CTA.

### 2. Ввести сущность Hiring Project

Нужно уйти от модели "вакансия как единственная стартовая сущность" к модели:

- hiring project;
- vacancy inside project;
- sourcing/screening/outreach внутри project context.

### 3. Создать Talent Hub

Нужен отдельный раздел для накопления и повторного использования кандидатов:

- shortlisted;
- imported;
- previous applicants;
- referral candidates;
- ATS-exported candidates.

### 4. Сделать Power Centre / Integration Hub

Нужен отдельный слой, который показывает:

- что уже подключено;
- что не подключено;
- что даст следующая интеграция;
- текущий уровень зрелости использования платформы.

### 5. Добавить ROI / value reporting

Нужен экран, который показывает работодателю:

- сэкономленное время;
- экономию на агентских расходах;
- количество найденных/нанятых кандидатов;
- value projection;
- adoption milestones.

## Приоритет 2 (важно)

### 1. Добавить Organization Memory

Нужен managed knowledge layer о компании:

- EVP;
- hiring preferences;
- team context;
- role-specific requirements;
- company facts;
- branch-specific realities.

### 2. Company Intelligence для работодателя

Нужен отдельный модуль, который показывает:

- hiring signals;
- competitor signals;
- employer brand strength;
- demand/supply patterns;
- role attractiveness.

### 3. Guided onboarding и empty-state coaching

Нужно усилить все пустые состояния:

- no projects;
- no ATS;
- no candidates;
- no integrations;
- no analytics.

Каждый empty state должен вести к следующему действию.

### 4. Presets и reusable hiring kits

Нужны шаблоны:

- role presets;
- screening presets;
- outreach presets;
- interview kits;
- location templates.

## Приоритет 3 (желательно)

### 1. Predictive hiring readiness

Нужен слой прогнозов:

- вероятность закрытия вакансии;
- риски по pipeline;
- нехватка трафика;
- слабый match quality;
- просадки по response rate.

### 2. Invite/referral/adoption mechanics

Нужно усилить внутренний adoption:

- invite teammates;
- referral rewards;
- shared projects;
- org collaboration flows.

### 3. Executive summary mode

Нужен режим для руководителя:

- topline metrics;
- hiring risks;
- ROI;
- active blockers;
- regional performance.

---

# 3. Функциональные требования

## 3.1 Hiring Intelligence Dashboard

### Описание

Создать новый employer home screen, который показывает не только KPI, но и следующие действия, блокеры, интеграционный статус и ключевые hiring opportunities.

### Обоснование

Сейчас `VF-JobSite` дает employer пользователю базовую аналитику, но не управляет его следующими шагами. Avery выигрывает именно за счет guided control tower.

### Ожидаемый результат

- снижение time-to-first-value до менее 10 минут после входа;
- рост activation employer пользователей;
- рост числа завершенных hiring flows;
- уменьшение пустых кабинетов без действий.

## 3.2 Hiring Project Wizard

### Описание

Добавить отдельный сценарий `New Hiring Project` с несколькими входами:

- из URL вакансии;
- из JD-файла;
- из ручного ввода;
- из шаблона.

### Обоснование

Форма вакансии сама по себе слишком статична. Project-level entity лучше подходит для найма команды, ролей и филиалов.

### Ожидаемый результат

- снижение friction при создании новой вакансии;
- рост числа опубликованных вакансий;
- сокращение времени от идеи найма до первого live project.

## 3.3 Talent Hub

### Описание

Создать отдельный раздел с reusable candidate pool, независимый от одной вакансии.

Нужно поддержать:

- сохранение кандидатов;
- объединение кандидатов из разных источников;
- теги;
- shortlist groups;
- повторное использование;
- экспорт обратно в pipeline.

### Обоснование

Сегодня candidate context у большинства систем обрывается на конкретной вакансии. Avery показывает более сильную модель.

### Ожидаемый результат

- рост повторного использования базы;
- снижение стоимости поиска кандидатов;
- ускорение закрытия повторяющихся ролей.

## 3.4 Organization Memory

### Описание

Добавить knowledge layer, где платформа хранит и использует знания о работодателе:

- EVP;
- preferred candidate traits;
- shift specifics;
- hiring manager preferences;
- branch specifics;
- rejection reasons;
- brand context.

### Обоснование

Это позволит AI, matching и screening работать с контекстом компании, а не только с текстом вакансии.

### Ожидаемый результат

- повышение качества matching;
- снижение числа нерелевантных кандидатов;
- улучшение качества AI suggestions.

## 3.5 Power Centre / Adoption Hub

### Описание

Добавить отдельный раздел, где показывается:

- maturity level;
- какие интеграции подключены;
- какие функции unlocked;
- какие шаги дадут следующий уровень.

### Обоснование

Employer пользователи редко проходят продукт линейно. Им нужен понятный roadmap прямо внутри продукта.

### Ожидаемый результат

- рост подключений ATS/почты/календаря;
- рост feature adoption;
- снижение churn у trial аккаунтов.

## 3.6 ROI / Easy Pilot Report

### Описание

Добавить отдельный value-reporting экран с расчетом:

- estimated savings;
- annual value projection;
- time saved;
- candidates surfaced;
- outreach volume;
- hires influenced by platform.

### Обоснование

Руководители покупают не фичи, а эффект. Avery очень хорошо это продуктезирует.

### Ожидаемый результат

- рост конверсии из trial в paid;
- упрощение обоснования покупки внутри компании;
- рост вовлеченности руководителей.

## 3.7 Company Intelligence

### Описание

Добавить модуль employer intelligence:

- hiring velocity;
- response health;
- branch performance;
- candidate source effectiveness;
- competitor benchmark;
- role attractiveness.

### Обоснование

Работодатель должен видеть не просто то, что происходит, а что нужно менять.

### Ожидаемый результат

- рост эффективности публикаций;
- более быстрые корректировки вакансий;
- снижение стоимости привлечения кандидата.

## 3.8 Guided Empty States

### Описание

Все пустые состояния должны содержать:

- объяснение, что не настроено;
- почему это важно;
- один главный CTA;
- один secondary CTA;
- ожидаемый выигрыш после действия.

### Обоснование

Пустой экран без guidance убивает activation. Avery решает это хорошо.

### Ожидаемый результат

- рост completion rate для onboarding;
- снижение потерь на первом входе;
- увеличение числа пользователей, дошедших до ключевой функции.

## 3.9 Presets и reusable workflows

### Описание

Добавить presets для:

- типовых вакансий;
- screening questions;
- moderation presets;
- outreach templates;
- branch hiring packs.

### Обоснование

Массовый найм в `VF-JobSite` предполагает повторяемость. Presets уменьшают операционный шум.

### Ожидаемый результат

- ускорение запуска вакансий;
- стандартизация найма;
- снижение ошибок при ручном заполнении.

## 3.10 Internal collaboration

### Описание

Добавить team collaboration layer:

- teammate invites;
- role-based access;
- shared hiring projects;
- assignment of hiring tasks;
- internal comments and mentions.

### Обоснование

Hiring почти никогда не делается одним человеком. Avery это хорошо учитывает.

### Ожидаемый результат

- меньше ручной координации вне системы;
- выше прозрачность ответственности;
- быстрее прохождение кандидатов по этапам.

---

# 4. UI/UX требования

## 4.1 Визуальные улучшения

Нужно сместить `VF-JobSite` в сторону более уверенного employer-grade UI.

Требования:

- один доминирующий CTA на каждый экран;
- крупная иерархическая типографика;
- больше воздуха;
- меньше визуального шума;
- сильные card surfaces;
- ясные статусные цвета;
- единая система empty/loading/success/error states.

Измеримые критерии:

- первый экран должен иметь не более 1 primary CTA и 2 secondary CTA above the fold;
- на каждом ключевом экране должно быть не более 5 визуально равносильных action elements;
- пустые состояния без CTA запрещены.

## 4.2 Оптимизация пользовательских сценариев

Нужно перестроить employer flow так, чтобы пользователь проходил путь:

`вошел -> понял следующий шаг -> создал project -> подключил интеграции -> получил кандидатов -> увидел value`

Требования:

- onboarding с понятным next step;
- отсутствие тупиковых экранов;
- во всех ключевых сценариях должно быть visible progress;
- actions должны быть контекстными, а не только глобальными.

Измеримые критерии:

- time-to-first-project < 7 минут;
- time-to-first-action < 60 секунд после входа;
- каждая пустая state-card должна объяснять ценность следующего шага.

## 4.3 Улучшение конверсии

Нужно усилить product conversion на employer стороне.

Требования:

- CTA по подключению ATS/почты/календаря;
- value hints прямо внутри dashboard;
- trial progress bar;
- ROI report entrypoint;
- guided upsell после достижения определенной активности;
- review-ready metrics для decision makers.

Измеримые критерии:

- conversion to ATS connect;
- conversion to first hiring project;
- conversion to first shortlist;
- conversion to first outreach;
- conversion to paid после value report.

## 4.4 Адаптивность интерфейса

Даже employer-facing UI должен нормально жить на ноутбуке и планшете.

Требования:

- dashboard и power centre должны быть читабельны от 1280px и ниже;
- не должно быть критичных horizontal overflow;
- project cards должны сжиматься без потери иерархии;
- mobile-lite режим для review и monitoring допускается, но desktop остается primary.

## 4.5 Скорость и отзывчивость

Нужно повторить сильную черту Avery: ощущение быстрых экранов даже при сложной логике.

Требования:

- skeletons вместо пустых экранов;
- progressive loading widgets;
- state transitions без визуальных скачков;
- отложенная загрузка тяжелых блоков.

Измеримые критерии:

- p75 LCP для employer dashboard < 2.5 c в нормальной сети;
- interaction feedback < 150 мс;
- загрузка secondary widgets не должна блокировать primary actions.

---

# 5. Технические рекомендации

## 5.1 Производительность

Нужно:

- разделить dashboard на независимые data widgets;
- использовать lazy loading для heavy intelligence modules;
- кешировать organization memory и summary projections;
- выносить расчет отчетов и прогнозов в background jobs;
- хранить precomputed aggregates для employer dashboards;
- вводить feature flags для новых intelligence модулей.

Практические требования:

- тяжелые отчеты и projections не считаются синхронно в request/response;
- все дорогостоящие candidate matching jobs должны быть async;
- top-level dashboard API должен отдавать данные не более чем за 800 мс на p95.

## 5.2 Безопасность

Нужно:

- сохранить tenant isolation;
- audit log для intelligence actions;
- разграничение RBAC на project/org/report уровни;
- защиту AI-generated summaries от prompt injection через внешние источники;
- строгую обработку candidate PII;
- журнал подключений интеграций.

Практические требования:

- все organization memory changes аудитируются;
- все integration tokens хранятся encrypted at rest;
- report downloads подписываются и проверяются;
- доступ к ROI/data reports ограничен ролями.

## 5.3 Масштабируемость

Нужно:

- разделить employer intelligence слой на отдельные сервисные границы;
- хранить event stream по employer usage;
- использовать materialized aggregates для reporting;
- подготовить API и event contracts под ML/AI expansion;
- отделить project orchestration, matching, reporting и integrations логически и по очередям задач.

Практические требования:

- event-driven модель для hiring actions;
- async processing для reports, scoring, enrichment;
- versioned API contracts для web и integrations;
- возможность горизонтально масштабировать matching/reporting независимо от core API.

## 5.4 Observability

Нужно:

- отдельные метрики по onboarding funnel;
- отдельные метрики по feature adoption;
- tracing по intelligence workflows;
- dashboards по integration failures;
- отчеты по slow queries и slow widgets.

Без этого employer intelligence слой быстро станет непрозрачным.

---

## Финальный вывод

GetAvery показывает очень сильный паттерн: hiring platform может выигрывать не только количеством вакансий и кандидатов, а качеством employer decision layer.

Для `VF-JobSite` главный вывод такой:

- мы уже движемся в сторону платформы;
- но сейчас employer-side продукт еще больше похож на хороший operational cabinet, чем на hiring intelligence system;
- следующий качественный шаг - добавить layers, которые Avery делает особенно хорошо:
  - intelligence dashboard;
  - hiring projects;
  - talent hub;
  - organization memory;
  - power centre;
  - ROI reporting;
  - guided product adoption.

Если соединить это с нашими текущими сильными сторонами:

- Telegram;
- mass hiring;
- geolocation;
- MyID;
- HRM bridge;
- regional localization;

то `VF-JobSite` сможет стать не копией Avery, а более сильной локальной hiring platform для Центральной Азии.

---

## Источники

- [GetAvery home](https://www.getavery.ai/)
- [GetAvery changelog](https://www.getavery.ai/changelog)
- [GetAvery blog](https://www.getavery.ai/blog)
- [GetAvery privacy policy](https://www.getavery.ai/privacy-policy)
- авторизованные маршруты `app.getavery.ai`, просмотренные в Google Chrome 24.03.2026
