#!/bin/sh
set -e

# ==============================================================================
# Dainik Manyavar Container Runtime Entrypoint
# Ensures directory permissions and database schema synchronization
# ==============================================================================

# Ensure storage directories exist
mkdir -p /app/prisma /app/public/uploads /app/.next/cache

# Apply Prisma database schema to SQLite if DATABASE_URL is defined
if [ -n "$DATABASE_URL" ]; then
  echo "[Dainik Manyavar] Initializing/syncing Prisma database schema..."
  npx prisma db push --skip-generate
fi

echo "[Dainik Manyavar] Starting Next.js application on port ${PORT:-3015}..."
exec "$@"