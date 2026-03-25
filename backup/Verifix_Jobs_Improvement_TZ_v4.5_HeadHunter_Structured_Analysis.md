# Verifix Jobs - ТЗ на улучшение v4.5
## Конкурентный анализ HeadHunter и прикладные требования для развития проекта

> Дата: 24.03.2026  
> Версия: 4.5  
> Основание: аудит репозитория `VF-JobSite`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы HeadHunter и ранее пройденные авторизованные employer-surface сценарии `tashkent.hh.uz` в Google Chrome

---

## Вводные

Этот документ нужен не для копирования `HeadHunter`, а для переноса его сильных B2B hiring-паттернов в `VF-JobSite`.

Ключевой вывод аудита:

- `HeadHunter` сильнее как `employer recruiting operating system`.
- `VF-JobSite` уже имеет хороший backend, Telegram, geo, MyID, HRM bridge и задел под ATS.
- Главный gap `VF-JobSite` относительно `HH` сейчас находится в productization employer-side layer:
  - operations dashboard;
  - vacancy performance management;
  - response triage;
  - candidate database tooling;
  - automation;
  - storefront и entitlement-accounting.

### Что изучено

### Внутренние источники

- `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_TZ_v2.0_Complete.docx`
- `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_TZ_v2.1_Appendix.docx`
- репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- ранее подготовленный deep-аудит:
  - `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_Improvement_TZ_v4.1_HeadHunter_Deep_Audit.md`

### Публичные источники HeadHunter

