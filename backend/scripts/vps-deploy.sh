#!/usr/bin/env bash
# Run ON the VPS after git pull — rebuilds and restarts the API with open CORS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — create from .env.contabo.example first."
  exit 1
fi

if ! grep -qE '^CORS_ORIGIN=\*' .env && ! grep -qE '^CORS_ALLOW_ALL=true' .env; then
  echo "Setting CORS_ORIGIN=* in .env ..."
  if grep -q '^CORS_ORIGIN=' .env; then
    sed -i 's/^CORS_ORIGIN=.*/CORS_ORIGIN=*/' .env
  else
    echo 'CORS_ORIGIN=*' >> .env
  fi
fi

echo "[deploy] npm ci ..."
npm ci

echo "[deploy] npm run build ..."
npm run build

echo "[deploy] restarting API ..."
if command -v pm2 >/dev/null 2>&1 && pm2 describe greenheart-api >/dev/null 2>&1; then
  pm2 restart greenheart-api
elif pgrep -f "node dist/index.js" >/dev/null 2>&1; then
  pkill -f "node dist/index.js" || true
  sleep 1
  nohup npm start > /var/log/greenheart-api.log 2>&1 &
else
  echo "Start manually: npm start   (or: pm2 start npm --name greenheart-api -- start)"
  npm start &
fi

sleep 3

echo "[deploy] running CORS + auth smoke test ..."
API_BASE="${API_BASE:-https://api.kirbgarage.com}" \
  ./scripts/test-cors-auth.sh
