#!/usr/bin/env bash
# Test CORS + admin login on production API.
# Usage (on VPS or laptop):
#   API_BASE=https://api.kirbgarage.com ./scripts/test-cors-auth.sh
set -euo pipefail

API_BASE="${API_BASE:-https://api.kirbgarage.com}"
ORIGIN="${ORIGIN:-http://localhost:5173}"
EMAIL="${ADMIN_EMAIL:-admin@gmail.com}"
PASSWORD="${ADMIN_PASSWORD:-12345678}"
COOKIE_JAR="$(mktemp /tmp/gh-cookies.XXXXXX)"

cleanup() { rm -f "$COOKIE_JAR"; }
trap cleanup EXIT

echo "=== 1) Health ==="
curl -sS "$API_BASE/health"
echo -e "\n"

echo "=== 2) CORS preflight (OPTIONS /api/auth/login) ==="
PREFLIGHT=$(curl -sS -i -X OPTIONS "$API_BASE/api/auth/login" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type")

echo "$PREFLIGHT" | head -20

if echo "$PREFLIGHT" | grep -qi "access-control-allow-origin"; then
  echo "[OK] Access-Control-Allow-Origin present"
else
  echo "[FAIL] Missing Access-Control-Allow-Origin — set CORS_ORIGIN=* in .env and deploy latest backend code, then restart"
  exit 1
fi
echo

echo "=== 3) Login (POST /api/auth/login) with Origin + cookies ==="
LOGIN=$(curl -sS -i -X POST "$API_BASE/api/auth/login" \
  -H "Origin: $ORIGIN" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN" | head -25

if echo "$LOGIN" | grep -q '"role":"admin"'; then
  echo "[OK] Admin login succeeded"
else
  echo "[FAIL] Login did not return admin user — check credentials or seed admin"
  exit 1
fi

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p' | head -1)
if [[ -z "$TOKEN" ]]; then
  echo "[WARN] No token in JSON body"
else
  echo "[OK] Got JWT token (${#TOKEN} chars)"
fi
echo

echo "=== 4) /me with cookie ==="
ME_COOKIE=$(curl -sS -i "$API_BASE/api/auth/me" \
  -H "Origin: $ORIGIN" \
  -b "$COOKIE_JAR")
echo "$ME_COOKIE" | head -15
if echo "$ME_COOKIE" | grep -q '"role":"admin"'; then
  echo "[OK] /me works with cookie"
else
  echo "[WARN] /me with cookie failed (Bearer test next)"
fi
echo

if [[ -n "${TOKEN:-}" ]]; then
  echo "=== 5) /me with Bearer token ==="
  ME_BEARER=$(curl -sS -i "$API_BASE/api/auth/me" \
    -H "Origin: $ORIGIN" \
    -H "Authorization: Bearer $TOKEN")
  echo "$ME_BEARER" | head -15
  if echo "$ME_BEARER" | grep -q '"role":"admin"'; then
    echo "[OK] /me works with Bearer token"
  else
    echo "[FAIL] /me with Bearer failed"
    exit 1
  fi
fi

echo
echo "All checks passed for $API_BASE"
