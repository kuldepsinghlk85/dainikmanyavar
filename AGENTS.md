# Dainik Manyavar — Hindi News Portal

Next.js 15 (App Router) + React 19 + Prisma 6 (SQLite) + Tailwind. Public news site + full admin CMS.

---

# Ponytail, lazy senior dev mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.

The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.

Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and upgrade path.

Not lazy about: understanding the problem (read it fully and trace the real flow before picking a rung, a small diff you don't understand is just laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.

---


## Commands
```bash
npm run dev        # dev server on port 3015 (NOT 3000)
npm run build      # prisma generate && prisma db push && next build
npm start          # prod server on 3015
npm run db:seed    # prisma/seed.ts (admin@dainikmanyavar.in)
npm run db:check-seeds  # reruns all boot seeds twice, asserts row counts don't move
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
- **App Router `params` are raw percent-encoded segments, not decoded.** Any dynamic route with Hindi slugs must `decodeURIComponent(slug)` before querying, or it works in dev and 404s in production. `/news/[slug]` and `/mobile/news/[slug]` also fall back to the trailing `-<newsId>` suffix.
- Docker entrypoint reruns all `prisma/seed_*.js` on every container start; they must stay idempotent — guard on a **unique** column, or upsert. Verify with `npm run db:check-seeds`. A P2002 here crash-loops the container, Swarm rolls back, and prod silently keeps serving the old image.
- `prisma/deduplicate_tags.js` runs last and rewrites tag `name` (it lowercases non-Hindi tags: `#MSP` → `#msp`). Key tag lookups on `slug`, the unique column — never on `name`.
- SQLite: no concurrent writers. Prod DB is one bind-mounted file.

## Security — rules for any change

Baseline: OWASP ASVS L1 / OWASP Top 10. The rules below are what new or edited code must
satisfy. Several are **not** true of the current code — see "Known gaps" — so never assume a
route is already protected; check it.

### Authorization
- **Every handler under `src/app/api/admin/` must start with its own session check.**
  `src/middleware.ts` only tests that the `admin_token` cookie *exists*; the value is unsigned
  and unverified, so `admin_token=anything:0` passes it. Middleware is defence-in-depth, never
  the authorization boundary.
  ```ts
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  ```
- **Any route that writes must live under `/api/admin/` or check the session explicitly.**
  `middleware.ts` matches only `/admin/:path*` and `/api/admin/:path*` — a mutating route
  anywhere else in `src/app/api/` is fully public.
- Role checks (`session.role`) belong in the handler too; `getAdminSession()` returns the role
  but enforces nothing.
- Destructive handlers (`DELETE`, bulk archive, user edit) also need an `auditLog` row — that
  table is the only forensic trail.

### Sessions
- `admin_token` = `${user.id}:${Date.now()}`, unsigned, and the timestamp is never read. Cookie
  flags are correct (`httpOnly`, `secure` in prod, `sameSite: 'lax'`, 7d `maxAge`).
- When touching auth: sign or randomize the token (HMAC with a real secret, or a `Session` row),
  and enforce absolute expiry server-side in `getAdminSession()`. `JWT_SECRET` in `.env` is dead
  — do not start reading it without also removing its hardcoded fallback in `src/lib/auth.ts`.
- Login has no rate limit or lockout. Add throttling before adding any new credential endpoint.

### Uploads (`/api/admin/media`, `/api/upload`, `/api/epaper/upload`)
- Validate on the server, not the client: extension **and** MIME against an allowlist, plus a
  byte cap. `file.type` is attacker-controlled — treat it as a hint.
- The filename sanitizer (`replace(/[^a-zA-Z0-9.-]/g, '_')`) plus the `Date.now()` prefix stops
  traversal; keep both if you rewrite it.
- `src/app/uploads/[...path]/route.ts` serves `.svg` as `image/svg+xml` from the site origin —
  that is stored XSS via an uploaded file. Either drop SVG from `MIME_TYPES` or send it with
  `Content-Disposition: attachment`. Always send `X-Content-Type-Options: nosniff`.
- Its `resolvedPath.startsWith(uploadsDir)` traversal guard must stay.

### Input and output
- Never return `error.message` to the client (`{ error: error.message }` appears in most
  routes). It leaks Prisma queries, file paths, and schema. Log server-side, return a fixed
  string.
- Prisma parameterizes queries — but `where: any` built from `searchParams` (e.g.
  `src/app/api/search/route.ts`) still lets a caller widen a query. Whitelist the params you
  accept.
- Public writes (`/api/like`, `/api/newsletter`, `/api/contact`) need rate limiting; they are
  unauthenticated inserts into the one SQLite writer.
- Never interpolate user text into raw SQL, `$queryRawUnsafe`, or shell commands in
  `src/lib/importer/` and `src/lib/epaper/`.

### Headers and transport
- `next.config.js` sets no security headers. When adding them, use `headers()` there:
  `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`,
  `Permissions-Policy`. Ship CSP in `Report-Only` first — inline scripts exist in the ad and
  analytics components.
- `images.remotePatterns` currently allows `http://**` and `https://**` (any host). Narrow it to
  the RSS/CDN hosts actually used before enabling image optimization.

### Secrets
- `.env` is gitignored — keep it that way; never commit real SMTP or DB credentials, and never
  add a secret to a `NEXT_PUBLIC_*` variable (those are inlined into client bundles at build
  time by `.devops/Dockerfile`).

### Known gaps (true as of the current tree — do not assume otherwise)
- 0 of 24 `src/app/api/admin/**/route.ts` files call `getAdminSession()`. Admin CMS write access
  is reachable with a forged cookie.
- These mutating routes sit outside the middleware matcher entirely: `/api/upload`,
  `/api/media` (DELETE), `/api/articles/[id]` (PUT), `/api/epaper/upload`, `/api/rss/sync-all`,
  `/api/rss/create-draft/[id]`, `/api/rss/sync/[sourceId]`, `/api/contact/[id]` (PATCH,
  DELETE), `/api/auto-sync`, `/api/import/webhook/[sourceId]`.
- No upload size or type limit anywhere; SVG is served inline.
- No security headers, no rate limiting, no CSRF token (`sameSite: 'lax'` is the only defence,
  and it does not cover top-level POST navigations).

Audit one-liner before claiming a route is protected:
```bash
for f in $(find src/app/api -name route.ts); do grep -q getAdminSession "$f" || echo "$f"; done
```

## Performance — rules for any change

Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms on 4G mobile — it is a news site read mostly on
phones.

### Rendering and caching
- Public pages: ISR via `export const revalidate = <seconds>` (homepage uses 60). **Never put
  `force-dynamic` on a public page** — it makes every reader hit SQLite. Only `/admin/*` and
  `sitemap.xml` may use it (see the Gotchas above for why they must).
- Prefer static/ISR segments plus `revalidatePath()` from the admin mutation route over
  shortening `revalidate`.
- API `GET`s that serve public data should send `Cache-Control: public, s-maxage=..., stale-while-revalidate=...`.
  Most currently send none.
- Uploads already send `public, max-age=2592000, immutable` — keep that on any new asset route.

### Database (SQLite, one file, one writer)
- **Every `findMany` needs a `take`.** Roughly 83 `findMany` calls against 35 `take:` in the
  tree — unbounded list queries are the main scaling risk here.
- Use `select` over `include` on list queries; article `content` is large and rarely needed in a
  list.
- Index whatever you filter or order by. 33 models, ~13 indexes: `status`, `publishedAt`,
  `slug`, `newsId`, `categoryId`, `locationId` are the hot ones.
- Batch reads on a page with `Promise.all` (the homepage runs ~11 queries) — but never fan out
  writes in parallel: SQLite serializes writers and a concurrent write throws
  `SQLITE_BUSY`.
- Keep transactions short. A long `$transaction` in an importer or e-paper job blocks every
  reader's write on the whole site. Long jobs: chunk them.
- No N+1 inside `.map()` — resolve relations in the parent query.

### Assets
- `images.unoptimized: true`, so Next does no resizing or AVIF/WebP conversion — image weight
  is whatever was uploaded. Resize on upload, or turn optimization on (after narrowing
  `remotePatterns`).
- Use `next/image` with explicit `width`/`height` (prevents CLS) and `priority` on the lead
  story only. 14 raw `<img>` tags remain; converting them is a genuine win.
- Heavy client components (`pdfjs-dist` in the e-paper viewer, charts in admin analytics) go
  behind `next/dynamic` with `ssr: false`. `pdfjs-dist` must never enter a public bundle.
- Default to server components. Add `'use client'` only for actual interactivity, and keep it on
  the leaf, not the page.
- The uploads route `readFile`s the whole file into memory — fine for images, bad for e-paper
  PDFs and the MP4s. Stream if large media starts being served.

### Checks
- `npm run build` prints per-route sizes and the static/dynamic marker — read it. A public route
  that flipped to `ƒ (Dynamic)` is a regression.
- Watch First Load JS; investigate a shared-bundle jump above ~200KB.

## Before pushing — run every local gate

`testing` auto-deploys with no staging gate, so anything broken ships to production.
**A green build does not mean the container will boot.** `next build` never runs the
entrypoint seeds, so the whole class of startup failures is invisible to it — that is
exactly how a seed `P2002` crash-looped prod while every build passed. Run all four
gates below; each catches a failure class the others cannot see.

**1. Dependencies match CI.** CI runs `npm ci` from the lockfile, so a package that is
only in your local `node_modules` still breaks the build there (and a stale local tree
reports phantom "Module not found" errors here):

```bash
npm ci --prefer-offline --no-audit --no-fund
```

**2. Production build** — same env the Dockerfile builder stage sets (`.devops/Dockerfile`),
no Docker needed:

```bash
NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 \
  NEXT_PUBLIC_SITE_URL=https://dainikmanyavar.com \
  DATABASE_URL="file:./dainik-manyawar.db?connection_limit=1&connect_timeout=30" \
  npm run build
```

That `DATABASE_URL` is relative to `prisma/`, so it creates and pushes to
`prisma/dainik-manyawar.db` and leaves `dev.db` alone — delete it afterwards. Most build
breaks are prerender errors on admin pages missing `force-dynamic`. Also read the route
table it prints: a public route that flipped to `ƒ (Dynamic)`, or a shared-bundle jump
above ~200KB, is a regression.

**3. Seed idempotency** — required whenever you touch anything under `prisma/`. The
entrypoint reruns every seed on each container start, so a seed that is not idempotent
crash-loops the container, Swarm rolls back, and prod silently keeps serving the old
image while the deploy still reports success:

```bash
npm run db:check-seeds
```

**4. Smoke-test the routes you changed.** `npm run build && npm start`, then hit them —
including a **percent-encoded Hindi slug**, which is the case that works in dev and 404s
in production:

```bash
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3015/mobile/news/<hindi-slug>"
```

If you changed `bin/docker_entrypoint.sh` or a seed's crash behaviour, the only faithful
test is the real image — `docker build -f .devops/Dockerfile .` and run it against a
throwaway DB copy.

## Deploy
Push to `testing` → `.github/workflows/deploy-prod.yml` builds and deploys to production. No staging gate — `testing` IS the release branch.
Volumes: `/opt/dainik-manyavar/uploads`, `/opt/dainik-manyavar/db/dainik-manyawar.db`.

A green workflow does **not** mean production updated — `update_config.failure_action: rollback`
in `.devops/docker-stack.yml` silently reverts a failing rollout. Verify the tag that is actually
running; do not trust the run's status.

Server: `ssh clKsVps01`. Triage:
```bash
docker service ps danikmanyawar_danikmanyawar --no-trunc          # task states + exit errors
docker service logs danikmanyawar_danikmanyawar --tail 100        # entrypoint/seed output
docker service update --force danikmanyawar_danikmanyawar         # reschedule, same spec
```
There is no version endpoint: to tell which commit is live, probe a field a known commit added
(e.g. `active` on `/api/locations`, added in `1bab8d0`).

## Env
`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `PORT=3015`. Optional SMTP (`SMTP_HOST/PORT/USER/PASS`) for contact + newsletter mail. See `.env.example`.
