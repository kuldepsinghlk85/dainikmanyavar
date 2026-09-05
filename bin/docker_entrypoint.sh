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

    echo "[Dainik Manyavar] Running e-paper seed..."
    node prisma/seed_epaper.js

    echo "[Dainik Manyavar] Running special modules seed..."
    node prisma/seed_special_modules.js

    echo "[Dainik Manyavar] Running UP mandals and districts seed..."
    node prisma/seed_up_locations.js

    echo "[Dainik Manyavar] Running real pages update..."
    node prisma/update_db_with_real_pages.js

    echo "[Dainik Manyavar] Running real pages copy..."
    node prisma/add_5sept_edition.js

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