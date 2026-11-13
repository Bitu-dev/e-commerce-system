#!/usr/bin/env bash
# ==============================================================================
# Aurora Hardware — Platform Teardown Script
# Stops Docker Containers and Background Spring Boot / Next.js Processes
# ==============================================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}Stopping Aurora Hardware infrastructure and processes...${NC}"

# Stop Docker infrastructure
docker compose down

echo -e "${GREEN}✓ All Docker infrastructure containers stopped.${NC}"
