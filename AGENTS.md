# Dainik Manyavar — Hindi News Portal

Next.js 15 (App Router) + React 19 + Prisma 6 (SQLite) + Tailwind. Public news site + full admin CMS.

## Commands
```bash
npm run dev        # dev server on port 3015 (NOT 3000)
npm run build      # prisma generate && prisma db push && next build
npm start          # prod server on 3015
npm run db:seed    # prisma/seed.ts (admin@dainikmanyavar.in)
npm run db:studio
```

## Architecture
- `src/app/` — public routes (`/`, `/news/[slug]`, `/category/[slug]`, `/epaper`, `/district/[slug]`)
- `src/app/admin/` — ~40 CMS pages (news, epaper, importer, RSS, ads, analytics)
- `src/app/api/` — public routes; `src/app/api/admin/` — protected routes
- `src/lib/` — `db.ts` (Prisma singleton), `auth.ts`, `importer/` (RSS ingest), `epaper/pdfProcessor.ts`, `seo.ts`, `tts.ts`
- `src/components/public/` + `src/components/admin/`
- `prisma/schema.prisma` — 35 models. `@/*` → `./src/*`

## Gotchas
- **Auth is not JWT.** Cookie `admin_token` = `${user.id}:${Date.now()}`, unsigned. `JWT_SECRET` in `.env` is unused. `src/middleware.ts` only checks cookie presence; `getAdminSession()` re-reads the user row.
- **Admin pages need `export const dynamic = 'force-dynamic'`** when they query Prisma — otherwise `next build` fails trying to prerender. Same for `sitemap.xml`.
- **Always import `{ db }` from `@/lib/db`.** Never `new PrismaClient()` — dev HMR exhausts SQLite connections.
- `npm run build` runs `prisma db push` — it writes to the DB, not just compiles.
- `public/uploads` is served by `src/app/uploads/[...path]/route.ts`, not Next static. Uploads volume mounts at runtime, so files aren't in the build.
- Docker entrypoint reruns all 11 `prisma/seed_*.js` scripts on every container start; they must stay idempotent (upsert-only).
- SQLite: no concurrent writers. Prod DB is one bind-mounted file.

## Deploy
Push to `testing` → `.github/workflows/deploy-prod.yml` builds and deploys to production. No staging gate — `testing` IS the release branch.
Volumes: `/opt/dainik-manyavar/uploads`, `/opt/dainik-manyavar/db/dainik-manyawar.db`.

## Env
`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `PORT=3015`. Optional SMTP (`SMTP_HOST/PORT/USER/PASS`) for contact + newsletter mail. See `.env.example`.
