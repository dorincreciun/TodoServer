#!/bin/bash

# Script de deployment pentru Todo List API
# Folosit pentru deployment manual sau automat pe serverul live

set -e  # Oprește scriptul la prima eroare

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcție pentru logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configurare
PROJECT_NAME="todo-list-backend"
PROJECT_PATH="/opt/$PROJECT_NAME"
BACKUP_DIR="/opt/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Creează directoarele necesare
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Funcție pentru backup
create_backup() {
    log "Creare backup pentru configurația actuală..."
    
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    if [ -d "$PROJECT_PATH" ]; then
        tar -czf "$BACKUP_FILE" -C "$PROJECT_PATH" .env docker-compose.prod.yml 2>/dev/null || true
        success "Backup creat: $BACKUP_FILE"
    else
        warning "Directorul proiectului nu există, se va crea unul nou"
    fi
}

# Funcție pentru verificarea dependențelor
check_dependencies() {
    log "Verificare dependențe..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker nu este instalat!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose nu este instalat!"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git nu este instalat!"
        exit 1
    fi
    
    success "Toate dependențele sunt instalate"
}

# Funcție pentru pull ultimele modificări
pull_latest_changes() {
    log "Pull ultimele modificări din Git..."
    
    if [ ! -d "$PROJECT_PATH" ]; then
        log "Clonare repository..."
        git clone https://github.com/your-username/$PROJECT_NAME.git "$PROJECT_PATH"
    fi
    
    cd "$PROJECT_PATH"
    
    # Stash modificările locale dacă există
    if ! git diff-index --quiet HEAD --; then
        warning "Modificări locale detectate, se fac stash..."
        git stash
    fi
    
    git fetch origin
    git reset --hard origin/main
    
    success "Codul a fost actualizat"
}

# Funcție pentru configurarea mediului
setup_environment() {
    log "Configurare mediu de producție..."
    
    cd "$PROJECT_PATH"
    
    # Copiază fișierul de configurare pentru producție
    if [ -f "env.production" ]; then
        cp env.production .env
        success "Fișierul .env pentru producție a fost configurat"
    else
        error "Fișierul env.production nu există!"
        exit 1
    fi
    
    # Verifică dacă toate variabilele necesare sunt setate
    required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "MONGODB_URI" "REDIS_URL")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            error "Variabila $var nu este setată în .env!"
            exit 1
        fi
    done
    
    success "Mediul de producție a fost configurat"
}

# Funcție pentru deployment
deploy() {
    log "Începere deployment..."
    
    cd "$PROJECT_PATH"
    
    # Oprește serviciile existente
    log "Oprire servicii existente..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down || true
    
    # Pull ultimele imagini Docker
    log "Pull imagini Docker..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Pornește serviciile
    log "Pornire servicii..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Așteaptă serviciile să pornească
    log "Așteptare pornire servicii..."
    sleep 30
    
    # Verifică starea serviciilor
    log "Verificare stare servicii..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    # Verifică health check
    log "Verificare health check..."
    max_attempts=10
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/api/health >/dev/null 2>&1; then
            success "Health check reușit!"
            break
        else
            warning "Health check eșuat (încercarea $attempt/$max_attempts)"
            if [ $attempt -eq $max_attempts ]; then
                error "Health check a eșuat după $max_attempts încercări!"
                return 1
            fi
            sleep 10
            ((attempt++))
        fi
    done
    
    success "Deployment completat cu succes!"
}

# Funcție pentru cleanup
cleanup() {
    log "Curățare resurse..."
    
    # Șterge imagini Docker vechi
    docker image prune -f
    
    # Șterge containere oprite
    docker container prune -f
    
    # Șterge rețele neutilizate
    docker network prune -f
    
    # Șterge volume-uri neutilizate (opțional)
    # docker volume prune -f
    
    success "Cleanup completat"
}

# Funcție pentru rollback
rollback() {
    log "Începere rollback..."
    
    cd "$PROJECT_PATH"
    
    # Găsește cel mai recent backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "Nu s-au găsit backup-uri!"
        exit 1
    fi
    
    log "Restore din backup: $LATEST_BACKUP"
    
    # Oprește serviciile
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restore backup-ul
    tar -xzf "$LATEST_BACKUP" -C "$PROJECT_PATH"
    
    # Pornește serviciile
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Rollback completat"
}

# Funcție pentru verificarea statusului
status() {
    log "Verificare status servicii..."
    
    cd "$PROJECT_PATH"
    
    echo "=== Status Docker Compose ==="
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo -e "\n=== Logs ultimele 50 de linii ==="
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
    
    echo -e "\n=== Health Check ==="
    if curl -f http://localhost/api/health >/dev/null 2>&1; then
        success "API-ul funcționează corect"
    else
        error "API-ul nu răspunde"
    fi
}

# Funcție pentru afișarea ajutorului
show_help() {
    echo "Script de deployment pentru Todo List API"
    echo ""
    echo "Utilizare: $0 [OPȚIUNE]"
    echo ""
    echo "Opțiuni:"
    echo "  deploy     - Deployment complet (default)"
    echo "  rollback   - Rollback la versiunea anterioară"
    echo "  status     - Verificare status servicii"
    echo "  backup     - Creare backup manual"
    echo "  help       - Afișare acest ajutor"
    echo ""
    echo "Exemple:"
    echo "  $0 deploy"
    echo "  $0 rollback"
    echo "  $0 status"
}

# Main execution
main() {
    local action=${1:-deploy}
    
    log "Începere script de deployment pentru $PROJECT_NAME"
    
    case $action in
        "deploy")
            check_dependencies
            create_backup
            pull_latest_changes
            setup_environment
            deploy
            cleanup
            success "Deployment completat cu succes!"
            ;;
        "rollback")
            rollback
            ;;
        "status")
            status
            ;;
        "backup")
            create_backup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Opțiune necunoscută: $action"
            show_help
            exit 1
            ;;
    esac
}

# Execută main cu toate argumentele
main "$@" 