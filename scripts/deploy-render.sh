#!/bin/bash

# Render Deployment Script – WORKER ONLY
# Consumes RabbitMQ messages

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "🚀 Preparing Render Worker Deployment"

# 1️⃣ Check dependencies
command -v node >/dev/null || fail "Node.js not installed"
command -v npm  >/dev/null || fail "npm not installed"
ok "Node & npm available"

# 2️⃣ Install dependencies
info "Installing dependencies..."
npm ci
ok "Dependencies installed"

# 3️⃣ Validate worker entry file
WORKER_FILE="src/workers/ledgerWorker.js"
[ -f "$WORKER_FILE" ] || fail "Worker file not found: $WORKER_FILE"
ok "Worker file exists"

# 4️⃣ Check required environment variables (local only)
REQUIRED_VARS=(RABBITMQ_URL DATABASE_URL)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    warn "$var not set locally (OK for Render dashboard)"
  else
    ok "$var is set"
  fi
done

# 5️⃣ Optional local test run
info "You can locally test the worker with:"
echo "    RABBITMQ_URL=... DATABASE_URL=... node $WORKER_FILE"

echo ""
ok "✅ Worker is ready for Render deployment"
echo "➡ Push to GitHub and deploy using Render Blueprint"
