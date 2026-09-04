# ------------------------------------------------------------------------------
# Production Multi-Stage Dockerfile for Dainik Manyavar
# Framework: Next.js 15.1.7 | React 19 | Prisma 6 (SQLite) | Port 3015
#
# Cache strategy:
#   - deps / prod-deps build in PARALLEL, both share the /root/.npm cache mount
#   - prisma generate is its own layer, invalidated only by prisma/
#   - next build is invalidated only by src/ + config, NOT by public/ (42MB)
#   - public/ and prisma/ go straight from build context to the runner
# ------------------------------------------------------------------------------

# ==============================================================================
# 1. Base Stage
# ==============================================================================
FROM node:20-alpine AS base

# libc6-compat: Next.js SWC binary | openssl: Prisma query engine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1


# ==============================================================================
# 2. Build Dependencies (full tree, incl. devDependencies)
# ==============================================================================
FROM base AS deps

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --prefer-offline --no-audit --no-fund


# ==============================================================================
# 3. Production Dependencies
#
# Independent `npm ci --omit=dev` instead of `npm prune` off the builder.
# BuildKit runs this concurrently with the builder stage rather than waiting
# for the Next.js build to finish, and the npm cache mount makes it ~free.
# ==============================================================================
FROM base AS prod-deps

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev --prefer-offline --no-audit --no-fund


# ==============================================================================
# 4. Builder Stage
# ==============================================================================
FROM base AS builder

ENV NODE_ENV=production

# NEXT_PUBLIC_* variables are inlined at build time
ARG NEXT_PUBLIC_SITE_URL=https://dainikmanyavar.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG DATABASE_URL="file:./dainik-manyawar.db?connection_limit=1&connect_timeout=30"
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules

# Prisma client generation downloads engines — keep it in its own layer so it
# is reused whenever only application source changed.
COPY prisma ./prisma
RUN npx prisma generate

# Config + source only. public/ is deliberately excluded: `next build` does not
# read it, and copying 42MB of assets here would bust this layer on every
# image/PDF change.
COPY next.config.js tsconfig.json next-env.d.ts postcss.config.js tailwind.config.js ./
COPY src ./src

# `npm run build` also runs `prisma db push`, which is pointless here — the DB is
# a bind-mounted volume and the entrypoint pushes the schema at startup.
RUN --mount=type=cache,target=/app/.next/cache,sharing=locked \
    npx next build


# ==============================================================================
# 5. Production Runner Stage
# ==============================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3015
ENV HOSTNAME=0.0.0.0

# `prisma db seed` spawns the seed command without npm's PATH augmentation, so
# the locally-installed tsx/prisma binaries must be resolvable directly.
ENV PATH="/app/node_modules/.bin:${PATH}"

ARG NEXT_PUBLIC_SITE_URL=https://dainikmanyavar.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Runtime dependencies
COPY --chown=nextjs:nodejs package.json ./
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# `prisma generate` writes the schema-aware client and the query engine binary
# to node_modules/.prisma/client in the BUILDER stage. prod-deps only ran
# `npm ci`, so it has the stub client with no models — overlay the real one.
# @prisma/ itself is NOT copied: it is a plain dependency, so prod-deps already
# has an identical copy, and duplicating it added 115MB to the image.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Application files, ordered STABLE -> VOLATILE. Every layer after a changed one
# is re-pushed, so .next (new on every commit) must come last: otherwise a
# code-only deploy also re-uploads public/ (44MB) sitting behind it.
# public/ and prisma/ come from the build context, never via the builder stage.
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs next.config.js ./next.config.js
COPY --chown=nextjs:nodejs --chmod=755 bin/docker_entrypoint.sh /app/bin/docker_entrypoint.sh

# Runtime writable directories. Created before .next is copied; COPY merges into
# the existing directory, so .next/cache survives.
RUN mkdir -p /app/public/uploads /app/.next/cache && \
    chown nextjs:nodejs /app/public/uploads /app/.next/cache

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3015

ENTRYPOINT ["/app/bin/docker_entrypoint.sh"]

# Exec Next.js directly so signals reach Node.js
CMD ["./node_modules/.bin/next", "start", "-p", "3015"]
