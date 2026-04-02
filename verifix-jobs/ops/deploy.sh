#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"
COMPOSE_PROD="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env"
LOG_FILE="${DEPLOY_LOG_FILE:-/tmp/verifix-deploy.log}"

compose() {
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" "$@"
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log "Checking prerequisites"
    command -v docker >/dev/null 2>&1 || { log "ERROR: docker not found"; exit 1; }
    [ -f "$ENV_FILE" ] || { log "ERROR: .env file not found at $ENV_FILE"; exit 1; }
    bash "${SCRIPT_DIR}/validate-env.sh" "$ENV_FILE"
    compose config -q
}

backup_before_deploy() {
    log "Creating pre-deployment backup"
    bash "${SCRIPT_DIR}/backup/backup-db.sh" || log "WARNING: database backup failed"
}

build_images() {
    check_prerequisites
    log "Building production images"
    compose build --no-cache api telegram ml-service web admin-web
    log "Build completed"
}

deploy() {
    check_prerequisites
    backup_before_deploy

    log "Pulling remote images when available"
    compose pull || true

    log "Starting production stack"
    compose up -d --build --remove-orphans

    log "Waiting for health checks"
    sleep 20

    status
}

rollback() {
    log "Rollback is not automated in this script yet."
    log "Pin previous image tags and re-run docker compose up -d to roll back safely."
    exit 1
}

status() {
    echo "=== Verifix Jobs service status ==="
    compose ps
    echo
    echo "=== Container health ==="
    for svc in verifix-jobs-api verifix-jobs-telegram verifix-jobs-ml verifix-jobs-web verifix-jobs-admin verifix-jobs-nginx; do
        health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$svc" 2>/dev/null || echo "not-created")
        echo "$svc: $health"
    done
}

case "${1:---deploy}" in
    --build) build_images ;;
    --deploy) deploy ;;
    --rollback) rollback ;;
    --status) status ;;
    *) deploy ;;
esac
