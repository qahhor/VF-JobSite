# Production Launch Checklist — Verifix Jobs

## Текущий статус: В ПРОДАКШЕНЕ (job.verifix.uz)

### CRITICAL — Безопасность и инфраструктура

- [x] SSL-сертификат (Let's Encrypt) установлен и работает
- [x] JWT_SECRET — уникальный, 64+ символов
- [x] POSTGRES_PASSWORD — установлен
- [x] REDIS_PASSWORD — установлен
- [x] .env файл НЕ в git-репозитории
- [x] Actuator endpoints закрыты от внешнего доступа (Nginx)
- [x] CORS настроен на production домен (job.verifix.uz)
- [x] Бэкап БД настроен (ежедневно 02:00)
- [x] Liquibase миграции (22) применены без ошибок
- [x] Health check endpoints отвечают 200
- [x] Docker контейнеры работают (6 контейнеров)
- [ ] Swagger UI закрыт в production
- [ ] Docker контейнеры от non-root пользователя

### HIGH — Мониторинг и интеграции

- [x] Prometheus + Grafana настроены
- [x] DNS A-запись указывает на сервер (CloudFlare)
- [x] Telegram Bot работает (@VerifixJobBot)
- [x] Elasticsearch индексация работает
- [x] PWA Service Worker корректно работает
- [x] i18n — 7 языков настроены
- [ ] Alerting правила добавлены в Prometheus
- [ ] Log rotation настроен для контейнеров
- [ ] Resource limits (CPU/RAM) для контейнеров
- [ ] Nginx rate limiting включён
- [ ] SMS-шлюз протестирован в production
- [ ] Payment webhooks настроены (Click.uz, Payme.uz)
- [ ] Firewall настроен (только 80/443 открыты)

### MEDIUM — После запуска

- [ ] Load testing (минимум 100 concurrent users)
- [ ] Disaster recovery план протестирован
- [ ] Бэкап восстановление протестировано
- [ ] CI/CD pipeline для автодеплоя
- [ ] Security scan проведён
- [ ] Performance baseline зафиксирован

### Известные проблемы

1. Swagger UI доступен в production (нужно закрыть через Nginx)
2. Нет automated CI/CD — деплой ручной через SSH
3. Нет rate limiting на Nginx
4. SMS и Payment интеграции не протестированы в prod
5. Нет unit/integration тестов
6. ML сервис — только скелет, не подключён
