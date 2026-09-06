// Regression check for the seed scripts the Docker entrypoint reruns on every
// container start. A non-idempotent seed either crash-loops the container (the
// P2002 that pinned production to a stale image) or silently duplicates rows.
//
// Runs the seeds twice against a throwaway SQLite file and asserts the row
// counts do not move on the second pass. Run: npm run db:check-seeds
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Kept in sync with bin/docker_entrypoint.sh — the seeds that run every boot.
const SEEDS = [
  'seed_articles.js',
  'seed_header_ad.js',
  'seed_media_archive.js',
  'seed_rss_library.js',
  'seed_rss.js',
  'seed_sample_ads.js',
  'seed_special_modules.js',
  'seed_up_locations.js',
  'deduplicate_tags.js',
  'seed_editor.js',
];

const MODELS = [
  'article',
  'tag',
  'articleTag',
  'category',
  'location',
  'horoscope',
  'cricketMatch',
  'stockMarketUpdate',
  'commodityPrice',
  'mediaItem',
  'newsSource',
];

const repoRoot = path.join(__dirname, '..');
const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'seedcheck-')), 'check.db');
const env = { ...process.env, DATABASE_URL: `file:${dbFile}` };
const run = (cmd, args) => execFileSync(cmd, args, { cwd: repoRoot, env, stdio: 'inherit' });

async function counts() {
  // Required lazily: the client must pick up DATABASE_URL set above.
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  try {
    const out = {};
    for (const model of MODELS) out[model] = await db[model].count();
    return out;
  } finally {
    await db.$disconnect();
  }
}

(async () => {
  run('npx', ['prisma', 'db', 'push', '--skip-generate']);

  const passes = [];
  for (const pass of [1, 2]) {
    console.log(`\n=== seed pass ${pass} ===`);
    for (const seed of SEEDS) run('node', [path.join('prisma', seed)]);
    passes.push(await counts());
  }

  console.log('\npass 1:', JSON.stringify(passes[0]));
  console.log('pass 2:', JSON.stringify(passes[1]));

  assert.deepStrictEqual(
    passes[1],
    passes[0],
    'Seeds are not idempotent: rerunning them changed row counts. ' +
      'The entrypoint reruns every seed on each container start, so each row must ' +
      'be created at most once — guard on a unique column, or upsert.'
  );

  console.log('\nOK — seeds are idempotent across reruns.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
