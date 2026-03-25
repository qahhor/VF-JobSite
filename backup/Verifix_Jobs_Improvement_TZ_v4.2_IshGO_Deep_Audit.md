# Verifix Jobs - ТЗ на улучшение v4.2
## На основе аудита конкурента IshGO

> Дата: 24.03.2026
> Версия: 4.2
> Основание: аудит `VF-JobSite`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы IshGO и проход по `ishgo.uz` в Google Chrome

---

## 1. Цель документа

Этот документ нужен, чтобы:

- зафиксировать, чем силен `IshGO` как локальный job marketplace для Узбекистана;
- понять, каких именно public-marketplace и candidate-discovery слоев не хватает `VF-JobSite`;
- превратить наблюдения в прикладное ТЗ для улучшения продукта;
- не копировать IshGO буквально, а использовать его сильные паттерны вместе с нашими преимуществами:
  - Telegram-first;
  - geolocation/PostGIS;
  - MyID/verification;
  - HRM bridge;
  - gov integrations;
  - mass hiring focus.

Главный вывод:

- `v4.0` был про employer intelligence уровня Avery.
- `v4.1` был про employer operations уровня HeadHunter.
- `v4.2` должен закрыть еще один большой gap: публичный candidate marketplace и acquisition/distribution layer уровня IshGO.

---

## 2. Что изучено

## 2.1 Внутренние источники

- `Verifix_Jobs_TZ_v2.0_Complete.docx`
- `Verifix_Jobs_TZ_v2.1_Appendix.docx`
- репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- ранее подготовленные документы:
  - `Verifix_Jobs_Improvement_TZ_v4.0_GetAvery_Deep_Audit.md`
  - `Verifix_Jobs_Improvement_TZ_v4.1_HeadHunter_Deep_Audit.md`

## 2.2 Что изучено в проекте `VF-JobSite`

Были повторно сопоставлены ключевые части текущего employer web:

- `verifix-jobs-web/src/app/app.routes.ts`
- `verifix-jobs-web/src/app/features/dashboard/dashboard.component.ts`
- `verifix-jobs-web/src/app/features/vacancies/vacancy-list.component.ts`
- `verifix-jobs-web/src/app/features/pipeline/pipeline.component.ts`
- `verifix-jobs-web/src/app/features/candidates/candidates.component.ts`
- `verifix-jobs-web/src/app/features/analytics/analytics.component.ts`
- `verifix-jobs-web/src/app/features/billing/billing.component.ts`

Фактическое состояние на сегодня:

- employer-side web уже существует;
- backend foundation сильный;
- public candidate web-marketplace в текущей реализации выражен слабо или отсутствует как отдельный продуктовый слой.

## 2.3 Публичные источники IshGO

