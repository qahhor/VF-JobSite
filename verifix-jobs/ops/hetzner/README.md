# Деплой Verifix Jobs на Hetzner Cloud

## Рекомендуемый сервер

| Параметр | Рекомендация |
|----------|-------------|
| **Тариф** | CPX31 (4 vCPU, 8GB RAM, 160GB SSD) |
| **Цена** | ~€12.49/мес |
| **ОС** | Ubuntu 24.04 |
| **Локация** | Helsinki (hel1) — ближе к Узбекистану |

## Шаг 1: Создать сервер в Hetzner

1. Войдите в https://console.hetzner.cloud
2. Create Server → Ubuntu 24.04 → CPX31
3. Добавьте SSH ключ
4. Запомните IP адрес

## Шаг 2: Настроить DNS

Добавьте A-запись:
```
jobs.verifix.uz → IP_СЕРВЕРА
```

## Шаг 3: Запустить деплой

```bash
HETZNER_IP=65.108.x.x DOMAIN=jobs.verifix.uz bash ops/hetzner/deploy-hetzner.sh
```

## Шаг 4: Настроить credentials

SSH на сервер и отредактируйте `.env`:
```bash
ssh root@65.108.x.x
nano /opt/verifix/verifix-jobs/.env
```

Заполните:
- `TELEGRAM_BOT_TOKEN` — от @BotFather
- `ESKIZ_EMAIL` / `ESKIZ_PASSWORD` — от eskiz.uz
- Другие интеграции по необходимости

Перезапустите:
```bash
cd /opt/verifix/verifix-jobs
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

## Мониторинг

| Сервис | URL |
|--------|-----|
| Сайт | https://jobs.verifix.uz |
| API | https://jobs.verifix.uz/api/v1/public/vacancies |
| Grafana | http://IP:3000 |
| Health | https://jobs.verifix.uz/actuator/health |

## Бэкапы

Автоматически: ежедневно в 02:00 (PostgreSQL).

Ручной бэкап:
```bash
bash /opt/verifix/verifix-jobs/ops/backup/backup-db.sh
```

## Обновление

```bash
ssh root@65.108.x.x
cd /opt/verifix/verifix-jobs
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
