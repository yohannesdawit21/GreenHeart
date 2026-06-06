#!/bin/sh
set -e

if [ "${RUN_DB_MIGRATE:-true}" = "true" ]; then
  echo "[entrypoint] Running database migrations..."
  node dist/bootstrap/migrate.js
fi

if [ "${RUN_ADMIN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Seeding admin user..."
  node dist/bootstrap/seed-admin.js
fi

echo "[entrypoint] Starting API on port ${PORT:-4000}..."
exec node dist/index.js
