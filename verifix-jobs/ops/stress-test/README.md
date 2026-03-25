# Стресс-тестирование Verifix Jobs

## Целевые метрики

| Параметр | Значение |
|----------|----------|
| Concurrent users | 1,000 |
| DAU | 100,000 |
| MAU | 1,200,000 |
| Target P95 latency | < 2 sec |
| Target error rate | < 1% |
| Target throughput | 500+ req/sec |

## Профили нагрузки

| Профиль | Доля | Описание |
|---------|------|----------|
| **Candidate** | 70% | Поиск вакансий, просмотр деталей, категории, города |
| **Employer** | 25% | Dashboard, создание вакансий, просмотр заявок, board |
| **Admin** | 5% | Health check, metrics, salary data |

## Установка

```bash
pip install locust
```

## Запуск

### Веб-интерфейс (рекомендуется)
```bash
cd verifix-jobs
locust -f ops/stress-test/stress-test.py --host=http://localhost:8080
# Откройте http://localhost:8089
# Установите: Users=1000, Spawn rate=50/s
```

### Headless mode (для CI/CD)
```bash
locust -f ops/stress-test/stress-test.py \
  --host=http://localhost:8080 \
  --headless \
  --users 1000 \
  --spawn-rate 50 \
  --run-time 10m \
  --csv=results/stress \
  --html=results/report.html
```

### Поэтапная нагрузка
```bash
# Этап 1: Разогрев (100 users)
locust ... --users 100 --spawn-rate 10 --run-time 5m

# Этап 2: Средняя нагрузка (500 users)
locust ... --users 500 --spawn-rate 25 --run-time 10m

# Этап 3: Пиковая нагрузка (1000 users)
locust ... --users 1000 --spawn-rate 50 --run-time 15m

# Этап 4: Стресс (2000 users — за пределами нормы)
locust ... --users 2000 --spawn-rate 100 --run-time 5m
```

## Критерии успеха

| Метрика | Порог PASS | Порог FAIL |
|---------|-----------|-----------|
| P50 latency | < 500ms | > 1s |
| P95 latency | < 2s | > 5s |
| P99 latency | < 5s | > 10s |
| Error rate | < 1% | > 5% |
| Throughput | > 500 rps | < 200 rps |
| DB pool usage | < 80% | > 95% |
| JVM heap | < 80% | > 90% |

## Мониторинг во время теста

Во время стресс-теста откройте:
- **Locust UI**: http://localhost:8089 (статистика запросов)
- **Grafana**: http://localhost:3000 (JVM, DB pool, HTTP errors)
- **Prometheus**: http://localhost:9090 (raw metrics)

## Расчёт нагрузки

```
DAU = 100,000 пользователей/день
Средняя сессия = 5 минут
Среднее количество запросов за сессию = 15

Запросы в день = 100,000 × 15 = 1,500,000
Запросы в час (пик) = 1,500,000 × 0.3 / 8 = 56,250 req/hour
Запросы в секунду (пик) = 56,250 / 3600 ≈ 16 req/sec (средний)
Пиковый burst = 16 × 10 = 160 req/sec
1000 concurrent = ~500 req/sec при 2 req/sec/user
```
