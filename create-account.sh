#!/usr/bin/env bash
# ==============================================================================
# Aurora Hardware — Keycloak Account Provisioning Script
# Creates new users in Keycloak with either 'USER' or 'ADMIN' role
#
# Usage:
#   Interactive:    ./create-account.sh
#   CLI Args:       ./create-account.sh <username> <password> <USER|ADMIN> [email] [fullName]
#   Create Pair:    ./create-account.sh --pair <prefix> <password>
#   Seed Defaults:  ./create-account.sh --seed
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Keycloak container is running
if ! docker ps --format '{{.Names}}' | grep -q 'minicommerce-keycloak'; then
  echo -e "${RED}[ERROR] Keycloak container 'minicommerce-keycloak' is not running.${NC}"
  echo -e "Please start infrastructure first: docker compose up -d keycloak"
  exit 1
fi

provision_user() {
  local p_user="$1"
  local p_pass="$2"
  local p_role="$3"
  local p_email="$4"
  local p_name="$5"

  local p_role_upper
  p_role_upper=$(echo "$p_role" | tr '[:lower:]' '[:upper:]')

  if [[ "$p_role_upper" == "1" || "$p_role_upper" == "CUSTOMER" || "$p_role_upper" == "USER" ]]; then
    p_role_upper="USER"
  elif [[ "$p_role_upper" == "2" || "$p_role_upper" == "STORE_ADMIN" || "$p_role_upper" == "ADMIN" ]]; then
    p_role_upper="ADMIN"
  else
    echo -e "${RED}[ERROR] Invalid role '$p_role'. Must be either 'USER' or 'ADMIN'.${NC}"
    return 1
  fi

  local first_name
  local last_name
  first_name=$(echo "$p_name" | awk '{print $1}')
  last_name=$(echo "$p_name" | awk '{$1=""; print $0}' | sed 's/^ //')
  if [ -z "$last_name" ]; then
    last_name="Account"
  fi

  echo -e "${YELLOW}Provisioning account '$p_user' in Keycloak realm 'mini-commerce'...${NC}"

  # 1. Authenticate kcadm CLI as master admin
  docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8080 \
    --realm master \
    --user admin \
    --password admin > /dev/null 2>&1

  # 2. Check if user already exists
  local existing_id
  existing_id=$(docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh get users \
    -r mini-commerce -q "username=$p_user" --fields id 2>/dev/null | grep -o '"id" : "[^"]*"' | head -n1 | cut -d'"' -f4 || true)

  if [ -n "$existing_id" ]; then
    docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh update "users/$existing_id" \
      -r mini-commerce \
      -s enabled=true \
      -s email="$p_email" \
      -s emailVerified=true \
      -s firstName="$first_name" \
      -s lastName="$last_name" > /dev/null
  else
    docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh create users \
      -r mini-commerce \
      -s username="$p_user" \
      -s enabled=true \
      -s email="$p_email" \
      -s emailVerified=true \
      -s firstName="$first_name" \
      -s lastName="$last_name" > /dev/null
  fi

  # 3. Set non-temporary password
  docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh set-password \
    -r mini-commerce \
    --username "$p_user" \
    --new-password "$p_pass" > /dev/null

  # 4. Assign Realm Role (USER or ADMIN)
  docker exec minicommerce-keycloak /opt/keycloak/bin/kcadm.sh add-roles \
    -r mini-commerce \
    --uusername "$p_user" \
    --rolename "$p_role_upper" > /dev/null

  local role_display="USER (Store Customer)"
  if [ "$p_role_upper" = "ADMIN" ]; then
    role_display="ADMIN (Store Management Portal)"
  fi

  echo -e "${GREEN}========================================================================${NC}"
  echo -e "${GREEN}  ✓ Account Provisioned Successfully in Keycloak!                      ${NC}"
  echo -e "${GREEN}========================================================================${NC}"
  echo -e "  Username: ${CYAN}$p_user${NC}"
  echo -e "  Password: ${CYAN}$p_pass${NC}"
  echo -e "  Role:     ${CYAN}$role_display${NC}"
  echo -e "  Email:    ${CYAN}$p_email${NC}"
  echo -e "  Realm:    ${CYAN}mini-commerce${NC}"
  echo -e "========================================================================\n"
}

