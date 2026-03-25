#!/bin/bash
# Verifix Jobs — Production Deployment Script
# Usage: ./ops/deploy.sh [--build|--deploy|--rollback|--status]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"
COMPOSE_PROD="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env"
BACKUP_DIR="${BACKUP_DIR:-/opt/verifix/backups}"
LOG_FILE="/var/log/verifix/deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

check_prerequisites() {
    log "Checking prerequisites..."
    command -v docker >/dev/null 2>&1 || { log "ERROR: docker not found"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || alias docker-compose='docker compose'
    [ -f "$ENV_FILE" ] || { log "ERROR: .env file not found"; exit 1; }

    # Verify required env vars
    for var in POSTGRES_PASSWORD REDIS_PASSWORD JWT_SECRET; do
        grep -q "^${var}=" "$ENV_FILE" || { log "ERROR: ${var} not set in .env"; exit 1; }
    done
    log "Prerequisites OK"
}

backup_before_deploy() {
    log "Creating pre-deployment backup..."
    bash "${SCRIPT_DIR}/backup/backup-db.sh" || log "WARNING: DB backup failed"
    log "Backup completed"
}

build_images() {
    log "Building Docker images..."
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" build --no-cache
    log "Build completed"
}

deploy() {
    check_prerequisites
    backup_before_deploy

    log "Starting deployment..."
    cd "$PROJECT_DIR"

    # Pull latest images / build
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" pull 2>/dev/null || true
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up -d --remove-orphans

    # Wait for health checks
    log "Waiting for services to become healthy..."
    sleep 15

    # Verify
    for svc in verifix-jobs-api verifix-jobs-telegram; do
        if docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null | grep -q healthy; then
            log "✅ $svc is healthy"
        else
            log "⚠️  $svc health check pending"
        fi
    done

    log "✅ Deployment completed successfully"
}

rollback() {
    log "Starting rollback..."
    cd "$PROJECT_DIR"

    # Get previous image tag
    PREV_TAG=$(docker images --format "{{.Tag}}" verifix-jobs-api | sed -n '2p')
    if [ -z "$PREV_TAG" ]; then
        log "ERROR: No previous image found for rollback"
        exit 1
    fi

    log "Rolling back to tag: $PREV_TAG"
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" down
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up -d

    log "✅ Rollback completed"
}

status() {
    echo "=== Verifix Jobs Service Status ==="
    docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || docker ps --filter "name=verifix"
    echo ""
    echo "=== Health Checks ==="
    for svc in verifix-jobs-api verifix-jobs-telegram verifix-jobs-ml; do
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null || echo "unknown")
        echo "$svc: $HEALTH"
    done
    echo ""
    echo "=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps -q --filter "name=verifix") 2>/dev/null
}

case "${1:-deploy}" in
    --build)   build_images ;;
    --deploy)  deploy ;;
    --rollback) rollback ;;
    --status)  status ;;
    *)         deploy ;;
esac