- [IshGO vacancies](https://ishgo.uz/vacancies)
- [IshGO categories](https://ishgo.uz/categories)
- [IshGO companies](https://ishgo.uz/companies)
- [IshGO about](https://ishgo.uz/infos/kompaniya-haqida?detail=20f58a61-994f-9fd8-db04-5287ac889207&detail-type=info)
- [Jobster](https://jobster.hr/)

## 2.4 Что просмотрено в Google Chrome 24 марта 2026

Пройдено в Chrome с кликами и скроллом по основным публичным сценариям:

- `https://ishgo.uz/vacancies`
- карточка вакансии:
  - `https://ishgo.uz/vacancies/burger-king-uzb-rabotnik-restorana-universal-0003196`
- modal подачи на вакансию через `Ishga topshirish`
- карта вакансий:
  - `https://ishgo.uz/vacancies?child=map`
- категории:
  - `https://ishgo.uz/categories`
- компании:
  - `https://ishgo.uz/companies`
- company page:
  - `https://ishgo.uz/companies/safia-0000985`
- вкладка `Korxona haqida` на company page
- `favorites`:
  - `https://ishgo.uz/favorites`
- auth entrypoint через modal `Kirish`
- блок `Biz haqimizda`

---

## 3. Что реально обнаружено у IshGO

## 3.1 IshGO - это не просто список вакансий, а локальный recruiting marketplace

На странице `Biz haqimizda` IshGO сам позиционирует себя как:

- AI-supported national recruiting ecosystem;
- проект `Jobster`;
- платформу для поиска работы и подбора сотрудников;
- инструмент с Telegram integration;
- инструмент с HR-system integration;
- агрегатор вакансий и резюме;
- продукт с desktop web, mobile web и Telegram Mini App.

Для работодателя там публично обещаются:

- быстрая интеграция с HR-системой;
- неограниченное размещение вакансий по регионам Узбекистана;
- поиск по базе резюме;
- полная интеграция с Telegram;
- усиление HR-бренда;
- помощь личного менеджера;
- AI generation вакансий;
- локальный поиск кандидатов по районам/локациям.

Вывод:

- IshGO продает не только вакансии, но и distribution + recruiting infrastructure.
- Это очень близко к нашему видению, но у нас этот слой пока не productized на public web.

## 3.2 Сильный public vacancy marketplace

На `ishgo.uz/vacancies` обнаружено:

- публичный листинг вакансий без лишнего friction;
- быстрый поиск по вакансиям;
- сортировка;
- карточки с зарплатой, компанией, типом занятости, work mode, датой и метками `TOP`/`Yangi`;
- простой и понятный local-first UX;
- блок статистики:
  - `25,200+` резюме;
  - `2,130+` вакансий;
  - `200+` компаний.

Почему это важно:

- кандидат сразу видит market liquidity;
- сайт не выглядит пустым;
- вакансии считываются как живой маркетплейс, а не как корпоративный кабинет.

## 3.3 Карта вакансий и nearby-search

На `vacancies?child=map` обнаружено:

- отдельный map mode;
- переключение list/map;
- маркеры вакансий по карте;
- `Menga yaqin` как понятный local use case.

Вывод:

- IshGO очень правильно делает географию visible прямо в public layer.
- Для blue-collar найма это критично, потому что commute и район часто влияют на конверсию не меньше зарплаты.

## 3.4 Категории как acquisition surface

На `ishgo.uz/categories` обнаружено:

- отдельный public category catalog;
- для каждой категории показываются:
  - число вакансий;
  - число компаний;
- категории заточены под mass hiring:
  - trade and retail;
  - restaurants and fast food;
  - admin staff;
  - workers/service;
  - transport;
  - logistics;
  - cleaning;
  - manufacturing;
  - medicine/pharma;
  - construction;
  - security.

Вывод:

- IshGO строит discovery не только от поиска, но и от browsing.
- Это особенно полезно для кандидатов без четко сформулированного резюме или запроса.

## 3.5 Company directory и public employer branding

На `ishgo.uz/companies` и `company page` обнаружено:

- отдельный каталог компаний;
- у компании есть публичная карточка;
- есть число активных вакансий;
- есть отраслевые теги;
- есть company-specific vacancy list;
- есть вкладка `Korxona haqida`;
- на company page видны адрес и сайт;
- публичный каталог работодателей встроен в общий candidate funnel.

Вывод:

- IshGO превращает работодателя в discoverable public object, а не только в автора вакансии.
- Это помогает и конверсии, и HR-branding.

## 3.6 Очень низкий friction во входе кандидата

На `Kirish` обнаружен modal:

- один input: телефон;
- две action-кнопки:
  - `Kirish`
  - `Ro'yxatdan o'tish`

Вывод:

- вход не уводит пользователя на тяжелую отдельную страницу;
- phone-first auth соответствует локальному рынку;
- это сильный паттерн для mobile-first candidate acquisition.

## 3.7 Apply flow с выбором филиала/локации

На карточке вакансии у IshGO есть:

- табы:
  - `Ish tavsifi`
  - `Korxona haqida`
  - `Boshqa vakansiyalar`
- CTA `Ishga topshirish`.

После нажатия `Ishga topshirish` открывается modal:

- `Hududlarga ariza topshirish`;
- несколько адресов/локаций работодателя;
- финальная кнопка apply активируется после выбора точки.

Вывод:

- для mass hiring это очень правильная механика;
- кандидат откликается не просто в компанию, а в конкретную точку/филиал;
- это снижает операционный шум для работодателя и улучшает matching.

## 3.8 Favorites как retention-механика

На `favorites` обнаружено:

- отдельный public surface `Tanlanganlar`;
- пустой state `Kechirasiz, ma’lumot yo‘q...`.

Вывод:

- даже простая favorite-механика усиливает возвращаемость;
- это базовый, но важный retention слой, которого обычно не хватает backend-first продуктам.

## 3.9 Что IshGO делает действительно хорошо

- public marketplace выглядит живым;
- локальный язык и local-market copy хорошо чувствуют Узбекистан;
- география вынесена в front door;
- быстрый phone-first auth снижает friction;
- company directory и category directory увеличивают органический browsing;
- apply flow хорошо адаптирован к multi-branch работодателям;
- Telegram и HR integration встроены в public positioning.

## 3.10 Что у IshGO выглядит ограниченно

По результату аудита видно и обратную сторону:

- public filters пока довольно простые;
- employer-side productization не выглядит такой сильной, как у HH/Avery;
- часть страниц ощущается скорее как public marketplace, чем как recruiter OS;
- company pages простые, без глубокого intelligence layer;
- в UI местами есть rough edges и минимализм выше нормы.

Вывод:

- IshGO силен именно в acquisition/distribution.
- Значит для `VF-JobSite` забирать нужно не весь продукт целиком, а именно его public-marketplace паттерны.

---

## 4. Где сейчас находится VF-JobSite относительно IshGO

## 4.1 Что у нас уже сильнее

По текущему репозиторию и ТЗ у `VF-JobSite` уже сильная база:

- backend platform;
- Telegram stack;
- MyID и verification baseline;
- PostGIS and nearby logic;
- ATS/pipeline foundation;
- billing/subscription;
- moderation;
- notifications;
- HRM bridge;
- gov/reporting integration direction.

Это значит:

- у нас есть шанс собрать более сильный end-to-end hiring platform, чем у IshGO;
- но для этого нужно подтянуть внешний acquisition layer.

## 4.2 Главный gap

Главный пробел сейчас не в backend, а в public candidate surface.

Текущее employer web в коде показывает:

- `app.routes.ts` - в основном защищенный employer cabinet;
- `dashboard.component.ts` - KPI dashboard, но не public market surface;
- `vacancy-list.component.ts` - employer list table, не public jobs marketplace;
- `candidates.component.ts` - простая база кандидатов, но не public candidate acquisition funnel;
- `pipeline.component.ts` - ATS-kanban, а не public application-discovery layer.

Иными словами:

- у нас есть employer operating foundation;
- у IshGO сильнее public discovery, candidate acquisition и distribution front door.

## 4.3 Что отсутствует или выражено слабо

Относительно IshGO у `VF-JobSite` нужно усилить:

- отдельный public vacancy portal;
- отдельный public company directory;
- category-based browsing;
- public map-based search;
- phone-first web auth modal;
- simple favorite/save behavior;
- web apply flow с выбором филиала/точки;
- public employer branding pages;
- SEO/organic discovery layer;
- public liquidity signals:
  - сколько вакансий;
  - сколько компаний;
  - сколько кандидатов;
  - какие категории активны.

---

## 5. Стратегическое решение для Verifix Jobs

`Verifix Jobs` должен стать:

- не только employer cabinet;
- не только Telegram bot;
- не только backend platform;
- а полноценным hybrid recruiting marketplace:
  - public web discovery;
  - Telegram-native conversion;
  - employer ATS operations;
  - HRM/government bridge.

Правильная комбинация ролей:

- от IshGO взять public marketplace;
- от HH взять recruiter operations;
- от Avery взять intelligence/productized value;
- из собственного ТЗ сохранить Telegram, geo, MyID, HRM и gov differentiation.

---

## 6. Целевое ТЗ на улучшение проекта

## 6.1 Public Candidate Web Platform

Нужно создать полноценный public candidate layer со следующими разделами:

- `/jobs`
- `/jobs/map`
- `/jobs/:slug`
- `/categories`
- `/companies`
- `/companies/:slug`
- `/favorites`

Требования:

- mobile-first layout;
- быстрый first paint;
- SEO-friendly страницы;
- локальные языки:
  - uz latin;
  - uz cyrillic;
  - ru;
  - en;
- share-friendly vacancy URLs;
- SSR/prerender для ключевых public страниц.

## 6.2 Public Vacancy Marketplace

Нужно реализовать public vacancy list не как dump таблицы, а как market surface.

На карточке вакансии должны быть:

- title;
- employer/company name;
- city/district;
- salary range;
- job type;
- work mode;
- freshness label;
- promoted/top marker;
- branch count, если вакансия multi-location;
- quick actions:
  - save;
  - open;
  - share to Telegram.

Фильтры:

- query;
- city;
- district;
- category;
- job type;
- work mode;
- salary range;
- today/new;
- nearby.

Сортировки:

- newest;
- nearest;
- salary high to low;
- relevant;
- promoted/top.

## 6.3 Public Vacancy Detail 2.0

Карточка вакансии должна включать:

- описание;
- требования;
- график/shift;
- salary terms;
- number of openings;
- address map block;
- commute hint;
- company mini-profile;
- similar jobs;
- other jobs from this employer;
- branch/location selector;
- CTA:
  - `Apply now`
  - `Save`
  - `Open in Telegram`

Обязательные табы:

- `Описание`
- `О компании`
- `Другие вакансии`
- `Локации`

## 6.4 Apply Flow c Branch Selection

Для вакансий с несколькими филиалами нужен flow:

1. кандидат нажимает `Apply`;
2. если у вакансии несколько точек, выбирает филиал/локацию;
3. при необходимости выбирает смену;
4. проходит quick screener;
5. подтверждает отклик;
6. получает follow-up в Telegram или SMS.

Обязательные правила:

- нельзя заставлять кандидата строить длинное CV до первого отклика;
- если есть phone auth, отклик должен продолжаться после верификации без потери контекста;
- employer должен видеть, в какой филиал подан отклик.

## 6.5 Phone-First Auth и Quick Registration

Нужно реализовать public web auth по паттерну IshGO, но сильнее:

- modal login/register вместо тяжелого full-page auth;
- телефон как primary identity;
- Telegram deep link как preferred continuation;
- SMS OTP как fallback;
- progressive profiling после входа, а не до входа;
- сохранение favorite/apply intent до завершения auth.

Минимальный первый шаг:

- phone;
- consent;
- OTP verification.

Следующий шаг профиля:

- имя;
- язык;
- город;
- район;
- профессия/роль;
- готовность к сменам;
- геолокация;
- Telegram binding.

## 6.6 Category Hubs

Нужно превратить категории в сильные SEO и discovery landings.

Для каждой категории:

- count вакансий;
- count компаний;
- top employers;
- популярные города;
- salary hints;
- related categories;
- CTA в Telegram bot;
- list/map switch.

## 6.7 Company Directory и Employer Branding Pages

Нужно создать public company pages уровня выше IshGO.

На company page должны быть:

- brand cover;
- logo;
- verified badge;
- industry tags;
- active vacancy count;
- branch map;
- about company;
- почему работать у нас;
- графики/условия;
- media gallery;
- FAQ;
- recruiter response speed;
- jobs from this employer;
- CTA:
  - apply;
  - follow company;
  - open in Telegram.

Если компания использует Verifix HRM, это должно усиливать страницу:

- verified employer badge;
- trust markers;
- onboarding readiness;
- transparent locations.

## 6.8 Public Map Experience

Нужно productize map layer как один из core differentiators.

Нужно поддержать:

- `near me`;
- radius search;
- district polygons;
- map clusters;
- list sync with map;
- commute hints;
- branch-aware results;
- distance badge on cards.

На mobile:

- bottom sheet pattern;
- sticky result count;
- one-thumb filters.

## 6.9 Favorites, Saved Searches и Return Loops

Нужно добавить retention слой:

- saved vacancies;
- saved searches;
- recent views;
- alerts by category/city;
- Telegram alerts;
- push alerts, где доступно;
- reminder to finish application.

## 6.10 Candidate Resume Builder и Quick Profile

С учетом IshGO и нашего ТЗ нужно сделать быстрый resume/profile builder:

- базовая анкета без длинных обязательных полей;
- work history optional;
- skills chips;
- desired role;
- salary expectation;
- work schedule preference;
- district preference;
- transport availability;
- MyID verification status;
- Telegram profile continuation.

Фокус:

- быстрый профайл для blue-collar кандидата;
- не desktop-HR-форма, а short mobile flow.

## 6.11 Employer Distribution Analytics

В employer cabinet нужно добавить отдельный блок public marketplace analytics.

По вакансии:

- impressions;
- opens;
- apply starts;
- apply completes;
- favorite rate;
- map opens;
- Telegram transfers;
- CTR by city/district;
- branch-wise applications;
- source split:
  - web;
  - map;
  - Telegram;
  - referral;
  - direct.

Это должно дополнить текущие dashboard и analytics, а не дублировать их.

## 6.12 HR Integration и Vacancy Distribution Layer

Нужно связать employer-side creation с public distribution:

- вакансия из employer cabinet попадает в public marketplace;
- автоматически строятся:
  - public job page;
  - Telegram card;
  - map index;
  - category index;
  - company page block;
- quality validation происходит до публикации;
- employer может видеть distribution status по каналам.

## 6.13 AI Vacancy Assistant

С учетом позиционирования IshGO и нашего стека нужно сделать AI vacancy assistant:

- генерация понятного short-form vacancy copy;
- адаптация под blue-collar кандидата;
- перевод/локализация в 4 языка;
- упрощение jargon-heavy JD;
- branch-specific copy;
- quality score перед публикацией.

## 6.14 SEO и Organic Growth Layer

Нужно сделать public layer индексируемым и growth-ready:

- SSR/prerender;
- clean slugs;
- canonical tags;
- sitemap;
- JSON-LD JobPosting;
- JSON-LD Organization;
- city/category landing pages;
- company landing pages;
- indexable filter pages только там, где есть смысл.

---

## 7. Предлагаемые API и архитектурные контракты

## 7.1 Public APIs

Нужны новые public endpoints:

- `GET /api/v1/public/vacancies`
- `GET /api/v1/public/vacancies/{slug}`
- `GET /api/v1/public/vacancies/map`
- `GET /api/v1/public/categories`
- `GET /api/v1/public/companies`
- `GET /api/v1/public/companies/{slug}`
- `GET /api/v1/public/stats`
- `POST /api/v1/public/favorites`
- `DELETE /api/v1/public/favorites/{id}`
- `GET /api/v1/public/favorites`
- `POST /api/v1/public/applications`
- `POST /api/v1/public/saved-searches`

Auth reuse:

- `POST /api/v1/auth/candidate/otp/send`
- `POST /api/v1/auth/candidate/otp/verify`

## 7.2 Public Search Index

Нужно завести отдельные projections/indexes для:

- public vacancies;
- public companies;
- city/category landing counters;
- map-ready geo points;
- branch-level vacancy locations.

Технологически можно использовать уже существующие:

- Elasticsearch;
- PostgreSQL/PostGIS.

## 7.3 Event Tracking

Нужен нормальный event model для public funnel:

- vacancy_impression;
- vacancy_open;
- map_open;
- map_pin_open;
- company_page_open;
- favorite_add;
- apply_start;
- branch_selected;
- apply_complete;
- otp_start;
- otp_complete;
- telegram_redirect.

Без этого employer analytics будет неполным.

---

## 8. Приоритеты внедрения

## P0 - обязательно

- public vacancy portal;
- vacancy detail page 2.0;
- phone-first auth modal;
- apply flow with branch selection;
- company directory;
- company public pages;
- categories;
- map search;
- favorites;
- public analytics events;
- SEO baseline.

## P1 - следующий слой

- saved searches and alerts;
- quick resume builder;
- enhanced company branding;
- AI vacancy assistant;
- branch-specific hiring pages;
- public trust markers and verified badges.

## P2 - усиление роста

- city landing pages;
- salary insight widgets;
- employer response-time ranking;
- follow-company mechanics;
- referral overlays in public web;
- AI summarization for vacancy copy.

---

## 9. Implementation waves

## Wave 1 - Marketplace Foundation

Срок: 3-4 недели

- public routes;
- vacancy list;
- vacancy detail;
- company list;
- company page;
- categories page;
- stats block;
- public search API;
- SSR/SEO baseline.

## Wave 2 - Conversion Layer

Срок: 2-3 недели

- auth modal;
- OTP flow continuation;
- favorites;
- apply flow;
- branch selector;
- Telegram continuation;
- saved intent after auth.

## Wave 3 - Geo and Growth

Срок: 2-3 недели

- map mode;
- nearby flow;
- saved searches;
- alerts;
- event tracking;
- employer distribution analytics;
- company brand enhancements.

## Wave 4 - Intelligence Layer

Срок: 2-3 недели

- AI vacancy assistant;
- localized vacancy rewrite;
- better company trust layer;
- public funnel optimization;
- growth/SEO expansion pages.

---

## 10. Что нельзя делать

Нельзя строить этот слой как:

- тяжелый enterprise-only кабинет;
- длинную CV-форму до первого отклика;
- public portal без географии;
- directory без company pages;
- job board без Telegram continuation;
- SEO-псевдостраницы без реальной ценности;
- copycat IshGO без использования наших differentiators.

Нельзя терять главный шанс `VF-JobSite`:

- у нас есть более сильный backend и более сильная экосистемная база;
- значит public-marketplace слой должен быть не просто "как у IshGO", а лучше него за счет:
  - deeper geo;
  - MyID trust;
  - HRM bridge;
  - candidate verification;
  - better employer analytics;
  - stronger Telegram integration.

---

## 11. Финальный вывод

После аудита IshGO главный продуктовый вывод такой:

- `VF-JobSite` уже строится как сильная backend hiring platform;
- `IshGO` показывает, как должен выглядеть живой public candidate marketplace для Узбекистана;
- следующий большой шаг для проекта - добавить поверх нашей backend-bазы сильный public discovery and conversion layer.

Правильная целевая формула:

- `Avery-like intelligence`
- `HeadHunter-like recruiter operations`
- `IshGO-like public marketplace`
- `Verifix-only differentiators: Telegram + Geo + MyID + HRM + Gov`

Именно в такой комбинации `Verifix Jobs` сможет стать не просто job board, а локально доминирующей hiring platform.

---

## 12. Источники

- [IshGO vacancies](https://ishgo.uz/vacancies)
- [IshGO map mode](https://ishgo.uz/vacancies?child=map)
- [IshGO categories](https://ishgo.uz/categories)
- [IshGO companies](https://ishgo.uz/companies)
- [IshGO company page example](https://ishgo.uz/companies/safia-0000985)
- [IshGO about](https://ishgo.uz/infos/kompaniya-haqida?detail=20f58a61-994f-9fd8-db04-5287ac889207&detail-type=info)
- [Jobster](https://jobster.hr/)