# --- Mode: Seed Default Credentials ---
if [ "$1" = "--seed" ] || [ "$1" = "--defaults" ]; then
  echo -e "${CYAN}========================================================================${NC}"
  echo -e "${CYAN}   Provisioning Standard User & Admin Credentials in Keycloak           ${NC}"
  echo -e "${CYAN}========================================================================${NC}"
  provision_user "bitaniya.user" "password123" "USER" "bitaniya.user@minicommerce.local" "Bitaniya User"
  provision_user "bitaniya.admin" "adminPass2026" "ADMIN" "bitaniya.admin@minicommerce.local" "Bitaniya Admin"
  provision_user "customer.demo" "password123" "USER" "customer.demo@minicommerce.local" "Demo Customer"
  provision_user "admin.demo" "adminPass2026" "ADMIN" "admin.demo@minicommerce.local" "Demo Admin"
  exit 0
fi

# --- Mode: Create Pair (both a customer and an admin for a given prefix) ---
if [ "$1" = "--pair" ]; then
  PREFIX="$2"
  PASS="$3"
  if [ -z "$PREFIX" ] || [ -z "$PASS" ]; then
    echo -e "${RED}[ERROR] Usage: ./create-account.sh --pair <prefix> <password>${NC}"
    echo -e "Example: ./create-account.sh --pair john pass123"
    exit 1
  fi
  provision_user "${PREFIX}.user" "$PASS" "USER" "${PREFIX}.user@minicommerce.local" "${PREFIX} Customer"
  provision_user "${PREFIX}.admin" "$PASS" "ADMIN" "${PREFIX}.admin@minicommerce.local" "${PREFIX} Admin"
  exit 0
fi

USERNAME="$1"
PASSWORD="$2"
ROLE="$3"
EMAIL="$4"
FULL_NAME="$5"

# If arguments not provided, prompt interactively
if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
  echo -e "${CYAN}========================================================================${NC}"
  echo -e "${CYAN}        Aurora Hardware — Create New Keycloak Account                   ${NC}"
  echo -e "${CYAN}========================================================================${NC}"

  read -r -p "Enter Username (e.g. john.doe): " USERNAME
  if [ -z "$USERNAME" ]; then
    echo -e "${RED}[ERROR] Username cannot be empty.${NC}"
    exit 1
  fi

  read -r -s -p "Enter Password (e.g. password123): " PASSWORD
  echo ""
  if [ -z "$PASSWORD" ]; then
    echo -e "${RED}[ERROR] Password cannot be empty.${NC}"
    exit 1
  fi

  echo -e "\nSelect Account Role:"
  echo "  1) Store Customer (Role: USER) — Browse store, place orders, view order status"
  echo "  2) Store Administrator (Role: ADMIN) — Manage catalog, inventory, analytics"
  read -r -p "Select [1 or 2, Default: 1]: " ROLE_CHOICE
  ROLE_CHOICE="${ROLE_CHOICE:-1}"

  case "$ROLE_CHOICE" in
    1) ROLE="USER" ;;
    2) ROLE="ADMIN" ;;
    *)
      if [[ "$ROLE_CHOICE" =~ ^(admin|ADMIN|2)$ ]]; then
        ROLE="ADMIN"
      else
        ROLE="USER"
      fi
      ;;
  esac

  read -r -p "Enter Full Name [Default: $USERNAME]: " FULL_NAME
  FULL_NAME="${FULL_NAME:-$USERNAME}"

  read -r -p "Enter Email [Default: ${USERNAME}@minicommerce.local]: " EMAIL
  EMAIL="${EMAIL:-${USERNAME}@minicommerce.local}"
fi

# Fallback for CLI when role not provided
ROLE="${ROLE:-USER}"
EMAIL="${EMAIL:-${USERNAME}@minicommerce.local}"
FULL_NAME="${FULL_NAME:-$USERNAME}"

provision_user "$USERNAME" "$PASSWORD" "$ROLE" "$EMAIL" "$FULL_NAME"
