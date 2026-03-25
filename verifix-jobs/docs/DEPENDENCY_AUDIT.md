# Аудит зависимостей Verifix Jobs — Март 2026

## Статус: ✅ Все критические зависимости актуальны

---

## Выполненные обновления (Полный список)

| Библиотека | Было | Стало | Причина |
|---|---|---|---|
| **Telegram Bots** | 6.9.7.1 | **7.10.0** | Major: новый API (TelegramClient), VerifixJobsBot переписан |
| **Angular** | 17.3.0 | **19.2.0** | Major: esbuild, signals stable, incremental hydration |
| **Angular Material** | 17.3.0 | **19.2.0** | Synced with Angular |
| **ng2-charts** | 6.0.1 | **7.0.0** | Angular 19 совместимость |
| **TypeScript** | 5.4.0 | **5.7.0** | Angular 19 requirement |
| **zone.js** | 0.14.4 | **0.15.0** | Angular 19 requirement |
| **PostgreSQL Docker** | 16-3.4 | **17-3.5** | Major: performance, JSON improvements |
| **Kafka Docker** | 7.6.0 | **7.9.0** | Bug fixes, performance |
| Resilience4j | 2.2.0 | **2.3.0** | Minor release, bug fixes |
| NumPy | >=1.26.0 | **==2.2.3** | Пиннинг для воспроизводимости |
| pytest | >=8.0.0 | **==8.3.5** | Пиннинг для воспроизводимости |
| MinIO Docker | 2024-10-02 | **2025-02-28** | Security patches, bug fixes |
| Grafana Docker | 11.2.0 | **11.5.2** | Bug fixes, new features |

## Планируемые обновления (Q2 2026)

### HIGH: Telegram Bots 6.9.7.1 → 7.x

**Breaking changes в v7:**
- `TelegramLongPollingBot` заменён на `TelegramClient`
- Конструктор бота изменён
- `BotApiMethod` возвращает другие типы
- Убран `telegrambots-spring-boot-starter` → ручная регистрация

**План миграции:**
1. Обновить `telegram-bots.version` в pom.xml
2. Переписать `VerifixJobsBot` → использовать `TelegramClient`
3. Обновить все handler-ы: `SendMessage` API изменился
4. Тестировать каждый handler отдельно
5. Оценка трудозатрат: **3-5 дней**

### MEDIUM: Angular 17 → 19

**Breaking changes:**
- v18: новый build system (esbuild default), `@if`/`@for` stable (уже используем)
- v19: zoneless change detection (optional), incremental hydration
- Angular Material: MDC компоненты стали default в v18

**План миграции:**
1. `ng update @angular/core@18 @angular/cli@18` → fix breaking
2. `ng update @angular/core@19 @angular/cli@19` → fix breaking
3. `ng update @angular/material@19`
4. Тестировать все компоненты
5. Оценка: **2-3 дня на каждый major**

### LOW: TailwindCSS 3.4 → 4.0

**Breaking changes:**
- Новый engine (Oxide) — несовместим с некоторыми плагинами
- Изменён формат конфига (`tailwind.config.js` → CSS-based config)
- Некоторые утилиты переименованы

**Рекомендация:** Подождать до v4.1+ (стабилизация экосистемы). TailwindCSS 3.x поддерживается.

---

## Матрица совместимости

| Spring Boot | Java | Hibernate | PostgreSQL | Elasticsearch | Kafka |
|---|---|---|---|---|---|
| 3.5.x | 21+ | 6.6.x | 14-17 | 8.x | 3.x |

| Angular | TypeScript | RxJS | zone.js | Node.js |
|---|---|---|---|---|
| 17.x | 5.2-5.5 | 7.x | 0.14.x | 18-20 |
| 19.x | 5.6-5.8 | 7.x | 0.15.x | 20-22 |

## Проверка на уязвимости

Команды для регулярной проверки:

```bash
# Java — OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check

# Python — pip-audit
pip install pip-audit && pip-audit -r requirements.txt

# npm — audit
cd verifix-jobs-web && npm audit
cd verifix-jobs-admin && npm audit

# Docker — Trivy
trivy image verifix-jobs-api:latest
```

## График ротации зависимостей

| Частота | Действие |
|---|---|
| Еженедельно | `npm audit` / `pip-audit` — проверка CVE |
| Ежемесячно | Patch-обновления (x.y.Z) всех библиотек |
| Ежеквартально | Minor-обновления (x.Y.z) с тестированием |
| Раз в полгода | Оценка major-обновлений (X.y.z) |
