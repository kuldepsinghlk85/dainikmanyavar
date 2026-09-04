# ------------------------------------------------------------------------------
# Production Multi-Stage Dockerfile for Dainik Manyavar
# Framework: Next.js 15.1.7
# React: 19
# Prisma ORM: 6.3.0 (SQLite)
# Port: 3015
# ------------------------------------------------------------------------------

# ==============================================================================
# 1. Base Stage
# ==============================================================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app


# ==============================================================================
# 2. Dependencies Stage
# ==============================================================================
FROM base AS deps

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit


# ==============================================================================
# 3. Builder Stage
# ==============================================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* variables are needed at build time
ARG NEXT_PUBLIC_SITE_URL=https://dainikmanyavar.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG DATABASE_URL="file:./dainik-manyawar.db"
ENV DATABASE_URL=$DATABASE_URL

# Copy application source
COPY . .

# npm run build executes:
# prisma generate && next build
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build


# ==============================================================================
# 4. Production Dependencies Stage
# ==============================================================================
FROM base AS prod-deps

COPY package.json package-lock.json ./

# Reuse node_modules from builder.
# This avoids running npm ci a second time.
COPY --from=builder /app/node_modules ./node_modules

# Remove development dependencies
RUN npm prune --omit=dev --no-audit


# ==============================================================================
# 5. Production Runner Stage
# ==============================================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3015
ENV HOSTNAME=0.0.0.0

# NEXT_PUBLIC_* value is embedded during build
ARG NEXT_PUBLIC_SITE_URL=https://dainikmanyavar.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL


# ==============================================================================
# Create non-root user
# ==============================================================================
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs


# ==============================================================================
# Runtime dependencies
# ==============================================================================
COPY --chown=nextjs:nodejs package.json package-lock.json ./

COPY --from=prod-deps \
    --chown=nextjs:nodejs \
    /app/node_modules \
    ./node_modules


# ==============================================================================
# Application files
# ==============================================================================
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/public \
    ./public

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next \
    ./.next

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/prisma \
    ./prisma

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/next.config.js \
    ./next.config.js


# ==============================================================================
# Runtime Entrypoint
# ==============================================================================
COPY --chown=nextjs:nodejs \
    bin/docker_entrypoint.sh \
    /app/bin/docker_entrypoint.sh

RUN chmod +x /app/bin/docker_entrypoint.sh


# ==============================================================================
# Runtime writable directories
# ==============================================================================
RUN mkdir -p \
    /app/public/uploads \
    /app/prisma \
    /app/.next/cache && \
    chown nextjs:nodejs \
    /app/public/uploads \
    /app/prisma \
    /app/.next/cache


# ==============================================================================
# Run as non-root user
# ==============================================================================
USER nextjs

EXPOSE 3015

ENTRYPOINT ["/app/bin/docker_entrypoint.sh"]

# Directly start Next.js so signals reach Node.js
CMD ["./node_modules/.bin/next", "start", "-p", "3015"]