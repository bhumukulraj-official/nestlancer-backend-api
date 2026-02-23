# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY gateway/package.json ./gateway/
COPY libs/ ./libs/
COPY prisma/ ./prisma/

RUN pnpm install --frozen-lockfile --prod=false

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/libs ./libs
COPY --from=deps /app/gateway ./gateway
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/turbo.json ./
COPY --from=deps /app/package.json ./

COPY gateway/ ./gateway/
COPY libs/ ./libs/
COPY tsconfig.base.json ./

RUN pnpm prisma generate
RUN pnpm turbo build --filter=@nestlancer/gateway

# ── Stage 3: Production ──
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

RUN addgroup --system --gid 1001 nestlancer && \
    adduser --system --uid 1001 nestlancer

COPY --from=builder --chown=nestlancer:nestlancer /app/gateway/dist ./dist
COPY --from=builder --chown=nestlancer:nestlancer /app/node_modules ./node_modules
COPY --from=builder --chown=nestlancer:nestlancer /app/prisma ./prisma

USER nestlancer

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health/live || exit 1

CMD ["dumb-init", "node", "dist/main.js"]
