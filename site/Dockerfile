# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY site/package.json ./site/

RUN npm ci --workspace=site

COPY site ./site

WORKDIR /app/site
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ============================================
# Stage 2: Caddy
# ============================================
FROM caddy:2-alpine AS production

COPY site/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/site/dist /srv

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]