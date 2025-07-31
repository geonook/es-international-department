# ES International Department - Optimized Dockerfile for Zeabur
# 基於 Zeabur 建議的優化版本

# Base image with pnpm
FROM node:22-slim AS base
LABEL "language"="nodejs"
LABEL "framework"="next.js"
LABEL "project"="es-international-department"

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies needed for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /src

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
FROM base AS builder
WORKDIR /src

# Copy dependencies from deps stage
COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/package.json ./package.json

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm run db:generate

# Build Next.js application
RUN pnpm run build

# Stage 3: Production runtime
FROM node:22-slim AS runner
WORKDIR /src

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /src/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /src/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /src/public ./public

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /src/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /src/package.json ./package.json

# Copy generated Prisma client
COPY --from=builder --chown=nextjs:nodejs /src/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /src/node_modules/@prisma ./node_modules/@prisma

# Switch to non-root user
USER nextjs

# Expose port (Zeabur uses 8080)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start command: Generate Prisma client and start server
CMD ["sh", "-c", "pnpm run db:generate && node server.js"]