# Multi-stage build for Zeabur deployment
# Stage 1: Dependencies and build
FROM node:22-slim AS builder

LABEL "language"="nodejs"
LABEL "framework"="next.js"

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /src

# Copy package files and pnpm config
COPY package.json pnpm-lock.yaml* .pnpmrc ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Generate Prisma client without database connection
# Use verbose flag for debugging
RUN pnpm run db:generate --verbose

# Build the application
RUN pnpm run build

# Stage 2: Production runtime
FROM node:22-slim AS runner

# Install OpenSSL for Prisma and curl for health checks
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --create-home --shell /bin/bash nextjs

WORKDIR /src

# Change ownership of work directory
RUN chown -R nextjs:nodejs /src

# Copy built application and dependencies with correct ownership
COPY --from=builder --chown=nextjs:nodejs /src/package.json ./
COPY --from=builder --chown=nextjs:nodejs /src/pnpm-lock.yaml* ./
COPY --from=builder --chown=nextjs:nodejs /src/.pnpmrc ./
COPY --from=builder --chown=nextjs:nodejs /src/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /src/public ./public
COPY --from=builder --chown=nextjs:nodejs /src/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /src/node_modules ./node_modules

# Install pnpm in runner stage
RUN npm install -g pnpm

# Switch to non-root user
USER nextjs

EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Runtime command - generate Prisma client and start
CMD ["sh", "-c", "pnpm run db:generate && pnpm run start"]