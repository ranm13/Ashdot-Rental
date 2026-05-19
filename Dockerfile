# ==========================================
# Stage 1: Build the Vite React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY public/ ./public/
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
RUN npm run build

# ==========================================
# Stage 2: Build the Node.js Express Backend
# ==========================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/prisma/ ./prisma/
RUN npx prisma generate

# ==========================================
# Stage 3: Monolithic Production Runner
# ==========================================
FROM node:20-alpine
RUN apk add --no-cache openssl sqlite

WORKDIR /app/server

# Copy backend files and built dependencies
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY server/package*.json ./
COPY server/src/ ./src/
COPY server/prisma/ ./prisma/
COPY server/tsconfig.json ./

# Inject frontend static assets into the backend static serving folder
COPY --from=frontend-builder /app/dist ./public

# Setup persistent volume mount folder
RUN mkdir -p /data

# Write container startup entrypoint hook script
RUN echo '#!/bin/sh' > ./entrypoint.sh && \
    echo 'echo "Executing production database migrations..."' >> ./entrypoint.sh && \
    echo 'npx prisma migrate deploy' >> ./entrypoint.sh && \
    echo 'echo "Starting Express monolithic application server..."' >> ./entrypoint.sh && \
    echo 'exec npm start' >> ./entrypoint.sh && \
    chmod +x ./entrypoint.sh

# Environment settings
ENV DATABASE_URL="file:/data/production.db"
ENV PORT=3000

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
