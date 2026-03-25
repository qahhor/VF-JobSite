# Verifix Jobs — ТЗ на улучшение v4.1
## На основе глубокого аудита конкурента HeadHunter (tashkent.hh.uz)

> Дата: 24.03.2026
> Версия: 4.1
> Основание: аудит `VF-JobSite`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы HeadHunter и просмотр авторизованного employer-кабинета `tashkent.hh.uz` в Google Chrome

---

## 1. Цель документа

Этот документ нужен, чтобы:

- зафиксировать, какие сильные продуктовые паттерны есть у `HeadHunter`;
- понять, чего не хватает `Verifix Jobs` именно как employer hiring product;
- превратить наблюдения в прикладное ТЗ для улучшения проекта;
- адаптировать сильные стороны HH под рынок blue-collar/mass hiring Центральной Азии.

Главный принцип:

- `Verifix Jobs` не должен становиться копией `HeadHunter`.
- Он должен взять лучшие B2B-механики HH и совместить их с нашими сильными сторонами:
  - Telegram-first candidate flow
  - SMS fallback
  - geolocation
  - MyID / verification
  - HRM bridge
  - gov integrations
  - multilingual Central Asia focus

---

## 2. Что изучено

## 2.1 Внутренние источники

- `Verifix_Jobs_TZ_v2.0_Complete.docx`
- `Verifix_Jobs_TZ_v2.1_Appendix.docx`
- репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- ранее подготовленный `Verifix_Jobs_Improvement_TZ_v4.0_GetAvery_Deep_Audit.md`

## 2.2 Публичные источники HeadHunter

