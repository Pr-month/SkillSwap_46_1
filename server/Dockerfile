# ============================================
# Stage 1: Dependencies (production only)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/

RUN npm ci --omit=dev --workspace=server && npm cache clean --force

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/

RUN npm ci --workspace=server

COPY server ./server

WORKDIR /app/server
RUN npm run build

# ============================================
# Stage 3: Production runtime
# ============================================
FROM node:20-alpine AS production

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nestjs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nestjs:nodejs /app/server/package.json ./server/package.json
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

WORKDIR /app/server

USER nestjs

EXPOSE 4567

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4567/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]