# Verifix Jobs - ТЗ на улучшение v4.4
## Конкурентный анализ IshGO и прикладные требования для развития проекта

> Дата: 24.03.2026  
> Версия: 4.4  
> Основание: аудит репозитория `VF-JobSite`, ТЗ `v2.0 Complete + v2.1 Appendix`, публичные материалы IshGO и проход по `ishgo.uz` в Google Chrome в авторизованной сессии

---

## Вводные

Этот документ нужен не для копирования IshGO, а для переноса его сильных рыночных и UX-паттернов в `VF-JobSite`.

Ключевой вывод аудита:

- `VF-JobSite` уже силен как backend/platform и как employer-side foundation.
- `IshGO` сильнее в public marketplace-слое: discovery, public vacancy browsing, company visibility, local language UX, phone-first entry, branch-aware apply flow.
- Для роста `VF-JobSite` нужно не заменять текущий продукт, а достроить поверх него сильный public candidate acquisition и distribution layer.

### Что изучено

### Внутренние источники

- `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_TZ_v2.0_Complete.docx`
- `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_TZ_v2.1_Appendix.docx`
- репозиторий `D:\DATA\VFX\VF-JobSite\verifix-jobs`
- ранее подготовленный аудит:
  - `D:\DATA\VFX\VF-JobSite\Verifix_Jobs_Improvement_TZ_v4.2_IshGO_Deep_Audit.md`

### Публичные источники IshGO

