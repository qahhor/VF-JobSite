# Verifix Jobs on Hetzner

## Recommended server

| Parameter | Recommendation |
|----------|----------------|
| Plan | CPX31 |
| CPU / RAM | 4 vCPU / 8 GB |
| Disk | 160 GB SSD |
| OS | Ubuntu 24.04 |
| Region | Helsinki (`hel1`) |

## Step 1: Create the server

1. Open [https://console.hetzner.cloud](https://console.hetzner.cloud)
2. Create a new server with Ubuntu 24.04
3. Attach your SSH key
4. Save the public IP address

## Step 2: Configure DNS

Create an `A` record:

```text
jobs.verifix.uz -> SERVER_IP
```

## Step 3: Run the bootstrap deploy

```bash
HETZNER_IP=65.108.x.x DOMAIN=jobs.verifix.uz bash ops/hetzner/deploy-hetzner.sh
```

## Step 4: Fill production secrets

```bash
ssh root@65.108.x.x
nano /opt/verifix/verifix-jobs/.env
```

Set the required values, then restart the stack:

```bash
cd /opt/verifix/verifix-jobs
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

## Endpoints

| Service | URL |
|--------|-----|
| Public site | [https://jobs.verifix.uz](https://jobs.verifix.uz) |
| Admin login | [https://jobs.verifix.uz/admin/login](https://jobs.verifix.uz/admin/login) |
| API | [https://jobs.verifix.uz/api/v1/public/vacancies](https://jobs.verifix.uz/api/v1/public/vacancies) |
| Health | [https://jobs.verifix.uz/actuator/health](https://jobs.verifix.uz/actuator/health) |

## Backup

```bash
bash /opt/verifix/verifix-jobs/ops/backup/backup-db.sh
```

## Update

```bash
ssh root@65.108.x.x
cd /opt/verifix/verifix-jobs
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
