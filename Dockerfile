# Multi-stage build for Zeabur deployment
# Stage 1: Dependencies and build
FROM node:22-slim AS builder

LABEL "language"="nodejs"
LABEL "framework"="next.js"

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /src

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Generate Prisma client without database connection
RUN pnpm run db:generate

# Build the application
RUN pnpm run build

# Stage 2: Production runtime
FROM node:22-slim AS runner

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /src

# Copy built application and dependencies
COPY --from=builder /src/package.json ./
COPY --from=builder /src/pnpm-lock.yaml* ./
COPY --from=builder /src/.next ./.next
COPY --from=builder /src/public ./public
COPY --from=builder /src/prisma ./prisma
COPY --from=builder /src/node_modules ./node_modules

# Install pnpm in runner stage
RUN npm install -g pnpm

EXPOSE 8080

# Runtime command - generate Prisma client and start
CMD ["sh", "-c", "pnpm run db:generate && pnpm run start"]