- [IshGO vacancies](https://ishgo.uz/vacancies)
- [IshGO map mode](https://ishgo.uz/vacancies?child=map)
- [IshGO categories](https://ishgo.uz/categories)
- [IshGO companies](https://ishgo.uz/companies)
- [IshGO company page example](https://ishgo.uz/companies/safia-0000985)
- [IshGO about](https://ishgo.uz/infos/kompaniya-haqida?detail=20f58a61-994f-9fd8-db04-5287ac889207&detail-type=info)
- [Jobster](https://jobster.hr/)

### Что было просмотрено в Google Chrome 24.03.2026

- публичный каталог вакансий `ishgo.uz/vacancies`
- карта вакансий `ishgo.uz/vacancies?child=map`
- список категорий `ishgo.uz/categories`
- список компаний `ishgo.uz/companies`
- страница компании и вкладка `Korxona haqida`
- карточка вакансии и modal-flow `Ishga topshirish`
- авторизованные элементы интерфейса работодателя на `ishgo.uz/vacancies`
- кабинет `ishgo.uz/my-vacancies`
- route `ishgo.uz/takliflar`, который в текущей сессии отдавал `404`

---

# 1. Анализ конкурента

## 1.1 Сильные стороны IshGO

### 1. Сильный public vacancy marketplace

На `IshGO` хорошо продуман публичный слой входа в продукт:

- вакансии доступны без лишнего friction;
- есть поиск, сортировка и быстрый просмотр карточек;
- карточки насыщены важными для массового найма атрибутами:
  - зарплата;
  - компания;
  - тип занятости;
  - формат работы;
  - метки свежести и промо-метки;
  - доверительные признаки вроде verified badge.

Почему это сильно:

- кандидат сразу видит живой рынок;
- продукт не заставляет регистрироваться до получения ценности;
- входной барьер ниже, чем у employer-centric платформ.

### 2. Локальный market fit для Узбекистана

IshGO хорошо адаптирован к локальному рынку:

- локальные языки и привычные формулировки;
- phone-first логика входа;
- акцент на массовые вакансии и районы;
- нативная связка с Telegram;
- понятная лексика для blue-collar и service workforce.

Почему это сильно:

- меньше когнитивного трения;
- выше конверсия на мобильном трафике;
- выше доверие у массового кандидата без классического resume-flow.

### 3. Карта вакансий и nearby-логика

`Map mode` и `Menga yaqin` делают географию частью discovery.

Почему это сильно:

- для blue-collar сегмента локация часто важнее бренда;
- поиск рядом с домом ускоряет отклик;
- карта улучшает восприятие выбора филиала и района.

### 4. Category hub как слой discovery

Страница категорий дает второй вход в продукт после общего поиска.

Почему это сильно:

- пользователь может искать не только по строке поиска;
- проще находить релевантные вакансии по familiar mental model;
- категория помогает SEO, внутренней навигации и public acquisition.

### 5. Company directory и публичные company pages

У IshGO есть полноценный каталог работодателей и отдельные страницы компаний:

- описание компании;
- число вакансий;
- отрасль;
- контакты и сайт;
- переключение между вакансией и профилем работодателя.

Почему это сильно:

- повышает доверие;
- работает на employer branding;
- дает кандидату контекст до отклика.

### 6. Phone-first auth и быстрый entry

Вход и регистрация строятся через легкий modal-flow с упором на номер телефона.

Почему это сильно:

- это ближе к реальному поведению массового кандидата;
- телефонный вход проще, чем full-profile signup;
- легче продолжить сценарий в Telegram/SMS.

### 7. Branch-aware apply flow

На карточке вакансии `Ishga topshirish` открывает сценарий выбора филиала/локации до отклика.

Почему это сильно:

- для сетевых работодателей это резко повышает качество лидов;
- система уточняет намерение кандидата еще до отправки заявки;
- уменьшается шум и ручной routing внутри HR-команды.

### 8. Легкий employer self-service

В авторизованной сессии были видны:

- `Vakansiya joylashtirish`;
- `Mening vakansiyalarim`;
- `Yangi vakansiya`;
- простые карточки вакансий со статусом и базовыми метриками.

Почему это сильно:

- работодатель быстро понимает, как начать;
- marketplace и employer flow не разорваны на два разных продукта;
- self-serve публикация ускоряет supply-side growth.

### 9. Доверительные и маркетинговые сигналы

На сайте заметны:

- счетчики вакансий/компаний/резюме;
- featured companies;
- ссылки на app stores;
- Telegram-channel surfaces;
- verified markers.

Почему это сильно:

- усиливается ощущение ликвидности рынка;
- повышается доверие и к платформе, и к работодателям;
- лучше работают first-time conversion и return visits.

## 1.2 Слабые стороны IshGO

### 1. Ограниченная глубина employer-side intelligence

По сравнению с более зрелыми ATS/TA-платформами IshGO слабее в:

- аналитике качества вакансии;
- воронке найма;
- recruiter operations;
- автоматизации pipeline;
- глубине candidate database tooling.

### 2. Простая система фильтрации

По публичному слою видно, что фильтры и сортировка существуют, но глубина поиска выглядит ограниченной для сложных hiring-case’ов.

Риск:

- удобно для массового browsing;
- менее удобно для power users и recruiters.

### 3. Неровность account/employer surfaces

Авторизованные employer-страницы выглядят рабочими, но легковесными. Некоторые маршруты в текущей сессии были шероховаты, например `takliflar` отдавал `404`.

Риск:

- ощущение product incompleteness;
- проседание доверия у B2B-клиентов.

### 4. Мало выраженного recruiter operating system слоя

IshGO силен в distribution, но заметно слабее как единая операционная среда для hiring team.

Риск:

- слабее удержание крупных работодателей;
- ниже ARPU на employer-side, если не развивать ATS/analytics/automation.

### 5. Ограниченная публичная глубина отдельных detail-flow

В части страниц логика и detail-depth выглядят минималистично.

Риск:

- высокая скорость входа, но не всегда достаточная глубина информации для принятия решения.

## 1.3 Уникальные особенности IshGO

### 1. Branch-aware apply как часть массового найма

Самая прикладная особенность IshGO для вашего сегмента — отклик не просто на вакансию, а на конкретный филиал или точку.

### 2. Marketplace + employer shell в одном продукте

Публичный каталог и базовый employer-cabinet ощущаются частями одной системы, а не двумя несвязанными приложениями.

### 3. Local-first UX

IshGO выглядит не как универсальный глобальный ATS, а как локально адаптированный продукт под рынок Узбекистана.

### 4. Telegram/app ecosystem как продолжение web flow

Даже публично продукт транслирует идею, что web, Telegram и mobile usage связаны между собой.

### 5. Простая, но понятная модель доверия

Сигналы доверия встроены прямо в browsing-сценарий:

- verified employers;
- company pages;
- статистика платформы;
- app presence;
- живой public catalog.

---

# 2. Рекомендации по улучшению

## Приоритет 1 (критично)

### 1. Запустить public candidate marketplace

Нужно создать отдельный public web-layer для кандидата:

- список вакансий;
- detail pages вакансий;
- поиск;
- категории;
- компании;
- карта/nearby.

Почему критично:

- это главный gap между текущим `VF-JobSite` и IshGO;
- без этого сильный backend не превращается в market-facing product.

### 2. Внедрить branch-aware apply flow

Для сетевых работодателей и multi-location вакансий нужен отклик с выбором филиала, адреса или точки работы.

Почему критично:

- это улучшает lead quality;
- это один из самых сильных локально релевантных паттернов IshGO.

### 3. Сделать phone-first candidate entry

Нужен максимально короткий сценарий:

- телефон;
- OTP;
- продолжение в web/Telegram;
- минимум обязательных полей до первого отклика.

Почему критично:

- это напрямую влияет на conversion-to-apply.

### 4. Запустить public company directory и company pages

Нужен SEO-friendly каталог работодателей с сильным branding-представлением.

Почему критично:

- это усиливает trust, discovery и employer value proposition.

### 5. Добавить карту вакансий и nearby search

Нужно productized использование уже существующей geo-basis платформы.

Почему критично:

- география критична для blue-collar hiring;
- это дает быстрый и визуально понятный сценарий discovery.

## Приоритет 2 (важно)

### 1. Развить category hubs и city hubs

Нужны отдельные public страницы:

- по категориям;
- по городам;
- по районам;
- по типу занятости.

### 2. Добавить favorites, saved searches и alerting

Нужны:

- избранные вакансии;
- сохраненные фильтры;
- уведомления в Telegram/SMS/push.

### 3. Усилить trust surfaces

Нужны:

- verified employer badges;
- platform liquidity counters;
- employer profile completeness;
- response rate / response time indicators.

### 4. Сделать employer self-serve publishing проще

Нужен легкий путь от регистрации работодателя к первой опубликованной вакансии.

### 5. Увязать public web с Telegram и Mini App

Нужна бесшовная логика:

- открыл вакансию на web;
- сохранил/откликнулся/продолжил в Telegram;
- получил follow-up в привычном канале.

## Приоритет 3 (желательно)

### 1. Запустить marketplace analytics для работодателей

Показывать:

- просмотры;
- CTR карточки;
- conversion to apply;
- карту интереса по локациям;
- долю трафика по каналам.

### 2. Развить referral loops на public слое

Добавить:

- share vacancy;
- referral deep links;
- referral incentives для массового найма.

### 3. Построить SEO-машину вокруг public inventory

Нужны:

- SSR/SSG;
- JSON-LD;
- sitemap;
- canonical pages по городам, категориям и компаниям.

---

# 3. Функциональные требования

## 3.1 Публичный каталог вакансий

### Описание

Создать публичную страницу вакансий с:

- поиском по строке;
- фильтрами;
- сортировкой;
- карточками вакансий;
- переключением list/map;
- пагинацией или infinite scroll.

### Обоснование

Именно этот слой у IshGO делает продукт market-visible и снижает порог входа для кандидата.

### Ожидаемый результат

- рост органического трафика;
- рост числа анонимных посетителей, дошедших до detail page;
- рост conversion `visit -> vacancy detail -> apply`.

## 3.2 Карточка вакансии 2.0

### Описание

Каждая vacancy detail page должна содержать:

- зарплату;
- компанию;
- адрес/район;
- тип занятости;
- формат работы;
- количество открытых позиций;
- дату публикации;
- CTA отклика;
- блок о работодателе;
- похожие вакансии;
- CTA продолжения в Telegram.

### Обоснование

IshGO хорошо показывает кандидату нужный минимум прямо в detail flow, не перегружая экран.

### Ожидаемый результат

- рост конверсии detail-to-apply;
- снижение bounce rate на vacancy pages;
- рост доверия к вакансии.

## 3.3 Branch-aware apply flow

### Описание

Если вакансия относится к сети филиалов, кандидат перед откликом выбирает:

- филиал;
- район;
- точку работы;
- предпочтительную локацию.

### Обоснование

Это критично для retail, HoReCa, logistics и других multi-branch работодателей.

### Ожидаемый результат

- снижение доли нерелевантных откликов;
- уменьшение ручного routing на стороне работодателя;
- рост hire-rate из откликов.

## 3.4 Company directory и public employer profile

### Описание

Создать каталог компаний и SEO-friendly company pages с:

- логотипом;
- описанием;
- отраслью;
- городами присутствия;
- количеством активных вакансий;
- verified status;
- контактами;
- ссылкой на сайт;
- блоком текущих вакансий.

### Обоснование

Company pages у IshGO усиливают бренд работодателя и добавляют контекст до отклика.

### Ожидаемый результат

- рост доверия кандидатов;
- рост direct traffic на страницы работодателей;
- дополнительная ценность для работодателей как части платного предложения.

## 3.5 Category hubs и geo hubs

### Описание

Создать страницы:

- вакансии по категориям;
- вакансии по городам;
- вакансии по районам;
- вакансии рядом со мной.

### Обоснование

Это улучшает discovery, SEO и локальный relevance.

### Ожидаемый результат

- рост long-tail SEO трафика;
- больше сессий с высокой релевантностью;
- лучшая конверсия в регионах.

## 3.6 Phone-first auth и quick apply

### Описание

Реализовать короткий сценарий входа и отклика:

- ввод телефона;
- OTP;
- базовый профиль создается автоматически;
- недостающие поля дозаполняются после первого value moment.

### Обоснование

Для blue-collar сегмента длинная регистрация бьет по конверсии сильнее, чем отсутствие полного профиля на старте.

### Ожидаемый результат

- сокращение времени до первого отклика;
- рост completion rate auth-flow;
- рост mobile conversion.

## 3.7 Favorites, saved searches и alerts

### Описание

Добавить:

- избранные вакансии;
- подписки на поисковые запросы;
- уведомления о новых подходящих вакансиях.

### Обоснование

Даже простой favorites layer помогает возвращать пользователя и добирать lost intent.

### Ожидаемый результат

- рост retention;
- рост повторных визитов;
- рост откликов из follow-up каналов.

## 3.8 Employer self-service vacancy cabinet

### Описание

Упростить employer-side сценарий:

- мои вакансии;
- статусы;
- базовые метрики;
- быстрый драфт;
- публикация;
- пауза/архив;
- простой start-from-template flow.

### Обоснование

У IshGO даже легкий employer shell уже дает понятный start point для self-serve клиента.

### Ожидаемый результат

- сокращение времени `signup -> first vacancy published`;
- рост self-serve employer activation;
- снижение нагрузки на sales/support.

## 3.9 Marketplace analytics для работодателя

### Описание

Для каждой вакансии и компании показывать:

- просмотры;
- CTR в detail;
- apply conversion;
- источники трафика;
- географию просмотров;
- распределение по устройствам и каналам.

### Обоснование

Работодатель должен видеть не только pipeline, но и эффективность public distribution.

### Ожидаемый результат

- рост perceived value;
- выше willingness to pay за продвижение вакансий;
- лучшее качество решений по контенту и географии публикации.

## 3.10 Связка web, Telegram и Mini App

### Описание

Нужно связать сценарии:

- сохранить вакансию на web;
- продолжить отклик в Telegram;
- вернуть пользователя из Telegram на web-detail;
- синхронизировать избранное, отклики и алерты.

### Обоснование

Сильная сторона вашего проекта — Telegram-first. Ее нужно не дублировать рядом с web, а связать в единый funnel.

### Ожидаемый результат

- рост cross-channel conversion;
- выше частота возврата;
- ниже cost per apply.

---

# 4. UI/UX требования

## 4.1 Визуальные улучшения

Нужно перейти от ощущения “внутреннего кабинета” к ощущению “живого рынка вакансий”.

Требования:

- крупный, быстро читаемый search-first hero на public pages;
- визуально насыщенные vacancy cards без перегруза;
- сильные employer badges и trust labels;
- более выраженные company blocks и category cards;
- единая система визуальных статусов:
  - verified;
  - urgent;
  - top;
  - new;
  - nearby.

Измеримые критерии:

- ключевая информация вакансии читается за 3-5 секунд;
- первый экран на mobile должен содержать поисковую строку и минимум 3 релевантные карточки/entry points.

## 4.2 Оптимизация пользовательских сценариев

Основные UX-сценарии должны быть сокращены по числу шагов.

Требования:

- `visit -> search -> detail -> apply` не более 4-5 ключевых действий;
- `visit -> OTP -> apply` не более 2 минут на среднем Android-устройстве;
- отклик на multi-branch vacancy не более 3 шагов после CTA;
- возврат в сохраненный поиск или избранное не более 1 тапа из Telegram/push.

## 4.3 Улучшение конверсии

Нужно упростить и усилить точки принятия решения.

Требования:

- один доминирующий CTA на vacancy detail;
- показать компанию и локацию до этапа логина;
- выносить зарплату, график и адрес выше fold;
- использовать social proof:
  - verified employer;
  - число вакансий компании;
  - активность платформы;
  - response indicators.

Целевые KPI:

- рост `vacancy detail -> apply start` минимум на 20%;
- рост `apply start -> apply complete` минимум на 15%;
- снижение bounce rate на public vacancy pages минимум на 10%.

## 4.4 Адаптивность и мобильный UX

Так как массовый кандидат чаще использует бюджетный Android, mobile UX должен быть главным, а не вторичным.

Требования:

- mobile-first layout для public catalog и detail pages;
- крупные тач-таргеты;
- липкий CTA отклика;
- экономный по весу интерфейс;
- карта и список должны корректно работать на слабых устройствах и нестабильной сети.

## 4.5 Скорость и отзывчивость

Требования:

- быстрый first contentful render public catalog;
- skeleton states вместо пустых белых экранов;
- мгновенный visual feedback на поиск, фильтры, избранное и apply actions.

Целевые показатели:

- LCP public vacancy list < 2.5 c на 4G;
- interaction response < 200 мс для базовых UI-действий;
- error rate front-end сценариев < 1%.

---

# 5. Технические рекомендации

## 5.1 Производительность

### Рекомендации

- вынести public catalog, company pages и category pages в SEO-friendly rendering strategy:
  - SSR или SSG для индексируемых страниц;
  - CDN caching;
  - pre-render популярных city/category routes;
- использовать Elasticsearch для public vacancy search и ranking;
- использовать Redis для cache популярных выборок:
  - top vacancies;
  - featured companies;
  - category pages;
  - city pages;
- использовать PostGIS для map/nearby и branch-aware geo search;
- разнести read-heavy public traffic и employer operations workload логически и по scaling-профилям.

### Ожидаемый эффект

- устойчивый public search при росте трафика;
- снижение latency для каталога;
- возможность масштабировать marketplace независимо от ATS-логики.

## 5.2 Безопасность

### Рекомендации

- сохранить phone-first UX, но усилить защиту OTP:
  - rate limiting;
  - anti-abuse rules;
  - device/IP heuristics;
- ограничить scraping и массовый сбор контактов с public pages;
- для employer self-service сохранить tenant isolation на API уровне;
- контакты работодателя и кандидата раскрывать по role-based правилам;
- логировать public-to-auth funnel и подозрительные apply patterns;
- защищать favorites, alerts и public apply endpoints от ботов.

### Ожидаемый эффект

- меньше fraud и spam traffic;
- ниже риск утечки контактов;
- выше устойчивость к накрутке откликов.

## 5.3 Масштабируемость

### Рекомендации

- ввести отдельный bounded context для public marketplace:
  - vacancies public read-model;
  - companies public read-model;
  - categories/geo browse read-model;
- строить индексируемые read-модели через async events из core hiring domain;
- развести аналитические события:
  - impression;
  - detail open;
  - apply start;
  - apply complete;
  - favorite save;
  - map interaction;
- подготовить выделенный analytics pipeline для marketplace funnel;
- держать возможность масштабировать Telegram, public web и employer cabinet как независимые delivery surfaces.

### Ожидаемый эффект

- система сможет расти не только по числу employer-аккаунтов, но и по public traffic;
- аналитика public funnel станет управляемой;
- можно будет отдельно оптимизировать acquisition и hiring operations.

---

## Финальный вывод

IshGO не является более сильной платформой, чем `VF-JobSite`, по backend- и ecosystem-потенциалу. Но IshGO лучше productized в одном конкретном и очень важном слое: `public candidate marketplace for Uzbekistan`.

Поэтому главный вектор улучшения для `VF-JobSite` после этого анализа:

- не переписывать ATS/core;
- достроить сильный public discovery/distribution layer;
- связать его с вашим преимуществом:
  - Telegram-first;
  - geolocation;
  - MyID;
  - HRM bridge;
  - branch hiring;
  - multi-language Central Asia rollout.

Если реализовать требования этого документа, `VF-JobSite` сможет объединить:

- глубину платформы и интеграций, которой IshGO сейчас не показывает;
- и силу локального public marketplace UX, в котором IshGO сегодня выглядит убедительно.

---

## Рекомендуемые продуктовые KPI после реализации

- рост organic traffic на public vacancy pages не менее чем на 40% за 6 месяцев;
- рост `visit -> apply complete` не менее чем на 20%;
- сокращение времени до первого отклика до 2 минут для phone-first user;
- рост доли geo-based applications не менее чем на 25%;
- рост self-serve employer activation не менее чем на 20%;
- рост повторных candidate sessions через favorites/alerts/Telegram follow-up не менее чем на 15%.
