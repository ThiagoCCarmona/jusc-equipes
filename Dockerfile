# ==============================================================================
# Stage 1: Build Frontend (Vite + React + TailwindCSS)
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Build Backend Server (TypeScript + Express + SQLite)
# ==============================================================================
FROM node:20-bookworm-slim AS server-builder
WORKDIR /app/server

# Install build dependencies for native sqlite compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ==============================================================================
# Stage 3: Production Runner
# ==============================================================================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data
ENV DB_PATH=/app/data/jusc.db
ENV STATIC_PATH=/app/public
ENV DOMAIN=jusctrabalho.tccodes.com.br

# Install SQLite runtime & build dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install only production dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --only=production \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./dist

# Copy compiled frontend to public folder for static serving
COPY --from=frontend-builder /app/dist ./public

# Prepare persistent data volume
RUN mkdir -p /app/data

VOLUME ["/app/data"]

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });" || exit 1

CMD ["node", "dist/index.js"]
