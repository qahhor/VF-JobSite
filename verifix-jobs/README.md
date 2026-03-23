# Verifix Jobs

Job portal for mass hiring of blue-collar workers in Central Asia (Uzbekistan, Kazakhstan, Kyrgyzstan, Tajikistan).

Part of the [Verifix HRM](https://verifix.uz) ecosystem.

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3, Spring Security 6, Spring Data JPA
- **Database:** PostgreSQL 16 + PostGIS, Liquibase migrations
- **Cache:** Redis 7
- **Search:** Elasticsearch 8.12
- **Messaging:** Apache Kafka
- **Frontend:** Angular 17+ (PWA), Angular Material, Tailwind CSS
- **Telegram:** Bot API + Mini App
- **File Storage:** MinIO (S3-compatible)

## Prerequisites

- Java 21+
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ (for Angular frontend)

## Quick Start

1. Clone and configure:
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. Start infrastructure:
```bash
docker-compose up -d
```

3. Build and run:
```bash
mvn clean install
mvn spring-boot:run -pl verifix-jobs-api
```

4. Access:
- API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html
- MinIO Console: http://localhost:9001
- Kibana: http://localhost:5601

## Project Structure

```
verifix-jobs/
├── verifix-jobs-common/       # Shared DTOs, exceptions, utilities
├── verifix-jobs-domain/       # JPA entities, repositories, Liquibase
├── verifix-jobs-service/      # Business logic
├── verifix-jobs-api/          # REST controllers, security
├── verifix-jobs-telegram/     # Telegram bot + Mini App
├── verifix-jobs-integration/  # External service clients
├── verifix-jobs-web/          # Angular employer portal
└── verifix-jobs-admin/        # Angular admin panel
```

## API Conventions

- Base path: `/api/v1/`
- UUID primary keys
- Error format: `{ "error": "ERROR_CODE", "message": "...", "details": {} }`
- Authentication: JWT (employers), OTP via SMS/Telegram (candidates)