- [Главная tashkent.hh.uz](https://tashkent.hh.uz/)
- [Турбо отклик / Вакансия дня](https://tashkent.hh.uz/article/30609)
- [Авторазбор откликов с чат-ботом](https://tashkent.hh.uz/article/31249)
- [Отклик из чата для быстрого найма линейного персонала](https://tashkent.hh.uz/article/30047)
- [Подтверждение английского языка в резюме](https://tashkent.hh.uz/article/31321)
- [Презентация про blue-collar hiring](https://tashkent.hh.uz/file/13273734.pdf)

## 2.3 Что изучено в авторизованном Google Chrome

Проверено в employer-кабинете `tashkent.hh.uz` 24 марта 2026:

- главная employer dashboard `https://tashkent.hh.uz/`
- список вакансий `https://tashkent.hh.uz/employer/vacancies`
- карточка вакансии и вкладка `Здоровье вакансии`
- отклики по вакансии `https://tashkent.hh.uz/employer/vacancyresponses?...`
- поиск по базе резюме `https://tashkent.hh.uz/search/resume?...`
- прайс `https://tashkent.hh.uz/price/recommended`
- пакеты доступа к базе `https://tashkent.hh.uz/price/combined-dbaccess`
- брендирование `https://tashkent.hh.uz/price/branding`
- счёт и услуги `https://tashkent.hh.uz/employer/account/money`
- сервисы `https://tashkent.hh.uz/services`
- automation `https://tashkent.hh.uz/employer/automation`
- создание вакансии `https://tashkent.hh.uz/employer/vacancy/create?...`

---

## 3. Что реально обнаружено у HeadHunter

## 3.1 Employer Dashboard как операционная панель

На главной employer-странице HH обнаружены:

- верхняя навигация:
  - `Вакансии`
  - `Прайс`
  - `Счёт`
  - `Сервисы`
  - `Помощь`
  - `Поиск`
- быстрый виджет поиска по резюме и навыкам;
- остатки по entitlements:
  - публикации
  - доступ к базе
  - открытые контакты
- список актуальных вакансий с откликами;
- блоки сохранённых поисков;
- updates / blog / articles;
- FAQ блок;
- встроенный support/content layer.

Вывод:

- HH homepage для работодателя не “welcome dashboard”, а operational console.
- Работодатель с первого экрана видит:
  - что у него куплено;
  - что у него активно;
  - где отклики;
  - где искать кандидатов;
  - где новости и помощь.

---

## 3.2 Vacancy List как hiring operations board

На странице вакансий HH обнаружены:

- сегментация:
  - активные
  - черновики
  - архив
  - шаблоны
- vacancy table с операционными колонками:
  - просмотры
  - отклики
  - в работе
  - релевантные резюме
  - срок истечения
  - продвижение
  - менеджер
- действия:
  - `Поднять`
  - `Подключить`
  - `Новая вакансия`
- массовый hiring-signal:
  - “у менеджеров 99+ неразобранных откликов”
- `Индекс вежливости компании`.

Вывод:

- HH очень хорошо превращает список вакансий в performance table.
- У вакансии есть не только статус, но и коммерческая/операционная эффективность.

---

## 3.3 Vacancy Detail и Vacancy Health

В карточке вакансии HH обнаружены:

- полная публичная карточка глазами кандидата;
- служебный employer layer:
  - `Поднять`
  - `Редактировать`
  - просмотры
  - отклики
  - продвижение
  - подобранные резюме
- отдельная вкладка `Здоровье вакансии`.

Во вкладке `Здоровье вакансии` обнаружены:

- показы в поиске;
- просмотры;
- отклики;
- конверсия;
- сигнал `ниже конкурентов`;
- график статистики за период;
- upsell блока продвижения;
- рекомендации релевантных кандидатов.

Вывод:

- HH оценивает вакансию как маркетинговую воронку;
- это очень сильный паттерн, которого сейчас не хватает `VF-JobSite`.

---

## 3.4 Отклики и массовый рекрутинг

На странице откликов HH обнаружены:

- развернутая hiring funnel по этапам;
- статусы и этапы:
  - все неразобранные
  - подходящие
  - подумать
  - первичный контакт
  - звонок
  - мессенджер
  - связаться еще раз
  - тестовое задание
  - собеседование
  - предложение о работе
  - выход на работу
  - не подходит
  - кандидат отказался
  - не выходит на связь
  - вакансия закрыта
  - перевод на другую вакансию
- план найма по вакансии;
- candidate cards с:
  - откликнулся / был сегодня / обновлено
  - зарплатные ожидания
  - статус поиска
  - общий опыт
  - последнее место работы
  - география
  - карта
  - телефон
  - chat
  - invite / reject
  - favorites
  - sending to hiring manager.

Вывод:

- HH очень силен в верхней и средней части recruiter workflow.
- У них отклики не просто “список кандидатов”, а real recruitment board.

---

## 3.5 Автоматизация массового найма

На странице `employer/automation` обнаружены:

- отдельный automation hub;
- экономия времени, выраженная в минутах и часах;
- `Авторазбор`;
- `Чат-бот подбора из базы резюме`;
- расчёт выгоды:
  - сколько минут экономится
  - сколько кандидатов можно не потерять
  - влияние на индекс вежливости;
- FAQ по automation;
- подключение automation сразу к нескольким вакансиям.

Согласно публичной статье от 15 декабря 2023 года, авторазбор у HH:

- оценивает отклики по фильтрам;
- задаёт вопросы через чат-бот;
- переводит кандидатов по воронке;
- отправляет автосообщения;
- позволяет масштабировать сценарий на похожие вакансии;
- помогает держать индекс вежливости не ниже 90%;
- особенно полезен для массового найма.

Источники:

- [Авторазбор откликов с чат-ботом](https://tashkent.hh.uz/article/31249)
- авторизованная страница `https://tashkent.hh.uz/employer/automation`

Вывод:

- это одна из самых сильных зон HH.
- У `VF-JobSite` есть notification/AI baselines, но пока нет настолько productized automation layer для recruiter workflow.

---

## 3.6 Поиск по базе резюме

В поиске по резюме HH обнаружены:

- полноценная база кандидатов;
- быстрый поиск по тексту;
- фильтры:
  - город
  - район
  - опыт в профессии
  - статус поиска
  - тип занятости
  - график работы
  - общий опыт
  - дополнительные фильтры
- shortcut:
  - выбрать вакансию и автоматически применить фильтры из неё;
- sort and view control;
- candidate cards со структурированными данными;
- мгновенный доступ к контактам, чату, избранному и комментариям;
- вкладки:
  - поиск по базе
  - избранное
  - автопоиск.

Вывод:

- HH продаёт не только размещение вакансий, но и активный outbound recruiting через resume DB.
- Это отдельный revenue/product pillar.

---

## 3.7 Прайс как storefront, а не прайс-лист

На `Прайс` HH обнаружены:

- категориями упакованные услуги:
  - спецпредложения
  - доступ к базе резюме
  - докупка контактов
  - размещение вакансий
  - брендирование
- bundle-based продажа;
- отдельные продуктовые офферы;
- CTA `Купить`.

На странице пакетов доступа к базе обнаружены:

- число кандидатов в стране;
- прирост актуальных резюме за месяц;
- пакеты по сроку:
  - 30 дней
  - 3 месяца
  - 6 месяцев
  - 12 месяцев
- ограничения:
  - число открываемых контактов
  - число публикаций;
- экономия через скидки по сроку.

Вывод:

- HH очень грамотно продаёт availability + urgency + scale.
- Это намного сильнее, чем простой `subscription tiers`.

---

## 3.8 Брендирование как отдельное продукт-направление

На `price/branding` обнаружены:

- индивидуальный шаблон вакансии;
- типовой шаблон вакансии;
- базовый брендированный шаблон вакансии;
- брендированные страницы компании разных уровней;
- конструктор страниц компании;
- брендированные шаблоны писем;
- заявка / корзина / отдельная коммерциализация.

Вывод:

- HH монетизирует employer brand отдельно от vacancy posting.
- У `Verifix Jobs` branding baseline уже есть, но пока он не productized на таком уровне.

---

## 3.9 Счёт, entitlements и документы

На счёте HH обнаружены:

- баланс;
- услуги;
- документы;
- история;
- остатки:
  - публикации вакансий
  - доступ к базе резюме
  - открытые контакты;
- даты действия entitlement’ов;
- region/specialization constraints;
- закупка дополнительных пакетов.

Вывод:

- HH делает entitlement-accounting прозрачным.
- Работодатель всегда понимает, что именно он купил, что осталось и когда закончится.

---

## 3.10 Сервисы как product catalog

На странице `Сервисы` HH обнаружены:

- подбор сотрудников;
- поиск по базе резюме;
- брендированная вакансия;
- реклама на сайте;
- боты для подбора;
- тестирование соискателей;
- вебинары и сертификация;
- статьи и образовательный контент.

Вывод:

- HH продаёт экосистему, а не только job board.

---

## 3.11 Vacancy Creation

В создании вакансии HH обнаружены:

- пошаговую длинную structured form;
- план найма;
- employment type;
- work format;
- legal form of engagement;
- shifts and work hours;
- publication city and precise address;
- salary and payment frequency;
- vacancy text;
- skills;
- languages;
- driver license;
- AI generation shortcut:
  - `Сгенерируйте вакансию за пару минут`.

Также есть встроенные quality hints:

- предупреждение про дискриминацию;
- рекомендации по навыкам;
- structured section progress.

Вывод:

- HH очень хорошо собирает структуру вакансии и поддерживает quality control.
- Они не отказались от формы, а усилили её AI-entrypoint.

---

## 3.12 Отклик из чата для линейного персонала

Публичная статья HH от 3 марта 2022 фиксирует отдельный сценарий:

- кандидат может откликнуться без полноценного резюме;
- flow сокращается до:
  - отклик
  - авторизация
  - ответы на вопросы в чате
  - приглашение;
- решение особенно ориентировано на blue-collar / линейный персонал.

Источник:

- [Отклик из чата](https://tashkent.hh.uz/article/30047)

Вывод:

- это очень сильный сигнал для `Verifix Jobs`.
- Наше преимущество здесь может быть ещё сильнее, потому что у нас есть Telegram-native flow.

---

## 3.13 Валидация навыков кандидата

HH даёт кандидату возможность подтверждать навыки, например английский язык, и показывает это работодателю в резюме.

Источник:

- [Подтверждение английского языка](https://tashkent.hh.uz/article/31321)

Вывод:

- validated skills улучшают trust в candidate database.
- Для `Verifix Jobs` это можно адаптировать через:
  - MyID
  - training partners
  - simple tests
  - employer-side badges

---

## 4. Что у HeadHunter сильнее, чем у текущего VF-JobSite

На 24 марта 2026 HH заметно сильнее в следующих зонах:

- employer operational dashboard;
- vacancy operations board;
- vacancy health and conversion diagnostics;
- candidate database search как отдельный продукт;
- monetization storefront;
- entitlement accounting;
- recruiter automation and autoparse;
- detailed response workflow for mass hiring;
- service marketplace and upsell mechanics;
- help/support integration inside employer workflow;
- productized employer branding offers;
- account ops:
  - managers
  - quotas
  - addresses
  - documents.

---

## 5. Где Verifix Jobs потенциально сильнее HeadHunter

Если правильно развить продукт, `Verifix Jobs` может быть сильнее HH в:

- Telegram-first candidate journey;
- Mini App UX;
- SMS fallback;
- MyID/KYC verification;
- geolocation and nearby jobs;
- referral engine;
- Verifix HRM closed loop;
- gov integrations;
- multi-country Central Asia architecture;
- better adaptation for budget Android + unstable connection;
- blue-collar-first speed and simplicity.

Вывод:

- HH силён как большой hiring marketplace и B2B recruiting machine.
- Мы можем выиграть, если совместим HH-style employer rigor с региональными и mobile-first преимуществами `Verifix Jobs`.

---

## 6. Что нельзя копировать у HH без адаптации

- тяжелую portal UX с большим количеством dense screens как default для всех пользователей;
- resume-first assumption для blue-collar audience;
- сложную биллинговую механику без локального объяснения ценности;
- desktop-biased recruiter flow без branch-manager mobile mode;
- кандидатоцентричный flow, требующий полноценного CV до первого отклика.

---

## 7. ТЗ на улучшение Verifix Jobs

## 7.1 Epic P0 — Employer Operations Dashboard

### Цель

Превратить employer dashboard из KPI-виджета в рабочую операционную панель.

### Нужно добавить

- entitlements summary:
  - активные публикации
  - остаток продвижений
  - остаток открытий контактов
  - активные пакеты / доступы
- vacancies snapshot;
- recruiter workload snapshot;
- new responses queue;
- quick candidate search;
- recent updates and help;
- quick actions:
  - создать вакансию
  - найти кандидатов
  - пополнить баланс
  - подключить automation.

### Backend

- `GET /api/v1/employer/operations-dashboard`

### Frontend

- переписать [dashboard.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/dashboard/dashboard.component.ts)
- добавить секции:
  - entitlements
  - vacancies in progress
  - action queue
  - quick candidate search
  - support/content rail

---

## 7.2 Epic P0 — Vacancy Operations Board

### Цель

Сделать список вакансий инструментом ежедневного управления наймом.

### Нужно добавить

- vacancy table с колонками:
  - просмотры
  - отклики
  - в работе
  - подходящие кандидаты
  - expires_at
  - promotion status
  - automation status
  - hiring plan progress
  - recruiter owner
- tabs:
  - active
  - draft
  - archived
  - templates
- mass action banners;
- quick actions:
  - поднять
  - продлить
  - включить авторазбор
  - подключить продвижение.

### Новые сущности

- `vacancy_template`
- `vacancy_promotion`
- `vacancy_health_snapshot`
- `vacancy_workload_snapshot`

---

## 7.3 Epic P0 — Vacancy Health

### Цель

Дать работодателю диагностику эффективности вакансии.

### Метрики

- impressions
- opens
- applies
- conversion
- median time to first response
- lost candidates due to slow response
- salary competitiveness
- geo competitiveness
- benchmark against similar vacancies

### Новые выводы системы

- ниже конкурентов по конверсии;
- слабое описание;
- слишком низкая зарплата;
- нет адреса;
- нет брендинга;
- долго обрабатываются отклики.

### Backend

- `GET /api/v1/vacancies/{id}/health`
- `GET /api/v1/vacancies/{id}/benchmark`

---

## 7.4 Epic P0 — Response Operations / Mass Hiring Pipeline

### Цель

Сделать pipeline пригодным для high-volume recruiting.

### Что нужно

- этапы уровня HH, адаптированные под `Verifix Jobs`;
- отдельные fast-action статусы;
- hiring plan progress;
- card/list/table modes;
- action buttons on candidate cards;
- recruiter comments;
- send to hiring manager;
- shortlist / think / contact / messenger / interview / offer / hired / unreachable / declined.

### Новые статусы приложения

- `THINK`
- `PRIMARY_CONTACT`
- `MESSENGER_CONTACT`
- `RECONTACT`
- `NO_RESPONSE`
- `TRANSFERRED`

### Frontend

- сильно расширить [pipeline.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/pipeline/pipeline.component.ts)
- добавить:
  - recruiter action toolbar
  - candidate quick card
  - hiring target progress
  - bulk status update

---

## 7.5 Epic P0 — Auto Parsing And Recruiter Automation

### Цель

Закрыть самый сильный operational gap с HH.

### Нужно реализовать

- AutoParse for incoming applications:
  - rule-based filtering
  - AI-assisted prioritization
  - chat questions
  - automatic stage movement
  - automated invite/reject messaging
- template-based autoparse scenarios;
- share automation setup across similar vacancies;
- recruiter-visible automation ROI.

### Источники вдохновения

- HH `Авторазбор`
- HH `Чат-бот подбора из базы резюме`

### Адаптация для Verifix

- channels:
  - Telegram first
  - Push second
  - SMS fallback
- questions tuned for frontline hiring:
  - can start when
  - ready for shift
  - has medbook/documents
  - ready for commute radius
  - salary expectation
  - contract acceptance

### Backend

- `POST /api/v1/automation/autoparse`
- `POST /api/v1/automation/templates`
- `POST /api/v1/automation/apply-to-vacancies`
- `GET /api/v1/automation/roi`

### Новые сущности

- `automation_rule`
- `automation_template`
- `automation_run`
- `automation_action_log`

---

## 7.6 Epic P0 — Candidate Database And Contact Credits

### Цель

Сделать candidate database не только feature, а отдельным monetizable product.

### Функциональность

- candidate database search;
- contact reveal credits;
- saved candidate lists;
- favorites;
- notes/comments;
- direct invite;
- search by vacancy-fit;
- geo and radius filters;
- availability and shift filters.

### Важная адаптация

В отличие от HH, у нас candidate database должен включать:

- Telegram-first candidates;
- partially structured profiles;
- non-CV candidates;
- referral origin;
- geolocation confidence;
- verification badges.

### Новые сущности

- `contact_credit_pack`
- `contact_reveal_log`
- `candidate_favorite`
- `candidate_note`
- `saved_candidate_list`

### Backend

- `GET /api/v1/candidate-database/search`
- `POST /api/v1/candidate-database/{id}/reveal-contact`
- `POST /api/v1/candidate-database/lists`

---

## 7.7 Epic P0 — Vacancy Creation Wizard 3.0

### Цель

Сделать создание вакансии одновременно:

- структурированным;
- быстрым;
- адаптированным под массовый найм.

### Что добавить

- plan-to-hire;
- legal employment type;
- shift templates;
- working hours;
- pay frequency;
- precise address with map validation;
- commute hints;
- anti-discrimination checks;
- AI generate draft;
- save as template.

### AI слой

- text-to-vacancy generation;
- salary suggestion;
- missing-field detection;
- predicted response volume;
- vacancy quality score.

### Frontend

- расширить [vacancy-form.component.ts](/D:/DATA/VFX/VF-JobSite/verifix-jobs/verifix-jobs-web/src/app/features/vacancies/vacancy-form.component.ts)

---

## 7.8 Epic P0 — Monetization Storefront

### Цель

Перевести billing с “plan purchase” на “service marketplace”.

### Нужно добавить

- storefront categories:
  - vacancy posting
  - promotions
  - candidate database
  - contact packs
  - branding
  - automation
  - analytics
- bundles;
- urgency offers;
- local pricing in UZS;
- cart and checkout;
- invoice/documents flow.

### Backend

- `GET /api/v1/storefront/catalog`
- `POST /api/v1/storefront/cart`
- `POST /api/v1/storefront/checkout`
- `GET /api/v1/billing/documents`

### Новые сущности

- `catalog_product`
- `catalog_bundle`
- `employer_entitlement`
- `billing_document`

---

## 7.9 Epic P1 — Employer Branding Productization

### Цель

Сделать branding отдельной линейкой продуктов, как у HH.

### Линии продукта

- branded vacancy lite;
- branded vacancy pro;
- company page builder;
- industry/company template sets;
- branded notification/email templates;
- media blocks and analytics.

### Адаптация для Verifix

- брендированный vacancy page;
- брендированный Telegram card style;
- branded Mini App company profile;
- branch-specific branding for large employers.

---

## 7.10 Epic P1 — Employer Account Operations

### Цель

Дать работодателю нормальные account controls.

### Нужно добавить

- managers;
- role management;
- branch addresses;
- quotas/limits;
- docs/contracts/invoices;
- balance history;
- service activations;
- region/specialization restrictions.

### Новые сущности

- `employer_manager_quota`
- `office_address`
- `billing_contract`
- `service_activation`

---

## 7.11 Epic P1 — Candidate Experience Score / Civility Index

### Цель

Ввести измеримую employer metric по качеству обработки кандидатов.

### Что считать

- median first response time;
- % candidates responded in SLA;
- % candidates left unanswered;
- % automated status notifications sent;
- % rejected candidates informed;
- % invited candidates contacted in time.

### Вывод

- `Civility Score` / `Candidate Experience Score`
- badges and warnings

### Польза

- улучшает кандидатский опыт;
- помогает работодателю не терять кандидатов;
- позволяет монетизировать automation.

---

## 7.12 Epic P1 — Fast Apply / Chat Apply for Blue-Collar

### Цель

Сделать наш ответ на HH `Отклик из чата`, но сильнее.

### Нужно добавить

- apply without full CV;
- Telegram conversational apply;
- SMS fallback apply;
- minimal profile apply;
- post-apply qualification questions.

### Наше преимущество

- у HH это web/chat extension;
- у нас это может стать native Telegram flow и работать лучше именно на рабочих позициях.

---

## 7.13 Epic P1 — Support And Education Layer

### Цель

Встроить помощь и обучение в employer product.

### Нужно добавить

- contextual help;
- FAQ in modules;
- support contact options;
- manager contact;
- webinars / guides / best practices;
- vacancy-writing hints.

---

## 7.14 Epic P1 — Verified Skills And Micro-Assessment

### Цель

Улучшить trust к профилям кандидатов.

### Нужно добавить

- skill tests;
- verified language badges;
- verified training/certification;
- employer-side weight in search and ranking.

### Адаптация для Verifix

- not only English;
- practical blue-collar validations:
  - касса
  - склад
  - call-center
  - safety basics
  - medbook/doc status

---

## 8. Что использовать из текущего VF-JobSite

Нужно расширять уже существующие слои, а не переписывать с нуля:

- billing/subscription baseline;
- branding service;
- analytics service;
- matching service;
- notification service;
- moderation service;
- search service;
- Telegram bot and Mini App;
- candidate database/search baseline;
- MyID and compliance layers.

---

## 9. Приоритеты реализации

## Wave 1

- employer operations dashboard
- vacancy operations board
- vacancy health
- mass hiring pipeline extension
- auto parsing MVP

## Wave 2

- storefront and entitlements
- candidate database monetization
- vacancy wizard 3.0
- employer account ops

## Wave 3

- branding productization
- civility index
- fast apply / chat apply
- support and education layer

## Wave 4

- verified skills
- deeper automation templates
- advanced promotion marketplace
- predictive hiring insights

---

## 10. Финальный вывод

Главный урок HeadHunter:

- сила продукта не только в объёме вакансий и резюме,
- а в том, что recruiter-side операционная работа упакована в понятные интерфейсы, метрики, automation и monetization surfaces.

Главный шанс Verifix Jobs:

- взять эту employer rigor-модель,
- но совместить её с тем, чего у HH нет на региональном уровне:
  - Telegram-native blue-collar UX
  - geolocation
  - verification
  - referral loops
  - HRM closed loop
  - CA-first localization.

Идеальная цель:

- `HeadHunter-level employer operating model`
- плюс `Verifix-native Central Asia frontline hiring engine`.

