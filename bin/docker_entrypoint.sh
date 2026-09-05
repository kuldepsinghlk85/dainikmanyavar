#!/bin/sh

set -e

echo "============================================================"
echo "[Dainik Manyavar] Initializing application..."
echo "============================================================"

if [ -n "$DATABASE_URL" ]; then

    echo "[Dainik Manyavar] Syncing Prisma database schema..."
    ./node_modules/.bin/prisma db push --skip-generate

    echo "[Dainik Manyavar] Running main Prisma seed..."
    ./node_modules/.bin/prisma db seed

    echo "[Dainik Manyavar] Running articles seed..."
    node prisma/seed_articles.js

    echo "[Dainik Manyavar] Running header advertisement seed..."
    node prisma/seed_header_ad.js

    echo "[Dainik Manyavar] Running media archive seed..."
    node prisma/seed_media_archive.js

    echo "[Dainik Manyavar] Running RSS library seed..."
    node prisma/seed_rss_library.js

    echo "[Dainik Manyavar] Running RSS seed..."
    node prisma/seed_rss.js

    echo "[Dainik Manyavar] Running sample ads seed..."
    node prisma/seed_sample_ads.js

    # E-Paper seed is disabled to permanently protect production user uploaded editions and pages
    # node prisma/seed_epaper.js

    echo "[Dainik Manyavar] Running special modules seed..."
    node prisma/seed_special_modules.js

    echo "[Dainik Manyavar] Running UP mandals and districts seed..."
    node prisma/seed_up_locations.js

    echo "[Dainik Manyavar] Running editor account seed..."
    node prisma/seed_editor.js

    # Ensure uploads volume has required subdirectories
    mkdir -p /app/public/uploads/epaper/pages /app/public/uploads/epaper/ads /app/public/uploads/news 2>/dev/null || true

    # Safely seed default template images without overwriting user data
    if [ -d "/app/public_seed_uploads" ]; then
        cp -rn /app/public_seed_uploads/* /app/public/uploads/ 2>/dev/null || true
    fi

    echo "============================================================"
    echo "[Dainik Manyavar] All database seeds completed successfully."
    echo "============================================================"

else
    echo "[Dainik Manyavar] WARNING: DATABASE_URL is not set."
    echo "[Dainik Manyavar] Skipping database initialization and seeds."
fi

echo "[Dainik Manyavar] Starting Next.js application..."
echo "============================================================"

exec "$@"