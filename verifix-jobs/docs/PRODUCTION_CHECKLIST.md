# Production Launch Checklist — Verifix Jobs

## Go/No-Go Decision Criteria

### CRITICAL (все должны быть ✅)

- [ ] SSL-сертификат установлен и работает
- [ ] JWT_SECRET — уникальный, 64+ символов, не совпадает с dev
- [ ] POSTGRES_PASSWORD — сильный, не совпадает с dev
- [ ] REDIS_PASSWORD — установлен
- [ ] .env файл НЕ в git-репозитории
- [ ] Swagger UI закрыт в production (через Nginx)
- [ ] Actuator endpoints закрыты от внешнего доступа
- [ ] CORS настроен на production домен
- [ ] Docker контейнеры работают от non-root пользователя
- [ ] Бэкап БД настроен и проверен
- [ ] Liquibase миграции применены без ошибок
- [ ] Health check endpoints отвечают 200

### HIGH (желательно до запуска)

- [ ] Prometheus + Grafana настроены
- [ ] Alerting правила добавлены
- [ ] Log rotation настроен для всех контейнеров
- [ ] Resource limits (CPU/RAM) установлены для контейнеров
- [ ] Nginx rate limiting включён
- [ ] SMS-шлюз протестирован (отправка реального SMS)
- [ ] Payment webhooks настроены (Click.uz, Payme)
- [ ] Telegram Bot webhook зарегистрирован
- [ ] DNS A-запись указывает на сервер
- [ ] Firewall настроен (только 80/443 открыты)

### MEDIUM (в первую неделю после запуска)

- [ ] Load testing проведён (минимум 100 concurrent users)
- [ ] Disaster recovery план протестирован
- [ ] Runbook актуализирован
- [ ] Мониторинг бизнес-метрик настроен
- [ ] Бэкап восстановление протестировано
- [ ] CI/CD pipeline настроен для автодеплоя

### POST-LAUNCH

- [ ] Ошибки первых 24 часов проанализированы
- [ ] Performance baseline зафиксирован
- [ ] Пользовательский feedback собран
- [ ] Первый бэкап успешно создан
- [ ] Security scan проведён
