# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NEXT_TELEMETRY_DISABLED=1

# ---- Install dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Build the application ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
    # public/ is copied explicitly in the final stage, so drop the traced copy.
    && rm -rf .next/standalone/public

# ---- Run the application ----
FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    # Edited content, uploaded images and their backups live in /app/data.
    # Mount a volume there so they survive redeploys.
    CONTENT_FILE=/app/data/site-content.json \
    UPLOAD_DIR=/app/data/uploads \
    MEDIA_BACKUP_DIR=/app/data/media-backups

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
    && mkdir -p /app/data \
    && chown nextjs:nodejs /app /app/data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

VOLUME ["/app/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO /dev/null http://127.0.0.1:${PORT}/api/auth/session || exit 1

CMD ["node", "server.js"]
