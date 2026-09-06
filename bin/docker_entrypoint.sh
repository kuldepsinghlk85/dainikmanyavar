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

    # Sample-content seeds are best-effort. `set -e` used to make any one of them
    # abort startup, so a single bad row crash-looped the container and Swarm
    # rolled the release back — production silently stayed on the old image.
    # Schema sync and the main seed above stay fatal; these do not.
    seed_optional() {
        echo "[Dainik Manyavar] Running $2..."
        if ! node "prisma/$1"; then
            echo "[Dainik Manyavar] WARNING: prisma/$1 failed — continuing startup."
            SEED_FAILURES="${SEED_FAILURES}${SEED_FAILURES:+, }$1"
        fi
    }

    SEED_FAILURES=""

    seed_optional seed_articles.js         "articles seed"
    seed_optional seed_header_ad.js        "header advertisement seed"
    seed_optional seed_media_archive.js    "media archive seed"
    seed_optional seed_rss_library.js      "RSS library seed"
    seed_optional seed_rss.js              "RSS seed"
    seed_optional seed_sample_ads.js       "sample ads seed"

    # E-Paper seed is disabled to permanently protect production user uploaded editions and pages
    # seed_optional seed_epaper.js         "e-paper seed"

    seed_optional seed_special_modules.js  "special modules seed"
    seed_optional seed_up_locations.js     "UP mandals and districts seed"
    seed_optional deduplicate_tags.js      "tag deduplication & normalization"
    seed_optional seed_editor.js           "editor account seed"

    # Ensure uploads volume has required subdirectories
    mkdir -p /app/public/uploads/epaper/pages /app/public/uploads/epaper/ads /app/public/uploads/news 2>/dev/null || true

    # Safely seed default template images without overwriting user data
    if [ -d "/app/public_seed_uploads" ]; then
        cp -rn /app/public_seed_uploads/* /app/public/uploads/ 2>/dev/null || true
    fi

    echo "============================================================"
    if [ -n "$SEED_FAILURES" ]; then
        echo "[Dainik Manyavar] Database seeds finished WITH FAILURES: $SEED_FAILURES"
    else
        echo "[Dainik Manyavar] All database seeds completed successfully."
    fi
    echo "============================================================"

else
    echo "[Dainik Manyavar] WARNING: DATABASE_URL is not set."
    echo "[Dainik Manyavar] Skipping database initialization and seeds."
fi

echo "[Dainik Manyavar] Starting Next.js application..."
echo "============================================================"

exec "$@"