- [Главная HeadHunter в Ташкенте](https://tashkent.hh.uz/)
- [Turbo response / vacancy day materials](https://tashkent.hh.uz/article/30609)
- [Авторазбор откликов с чат-ботом](https://tashkent.hh.uz/article/31249)
- [Отклик из чата для быстрого найма](https://tashkent.hh.uz/article/30047)
- [Подтверждение навыков в резюме](https://tashkent.hh.uz/article/31321)
- [Презентация по blue-collar hiring](https://tashkent.hh.uz/file/13273734.pdf)

### Что было просмотрено в employer-surface HH

Ранее были изучены авторизованные страницы `tashkent.hh.uz`:

- employer dashboard;
- список вакансий;
- карточка вакансии и вкладка `Здоровье вакансии`;
- отклики по вакансии;
- поиск по базе резюме;
- прайс и пакеты доступа к базе;
- брендинг;
- счет и услуги;
- automation hub;
- создание вакансии.

### Что сопоставлено в текущем `VF-JobSite`

Для сравнения использованы актуальные employer-side экраны:

- [dashboard.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/dashboard/dashboard.component.ts)
- [vacancy-list.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/vacancies/vacancy-list.component.ts)
- [vacancy-detail.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/vacancies/vacancy-detail.component.ts)
- [pipeline.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/pipeline/pipeline.component.ts)
- [analytics.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/analytics/analytics.component.ts)
- [billing.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/billing/billing.component.ts)

---

# 1. Анализ конкурента

## 1.1 Сильные стороны HeadHunter

### 1. Employer dashboard как операционная панель

У `HH` главная employer-страница устроена не как приветственный экран, а как рабочая консоль:

- остатки по публикациям и доступам;
- быстрый доступ к поиску кандидатов;
- активные вакансии;
- блоки откликов;
- новости, помощь, обновления;
- быстрые переходы к коммерческим и рекрутинговым действиям.

Почему это сильно:

- работодатель сразу видит next action;
- dashboard работает как control center, а не как декоративный KPI-screen.

### 2. Vacancy list как hiring operations board

Список вакансий `HH` превращен в performance-table:

- активные/архив/шаблоны/черновики;
- просмотры;
- отклики;
- “в работе”;
- релевантные кандидаты;
- срок действия;
- продвижение;
- менеджер;
- быстрые действия.

Почему это сильно:

- одна таблица уже позволяет управлять hiring-потоком;
- список вакансий становится ежедневным рабочим инструментом.

### 3. Vacancy health как диагностический слой

`Здоровье вакансии` — один из самых сильных паттернов `HH`.

Система показывает:

- показы;
- просмотры;
- отклики;
- конверсию;
- сравнение с конкурентами;
- график динамики;
- рекомендации по улучшению;
- upsell на продвижение;
- похожих кандидатов.

Почему это сильно:

- вакансия оценивается не просто как запись в базе, а как маркетинговая воронка;
- работодатель видит, что именно мешает найму.

### 4. Глубокий workflow по откликам

`HH` силен в response management:

- многоэтапная воронка;
- статусы;
- коммуникационные действия;
- заметки;
- быстрый переход к следующему действию;
- инструменты для массового найма.

Почему это сильно:

- recruiter работает с потоком, а не с хаотичным списком людей;
- лучше поддерживается high-volume hiring.

### 5. Resume DB search как отдельный product pillar

`HH` продает не только публикацию вакансий, но и outbound recruitment:

- поиск по базе кандидатов;
- богатые фильтры;
- сохраненные и автоматические поиски;
- быстрый доступ к контактам;
- работа с избранным и shortlists.

Почему это сильно:

- это отдельный канал найма;
- это отдельный источник выручки;
- это усиливает ценность платформы для работодателя.

### 6. Automation hub для массового найма

`HH` productizes automation через отдельный модуль:

- авторазбор;
- чат-бот;
- автоматические вопросы;
- автоматическое движение по воронке;
- расчет сэкономленного времени;
- связь automation сразу с несколькими вакансиями.

Почему это сильно:

- автоматизация подается не как скрытая backend-фича, а как понятный продукт;
- работодатель лучше понимает ROI.

### 7. Сильный monetization/storefront layer

`HH` продает услуги через понятный storefront:

- публикации;
- доступ к базе;
- контакты;
- продвижение;
- брендинг;
- bundled-offers;
- CTA на покупку.

Почему это сильно:

- продажа встроена в рабочий контекст;
- монетизация не выглядит “чужой” частью продукта.

### 8. Entitlement accounting и account transparency

Работодатель в `HH` всегда понимает:

- что куплено;
- сколько осталось;
- когда это истекает;
- какие ограничения действуют.

Почему это сильно:

- меньше путаницы;
- меньше нагрузки на поддержку;
- выше готовность покупать доп.пакеты.

### 9. Branding как отдельное направление

`HH` отдельно монетизирует employer brand:

- брендированные вакансии;
- брендированные страницы компании;
- конструктор;
- шаблоны коммуникаций.

Почему это сильно:

- бренд работодателя становится продуктом, а не побочной опцией.

### 10. Сервисная экосистема вокруг hiring

`HH` окружает core-flow доп.сервисами:

- статьи;
- обучение;
- помощь;
- сервисы;
- вебинары;
- тестирование;
- поддержка.

Почему это сильно:

- платформа воспринимается как экосистема, а не как один экран для публикации вакансии.

## 1.2 Слабые стороны HeadHunter

### 1. Высокая сложность интерфейса

`HH` местами перегружен:

- dense tables;
- много действий;
- высокий шум интерфейса;
- порог входа для новых и небольших работодателей выше.

### 2. Сильный desktop bias

Многие сценарии у `HH` удобнее на десктопе, чем на мобильном устройстве.

Риск:

- branch managers и small business users хуже работают с продуктом на ходу.

### 3. Слишком тяжелая коммерческая модель для части рынка

Storefront и доступы у `HH` мощные, но для части SMB они выглядят сложно и “дорого в управлении”.

### 4. Resume-first логика не идеальна для blue-collar

Для массового найма и линейного персонала классическая CV-centric модель не всегда оптимальна.

### 5. Не локально-оптимизированный Telegram-first flow

Это сильная зона именно для `VF-JobSite`: `HH` не выглядит продуктом, изначально спроектированным вокруг Telegram-native сценариев.

## 1.3 Уникальные особенности HeadHunter

### 1. Vacancy health

Одна из наиболее прикладных и отличительных фич.

### 2. Индекс вежливости компании

Очень сильный product signal:

- помогает дисциплинировать работу с кандидатами;
- связывает скорость и качество коммуникации с репутацией работодателя.

### 3. Automation hub с расчетом выгоды

`HH` продает automation через value language, а не через технические термины.

### 4. Entitlements как прозрачная модель доступа

Пользователь видит конкретный остаток и конкретный лимит, а не абстрактную подписку.

### 5. Отклик из чата и сценарии без полного резюме

Это важно именно для массового найма и линейного персонала.

---

# 2. Рекомендации по улучшению

## Приоритет 1 (критично)

### 1. Перестроить employer dashboard в operations console

Нужно показать:

- текущие вакансии;
- новые отклики;
- незакрытые действия;
- recruiter workload;
- остатки по пакетам и лимитам;
- быстрый поиск кандидатов;
- быстрые CTA.

### 2. Превратить vacancy list в performance board

Нужны:

- полноценные колонки эффективности;
- табы по состояниям;
- quick actions;
- batch actions;
- статусы продвижения и automation.

### 3. Добавить vacancy health

Нужно давать работодателю не просто цифры, а диагноз:

- где теряются кандидаты;
- как вакансия выглядит относительно похожих;
- что улучшить в тексте, зарплате, географии и скорости ответа.

### 4. Усилить response pipeline для массового найма

Нужно сделать рабочую воронку откликов с triage, заметками, шаблонными действиями и SLA по обработке.

### 5. Productize candidate database search

Нужно сделать поиск по кандидатам отдельным сильным employer surface, а не просто поисковой строкой.

### 6. Пересобрать wizard создания вакансии

Нужен quality-first сценарий с structured sections, AI assist, hiring plan и quality hints.

## Приоритет 2 (важно)

### 1. Добавить automation hub

Нужны:

- авторазбор;
- автоматические вопросы;
- Telegram/SMS follow-up;
- автостатусы;
- сквозной ROI.

### 2. Развить storefront и entitlement accounting

Нужно уйти от “тарифов вообще” к конкретным доступам и пакетам.

### 3. Productize employer branding

Нужно выделить брендирование в отдельный продуктовый слой.

### 4. Добавить recruiter/account ops

Нужны:

- менеджеры;
- роли;
- адреса;
- документы;
- история операций;
- ограничения и квоты.

## Приоритет 3 (желательно)

### 1. Ввести индекс вежливости работодателя

Это даст сильный сигнал дисциплины и качества employer behavior.

### 2. Добавить validated skills и trust badges

Использовать ваши сильные стороны:

- MyID;
- partner training;
- skill checks;
- badge system.

### 3. Развить help/support/content rail

Встроить помощь и рекомендации прямо в employer workflow.

---

# 3. Функциональные требования

## 3.1 Employer operations dashboard

### Описание

Создать новый dashboard с секциями:

- entitlements summary;
- active vacancies snapshot;
- new response queue;
- recruiter workload;
- quick candidate search;
- support/content rail;
- action center.

### Обоснование

`HH` показывает, что dashboard должен вести работодателя к действию, а не просто показывать KPI.

### Ожидаемый результат

- сокращение времени до первого полезного действия после логина;
- рост employer activation;
- рост частоты ежедневного использования кабинета.

## 3.2 Vacancy operations board

### Описание

Перестроить список вакансий в performance table с полями:

- status;
- views;
- applies;
- in progress;
- matched candidates;
- expires at;
- promotion status;
- automation status;
- owner;
- hiring plan progress.

### Обоснование

`HH` превращает список вакансий в рабочий центр управления наймом.

### Ожидаемый результат

- быстрее выявляются проблемные вакансии;
- меньше переходов между экранами;
- выше скорость операционного управления.

## 3.3 Vacancy health

### Описание

Для каждой вакансии добавить отдельный diagnostic view:

- impressions;
- detail opens;
- applies;
- conversion;
- median time to first response;
- response lag;
- salary competitiveness;
- geo competitiveness;
- benchmark against similar vacancies;
- рекомендации по улучшению.

### Обоснование

Это одна из самых сильных employer-side механик у `HH`.

### Ожидаемый результат

- рост conversion по вакансиям;
- выше скорость принятия решений по продвижению и корректировке текста;
- меньше “молчаливых” неэффективных вакансий.

## 3.4 Response inbox и mass-hiring workflow

### Описание

Сделать отдельный response inbox:

- triage;
- этапы;
- bulk actions;
- шаблонные сообщения;
- назначение ответственного;
- SLA и aging;
- причины отказа;
- next best action.

### Обоснование

Для массового найма нужен не просто Kanban, а быстрый конвейер обработки.

### Ожидаемый результат

- сокращение времени обработки отклика;
- рост конверсии в контакт и интервью;
- снижение доли потерянных кандидатов.

## 3.5 Candidate database search 2.0

### Описание

Создать полноценный employer-side поиск по кандидатам с:

- структурными фильтрами;
- saved searches;
- auto-search;
- shortlist;
- notes;
- contact reveal;
- bulk invite;
- match-to-vacancy shortcuts.

### Обоснование

`HH` делает candidate DB отдельным и ценным продуктом для работодателя.

### Ожидаемый результат

- рост outbound recruiting;
- новая линия монетизации;
- снижение зависимости только от inbound откликов.

## 3.6 Automation hub

### Описание

Создать отдельный раздел automation:

- авторазбор;
- автоопрос;
- Telegram/SMS bot flows;
- автоперевод по стадиям;
- follow-up сценарии;
- расчет сэкономленного времени;
- расчет предотвращенных lost candidates.

### Обоснование

Автоматизация должна быть видимым и управляемым продуктом, а не скрытой системной функцией.

### Ожидаемый результат

- снижение ручной нагрузки;
- рост скорости найма;
- лучшая обработка high-volume vacancies.

## 3.7 Vacancy creation wizard 3.0

### Описание

Создать step-by-step мастер вакансии:

- hiring plan;
- employment type;
- work format;
- address;
- salary and payment model;
- schedule/shifts;
- requirements;
- benefits;
- skills;
- languages;
- AI draft generation;
- content quality hints.

### Обоснование

`HH` показывает, что длинная форма может быть эффективной, если она качественно структурирована и помогает заполнению.

### Ожидаемый результат

- выше качество вакансий;
- меньше ошибок в публикации;
- выше conversion и relevance откликов.

## 3.8 Storefront и entitlement accounting

### Описание

Перестроить billing-модуль в продуктовую коммерческую систему:

- пакеты публикаций;
- пакеты доступов к базе;
- контактные лимиты;
- продвижение;
- брендирование;
- сроки действия;
- остатки;
- история потребления.

### Обоснование

`HH` выигрывает тем, что employer всегда понимает, что именно он покупает и использует.

### Ожидаемый результат

- выше прозрачность монетизации;
- рост апсейла;
- меньше вопросов в поддержку.

## 3.9 Employer branding product

### Описание

Создать отдельный branding-layer:

- брендированная company page;
- брендированная vacancy template;
- employer media block;
- branded messages;
- brand analytics.

### Обоснование

Employer brand должен быть продуктом, а не одной опцией в форме.

### Ожидаемый результат

- рост ARPU;
- выше ценность платформы для крупных работодателей;
- больше доверия со стороны кандидатов.

## 3.10 Recruiter/account operations

### Описание

Добавить employer admin-слой:

- менеджеры;
- роли;
- branch managers;
- адреса компании;
- документы;
- журнал операций;
- лимиты и права доступа.

### Обоснование

`HH` хорошо закрывает operational governance работодателя внутри платформы.

### Ожидаемый результат

- лучше контроль доступа;
- удобнее работа больших работодателей;
- проще масштабирование аккаунта внутри компании.

## 3.11 Civility score и candidate trust

### Описание

Добавить метрики:

- скорость первого ответа;
- доля обработанных откликов;
- доля кандидатов без ответа;
- доля кандидатов с корректно закрытым статусом;
- trust badges у кандидатов и работодателей.

### Обоснование

Индекс вежливости `HH` — сильный сигнал дисциплины и качества процесса.

### Ожидаемый результат

- выше качество коммуникаций;
- ниже drop-off кандидатов;
- сильнее репутационная дифференциация работодателей.

---

# 4. UI/UX требования

## 4.1 Визуальные улучшения

Нужно сместить employer web от “простых экранов кабинета” к “рабочей операционной среде”, но без перегруза `HH`.

Требования:

- четкая иерархия блоков на dashboard;
- таблицы и списки с приоритетными метриками;
- status chips и alert markers;
- единая визуальная логика для:
  - urgency;
  - aging;
  - health;
  - quota usage;
  - automation;
- sticky action rail для ключевых recruiter-действий.

Измеримые критерии:

- новый отклик и проблемная вакансия должны быть заметны за 3-5 секунд после входа в кабинет;
- путь до action по вакансии не более 2 кликов.

## 4.2 Оптимизация пользовательских сценариев

Нужно сократить количество шагов в employer-flow.

Требования:

- `login -> see urgent queue -> open candidate -> act` не более 4 действий;
- `open vacancy -> understand health -> launch fix` не более 3 действий;
- `find candidate in DB -> save/invite` не более 5 действий;
- `create vacancy` разбить на логичные шаги с progress-state.

## 4.3 Улучшение конверсии

Нужно повысить conversion не только в apply, но и в employer-side activation и monetization.

Требования:

- видимые entitlements и остатки;
- понятные upsell-entrypoints только в релевантном контексте;
- CTA на продвижение показывать рядом с diagnostics;
- automation CTA показывать рядом с backlog и slow-response signals;
- candidate DB CTA показывать рядом с “недостаточно откликов”.

Целевые KPI:

- рост `login -> useful action` минимум на 25%;
- рост `vacancy creation start -> publish` минимум на 15%;
- рост использования candidate DB минимум на 20%;
- рост attach rate automation/promotion минимум на 10%.

## 4.4 Адаптивность и role-based UX

`VF-JobSite` не должен наследовать desktop-heavy слабости `HH`.

Требования:

- desktop mode для recruiter-heavy work;
- mobile-friendly mode для branch managers;
- упрощенные action cards на мобильном;
- table-to-card adaptation без потери критичных метрик.

## 4.5 Скорость и отзывчивость

Требования:

- быстрый рендер vacancy board и response inbox;
- skeleton states;
- оптимистичный UI для простых действий;
- быстрые фильтры и server-side search.

Целевые показатели:

- response inbox open < 2 c;
- filter/search interaction < 300 мс;
- bulk action completion feedback < 1 c.

---

# 5. Технические рекомендации

## 5.1 Производительность

### Рекомендации

- построить read-models для:
  - operations dashboard;
  - vacancy health;
  - recruiter workload;
  - response inbox;
  - entitlement summary;
- использовать Elasticsearch для candidate DB и recruiter-side filtering;
- считать vacancy health асинхронно и кэшировать snapshot-данные;
- вынести analytics events:
  - impression;
  - detail open;
  - apply start;
  - apply complete;
  - response open;
  - response action;
  - automation transition;
- развести online transactional workload и analytics aggregation.

### Ожидаемый эффект

- employer UI останется быстрым при росте числа вакансий и откликов;
- диагностика и аналитика не будут тормозить core workflow.

## 5.2 Безопасность

### Рекомендации

- role-based access для owner, recruiter, branch manager, finance/admin;
- аудит всех действий:
  - contact reveal;
  - status change;
  - bulk reject;
  - invite;
  - purchase;
  - automation rule change;
- квотирование и rate limiting на contact reveal и outbound messaging;
- защита candidate data и PII на уровне API, UI и audit log;
- безопасное делегирование прав между менеджерами работодателя.

### Ожидаемый эффект

- лучшее управление доступом;
- ниже риск утечки данных;
- выше готовность крупных работодателей работать в системе.

## 5.3 Масштабируемость

### Рекомендации

- выделить отдельные bounded contexts:
  - employer operations;
  - candidate search;
  - monetization/entitlements;
  - automation;
  - analytics;
- проектировать automation как event-driven слой поверх core hiring domain;
- хранить snapshot metrics отдельно от транзакционного домена;
- поддержать дальнейшее разделение на независимые сервисы:
  - marketplace/public;
  - recruiter ops;
  - billing/commerce;
  - notification/automation.

### Ожидаемый эффект

- `VF-JobSite` сможет расти одновременно как mass-hiring platform и как recruiting operating system;
- можно будет независимо масштабировать employer-heavy и candidate-heavy сценарии.

---

## Финальный вывод

`HeadHunter` сильнее `VF-JobSite` не в Telegram, geo или интеграционной архитектуре, а в дисциплине employer-side продукта. Он хорошо упаковал найм как ежедневную операционную работу работодателя.

Главный вектор улучшения после этого анализа:

- не пытаться копировать всю тяжесть `HH`;
- взять у него самые ценные B2B-паттерны:
  - operations dashboard;
  - vacancy health;
  - response triage;
  - candidate DB;
  - automation;
  - storefront;
  - entitlement-accounting;
- и совместить их с вашими сильными сторонами:
  - Telegram-first;
  - mass hiring;
  - geo;
  - MyID;
  - HRM bridge;
  - Central Asia localization.

Если реализовать требования этого документа, `VF-JobSite` сможет стать не только job platform, но и полноценным `mass-hiring operating system` для работодателя в Центральной Азии.

---

## Рекомендуемые KPI после реализации

- рост employer weekly active usage не менее чем на 25%;
- сокращение median time to first response минимум на 30%;
- рост `vacancy publish -> first candidate contact` минимум на 20%;
- рост attach rate платных продуктов минимум на 10-15%;
- снижение доли необработанных откликов минимум на 25%;
- рост доли вакансий с диагностикой и action-follow-up минимум на 50%.
