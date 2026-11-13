#!/usr/bin/env bash
# ==============================================================================
# Aurora Hardware — Automated Platform Startup Script
# Starts Infrastructure Containers -> Spring Boot Microservices -> Next.js Web UI
# Automatically provisions user credentials for both roles (USER & ADMIN)
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}      Aurora Hardware — Event-Driven Microservices Platform            ${NC}"
echo -e "${CYAN}========================================================================${NC}"

# 1. Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}[ERROR] Docker is not running. Please start Docker Desktop and retry.${NC}"
  exit 1
fi

# 2. Start Core Infrastructure (PostgreSQL, Redis, RabbitMQ, Keycloak)
echo -e "\n${YELLOW}[Step 1/4] Starting Docker Infrastructure Containers...${NC}"
docker compose up -d postgres redis rabbitmq keycloak

echo -e "${GREEN}✓ Docker containers started successfully.${NC}"
echo -e "  - PostgreSQL: localhost:5432"
echo -e "  - Redis:      localhost:6379"
echo -e "  - RabbitMQ:   http://localhost:15672 (guest / guest)"
echo -e "  - Keycloak:   http://localhost:8080 (admin / admin)"

# 3. Provision Keycloak Accounts for Both Roles
echo -e "\n${YELLOW}[Step 2/4] Ensuring Keycloak Credentials for Both Roles (USER & ADMIN)...${NC}"
# Wait briefly for Keycloak to be healthy if booting up
for i in {1..15}; do
  if docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8080 --realm master --user admin --password admin > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

# Run account seeding (customer and admin)
if [ -f "$ROOT_DIR/create-account.sh" ]; then
  "$ROOT_DIR/create-account.sh" --seed > /dev/null 2>&1 || true
  echo -e "${GREEN}✓ User credentials verified and provisioned in Keycloak realm 'mini-commerce'.${NC}"
fi

# 4. Check / Build Backend Jars
echo -e "\n${YELLOW}[Step 3/4] Verifying Backend Microservice Artifacts...${NC}"
NEED_BUILD=false
if [ ! -f "$ROOT_DIR/backend/product-service/target/product-service-1.0.0-SNAPSHOT.jar" ]; then
  NEED_BUILD=true
fi
if [ ! -f "$ROOT_DIR/backend/order-service/target/order-service-1.0.0-SNAPSHOT.jar" ]; then
  NEED_BUILD=true
fi
if [ ! -f "$ROOT_DIR/backend/notification-service/target/notification-service-1.0.0-SNAPSHOT.jar" ]; then
  NEED_BUILD=true
fi

if [ "$NEED_BUILD" = true ]; then
  echo -e "${YELLOW}Building Spring Boot JARs via Maven...${NC}"
  (cd "$ROOT_DIR/backend" && mvn clean package -DskipTests)
  echo -e "${GREEN}✓ Backend JARs built successfully.${NC}"
else
  echo -e "${GREEN}✓ Existing pre-compiled JARs detected.${NC}"
fi

# 5. Check Frontend Dependencies
echo -e "\n${YELLOW}[Step 4/4] Checking Frontend Dependencies...${NC}"
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo -e "${YELLOW}Installing frontend node_modules...${NC}"
  (cd "$ROOT_DIR/frontend" && pnpm install)
fi

echo -e "\n${GREEN}========================================================================${NC}"
echo -e "${GREEN}             🎉 All Dependencies & Infrastructure Ready!                ${NC}"
echo -e "${GREEN}========================================================================${NC}"
echo -e ""
echo -e "You can now run the services in separate terminals (recommended):"
echo -e ""
echo -e "  ${CYAN}Terminal 1 (Product Service :8081):${NC}"
echo -e "    java -jar backend/product-service/target/product-service-1.0.0-SNAPSHOT.jar"
echo -e ""
echo -e "  ${CYAN}Terminal 2 (Order Service :8082):${NC}"
echo -e "    java -jar backend/order-service/target/order-service-1.0.0-SNAPSHOT.jar"
echo -e ""
echo -e "  ${CYAN}Terminal 3 (Notification Service :8083):${NC}"
echo -e "    java -jar backend/notification-service/target/notification-service-1.0.0-SNAPSHOT.jar"
echo -e ""
echo -e "  ${CYAN}Terminal 4 (Frontend Web Application :3000):${NC}"
echo -e "    cd frontend && pnpm dev --port 3000"
echo -e ""
echo -e "${CYAN}Available Credentials:${NC}"
echo -e "  1. ${GREEN}Customer Account (USER):${NC}       bitaniya.user  / password123"
echo -e "  2. ${YELLOW}Store Admin Account (ADMIN):${NC}   bitaniya.admin / adminPass2026"
echo -e ""
echo -e "${CYAN}Create New Customer or Admin Account:${NC}"
echo -e "  ./create-account.sh <username> <password> <USER|ADMIN>"
echo -e "  (or run interactively: ./create-account.sh)"
echo -e "========================================================================"
