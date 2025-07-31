# Technology Stack & Architecture Recommendations for Zeabur Deployment
*ES 國際部技術棧與架構建議 - Zeabur 雲端部署專用*

## ☁️ Zeabur 雲端架構概述 | Zeabur Cloud Architecture Overview

ES International Department 採用 **Zeabur 雲端平台**進行部署，實現多環境隔離與自動化部署流程。

### 🏗️ 多環境架構設計
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│   開發環境       │    │    預備環境      │    │    正式環境      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Zeabur Dev DB   │    │ Zeabur Stage DB │    │ Zeabur Prod DB  │
│ 開發測試資料庫   │    │ 預備測試資料庫   │    │ 正式營運資料庫   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Zeabur Cloud Platform 雲端平台                     │
│  • 自動部署 Auto Deployment                                     │
│  • 環境隔離 Environment Isolation                               │
│  • 資料庫備份 Database Backup                                   │
│  • 監控告警 Monitoring & Alerts                                │
└─────────────────────────────────────────────────────────────────┘
```

## 資料庫技術選型 | Database Technology Selection

### ✅ Zeabur PostgreSQL（已選定）
**優勢 | Advantages:**
- **雲端託管**: Zeabur 提供完全託管的 PostgreSQL 服務
- **多環境支援**: 可輕鬆建立 development、staging、production 三套獨立資料庫
- **自動備份**: Zeabur 平台提供自動備份與災難恢復
- **擴展性**: 根據需求調整資料庫規格
- **安全性**: 內建 SSL/TLS 加密與存取控制
- **強大的 JSON/JSONB 支援**，適合彈性資料結構
- **優秀的全文搜索功能**
- **符合 ACID 特性**，資料一致性保證
- **豐富的資料類型支援**（UUID、Array、日期時間等）
- **良好的 Next.js 生態整合**

**Zeabur 特定優勢:**
- 一鍵部署與環境切換
- 與 Zeabur 部署平台完美整合
- 自動化的資料庫維護與監控
- 按需求彈性計費

## ORM 框架建議 | ORM Framework Recommendation

### 主要推薦：Prisma
**選擇理由 | Why Prisma:**
```typescript
// 型別安全的查詢
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      include: {
        role: true
      }
    },
    announcements: {
      where: {
        status: 'published'
      }
    }
  }
})
```

**優勢:**
- **型別安全**: 完整的 TypeScript 支援
- **自動遷移**: 資料庫結構變更管理
- **查詢優化**: 自動產生最佳化 SQL
- **開發體驗**: 優秀的開發工具和文檔
- **Next.js 整合**: 原生支援 Next.js 架構

**核心功能:**
- 資料建模 (Schema Definition)
- 資料庫遷移 (Migration)
- 查詢產生器 (Query Builder)
- 關聯查詢優化
- 即時型別產生

## 應用架構設計 | Application Architecture

### Zeabur 整體架構 | Zeabur Overall Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│ (Zeabur PostgreSQL)│
│                 │    │                 │    │                 │
│ - React Components │  │ - API Routes    │    │ - Prisma Schema │
│ - State Management │  │ - Authentication│    │ - Multi-Environment │
│ - UI/UX           │  │ - Business Logic│    │ - Auto Backup   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Cache Layer   │    │   File Storage  │
│   (Zeabur CDN)  │    │ (Optional Redis)│    │   (Vercel Blob/ │
│                 │    │                 │    │    Zeabur Files)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                    │
                                    ▼
                         ┌─────────────────┐
                         │ Zeabur Platform │
                         │ 部署與監控平台   │
                         │                 │
                         │ - Auto Deploy   │
                         │ - Environment   │
                         │   Management    │
                         │ - Monitoring    │
                         │ - Logs          │
                         └─────────────────┘
```

### 🚀 Zeabur 部署流程 | Zeabur Deployment Flow
```
GitHub Repository          Zeabur Platform            Database
      │                          │                        │
   ┌──▼──┐                 ┌─────▼─────┐          ┌──────▼──────┐
   │ Push│                 │   Auto    │          │   Prisma    │
   │  to │    ───────►     │  Deploy   │ ───────► │ Migrations  │
   │Branch│                │  Trigger  │          │   & Seed    │
   └─────┘                 └───────────┘          └─────────────┘
      │                          │                        │
      │ dev branch ──────────────┼────► Development DB    │
      │ staging branch ──────────┼────► Staging DB        │
      │ main branch ─────────────┼────► Production DB     │
      │                          │                        │
      ▼                          ▼                        ▼
┌─────────────┐          ┌──────────────┐       ┌────────────────┐
│   GitHub    │          │   Zeabur     │       │   Multi-Env    │
│ Integration │          │   Console    │       │   Databases    │
└─────────────┘          └──────────────┘       └────────────────┘
```

### 資料層架構 | Data Layer Architecture

#### 1. Zeabur 資料庫連接管理
```typescript
// lib/prisma.ts - Zeabur Multi-Environment Configuration
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Zeabur 資料庫連接字串
    }
  }
})

// 開發環境防止熱重載時重複建立連接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 環境檢查與資料庫連接驗證
export async function validateDatabaseConnection() {
  try {
    await prisma.$connect()
    
    const environment = process.env.NODE_ENV || 'development'
    const dbUrl = process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'Not configured'
    
    console.log(`✅ Zeabur Database connected successfully`)
    console.log(`🌍 Environment: ${environment}`)
    console.log(`🗄️  Database: ${dbUrl}`)
    
    return true
  } catch (error) {
    console.error('❌ Zeabur Database connection failed:', error)
    return false
  }
}
```

#### 2. 資料存取層 (Data Access Layer)
```typescript
// lib/dal/users.ts
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class UserDAL {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
  }
}
```

#### 3. 服務層 (Service Layer)
```typescript
// lib/services/userService.ts
import { UserDAL } from '@/lib/dal/users'
import bcrypt from 'bcryptjs'

export class UserService {
  static async authenticateUser(email: string, password: string) {
    const user = await UserDAL.findByEmail(email)
    
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles.map(ur => ur.role.name)
    }
  }
}
```

## 快取策略 | Caching Strategy

### Redis 快取架構
```typescript
// lib/cache/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class CacheService {
  // 使用者會話快取
  static async setUserSession(sessionToken: string, userData: any, ttl = 3600) {
    await redis.setex(`session:${sessionToken}`, ttl, JSON.stringify(userData))
  }

  // 內容快取
  static async cacheAnnouncements(key: string, data: any, ttl = 300) {
    await redis.setex(`announcements:${key}`, ttl, JSON.stringify(data))
  }

  // 資源快取
  static async cacheResources(gradeLevel: string, category: string, data: any) {
    const key = `resources:${gradeLevel}:${category}`
    await redis.setex(key, 600, JSON.stringify(data))
  }
}
```

### Next.js 快取策略
```typescript
// app/api/announcements/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const audience = searchParams.get('audience') || 'all'

  const announcements = await prisma.announcement.findMany({
    where: {
      status: 'published',
      targetAudience: audience === 'all' ? undefined : audience,
      publishedAt: {
        lte: new Date()
      }
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })

  return NextResponse.json(announcements, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

## 身份驗證與授權 | Authentication & Authorization

### JWT 身份驗證架構
```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

export class AuthService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  }

  static async checkPermission(userId: string, permission: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) return false

    return user.userRoles.some(userRole => {
      const permissions = userRole.role.permissions as string[]
      return permissions?.includes(permission) || permissions?.includes('*')
    })
  }
}
```

### 中介軟體 (Middleware)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/jwt'

export function middleware(request: NextRequest) {
  // 管理員路由保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = AuthService.verifyToken(token)
      if (!payload.roles.includes('admin')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/teachers/:path*']
}
```

## 檔案存儲方案 | File Storage Solutions

### Vercel Blob (推薦)
```typescript
// lib/storage/vercel-blob.ts
import { put, del } from '@vercel/blob'

export class FileStorageService {
  static async uploadFile(file: File, path: string) {
    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: true
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size
    }
  }

  static async deleteFile(url: string) {
    await del(url)
  }
}
```

### AWS S3 (替代方案)
```typescript
// lib/storage/aws-s3.ts
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

export class S3StorageService {
  static async uploadFile(file: Buffer, key: string, contentType: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read'
    }

    const result = await s3.upload(params).promise()
    return result.Location
  }
}
```

## 效能優化建議 | Performance Optimization

### 1. 資料庫查詢優化
```sql
-- 建立複合索引提高查詢效能
CREATE INDEX idx_announcements_status_audience_published 
ON announcements(status, target_audience, published_at DESC);

CREATE INDEX idx_resources_grade_category_status 
ON resources(grade_level_id, category_id, status);

CREATE INDEX idx_notifications_recipient_read_created 
ON notifications(recipient_id, is_read, created_at DESC);
```

### 2. React 查詢優化
```typescript
// hooks/useAnnouncements.ts
import { useQuery } from '@tanstack/react-query'

export function useAnnouncements(audience: string = 'all') {
  return useQuery({
    queryKey: ['announcements', audience],
    queryFn: async () => {
      const response = await fetch(`/api/announcements?audience=${audience}`)
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5分鐘
    cacheTime: 10 * 60 * 1000, // 10分鐘
  })
}
```

### 3. 圖片優化
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export function OptimizedImage({ src, alt, width, height, priority = false }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      style={{
        objectFit: 'cover',
        borderRadius: '8px'
      }}
    />
  )
}
```

## 部署架構建議 | Deployment Architecture

### 🚀 Zeabur 部署 (主要推薦)
```yaml
# zeabur.yaml - Zeabur 部署配置檔
name: es-international-department
services:
  - name: web
    source:
      type: git
      url: https://github.com/your-username/es-international-department
    build:
      commands:
        - npm install
        - npm run db:generate
        - npm run build
    start:
      command: npm run zeabur:start
    env:
      NODE_ENV: ${ZEABUR_ENVIRONMENT}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    port: 3000
    
  - name: database
    source:
      type: postgresql
    version: "15"
    plan: starter  # 可調整為 pro 或 team
```

### 🔧 Zeabur 環境配置
```bash
# Development Environment (開發環境)
ZEABUR_ENVIRONMENT=development
DATABASE_URL=postgresql://dev_user:password@dev-db.zeabur.com:5432/es_international_dev

# Staging Environment (預備環境)
ZEABUR_ENVIRONMENT=staging  
DATABASE_URL=postgresql://stage_user:password@stage-db.zeabur.com:5432/es_international_staging

# Production Environment (正式環境)
ZEABUR_ENVIRONMENT=production
DATABASE_URL=postgresql://prod_user:password@prod-db.zeabur.com:5432/es_international_prod
```

### 📋 Zeabur 部署腳本配置
```json
// package.json - Zeabur 專用腳本
{
  "scripts": {
    "zeabur:build": "npm run db:generate && npm run build",
    "zeabur:start": "npm run start",
    "zeabur:deploy:dev": "npm run db:migrate:deploy && npm run db:seed",
    "zeabur:deploy:staging": "NODE_ENV=staging npm run db:migrate:deploy",
    "zeabur:deploy:production": "NODE_ENV=production npm run db:migrate:deploy"
  }
}
```

### 🔄 自動部署工作流程
```yaml
# Zeabur 自動部署觸發器配置
triggers:
  - branch: dev
    environment: development
    auto_deploy: true
    commands:
      - npm run zeabur:deploy:dev
      
  - branch: staging  
    environment: staging
    auto_deploy: true
    commands:
      - npm run zeabur:deploy:staging
      
  - branch: main
    environment: production
    auto_deploy: false  # 手動部署確保安全
    commands:
      - npm run zeabur:deploy:production
```

### 🐳 Docker 部署 (主要推薦)
```dockerfile
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
```

## 監控與日誌 | Monitoring & Logging

### 應用監控
```typescript
// lib/monitoring/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'esid-portal' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export { logger }
```

### 效能監控
```typescript
// lib/monitoring/metrics.ts
export class MetricsService {
  static async trackUserAction(userId: string, action: string, metadata?: any) {
    // 發送到分析服務
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        metadata,
        timestamp: new Date().toISOString()
      })
    })
  }

  static async trackPageView(path: string, userId?: string) {
    // 頁面瀏覽追蹤
    console.log(`Page view: ${path}`, { userId })
  }
}
```

## 安全性實作 | Security Implementation

### 資料驗證
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  targetAudience: z.enum(['teachers', 'parents', 'all']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  expiresAt: z.date().optional()
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
```

### CSRF 保護
```typescript
// lib/security/csrf.ts
import { randomBytes } from 'crypto'

export class CSRFService {
  static generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  static validateToken(token: string, sessionToken: string): boolean {
    // 實作 CSRF token 驗證邏輯
    return token === sessionToken
  }
}
```

## 環境配置 | Environment Configuration

### 環境變數設定
```bash
# .env.local
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/esid_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cache
REDIS_URL="redis://localhost:6379"

# File Storage
VERCEL_BLOB_READ_WRITE_TOKEN="your-blob-token"

# AWS S3 (if using)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET="esid-files"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## 總結 | Summary

此技術棧建議提供了一個完整的、雲端原生的、現代化的解決方案，專為 ES International Department 系統在 **Zeabur 平台**上的部署需求設計：

### 🌟 核心優勢 | Core Advantages
1. **☁️ 雲端原生**: 完整的 Zeabur 平台整合，多環境自動化部署
2. **🔒 型別安全**: 全棧 TypeScript 支援，從前端到資料庫
3. **⚡ 高效能**: Zeabur CDN + 多層次快取策略
4. **🚀 可擴展**: 雲端彈性擴展 + 模組化架構設計
5. **🛡️ 安全性**: 完整的身份驗證、授權與資料保護
6. **🔧 維護性**: 清晰的代碼結構、自動化部署與監控
7. **💰 成本效益**: Zeabur 按需計費，優化資源使用

### 📋 Zeabur 實作優先級 | Zeabur Implementation Priority
1. **🗄️ 設定 Zeabur PostgreSQL 多環境資料庫**
   - 建立 development、staging、production 三套獨立資料庫
   - 配置 Prisma 連接與遷移策略

2. **🔐 實作使用者驗證系統**
   - JWT 身份驗證整合
   - 多角色權限控制 (admin、teacher、parent)

3. **🛠️ 建立 API 端點和資料存取層**
   - Next.js API Routes 實作
   - Prisma DAL 與服務層架構

4. **🎨 整合前端組件與後端 API**
   - React 組件與 shadcn/ui 整合
   - 狀態管理與 API 串接

5. **⚡ 添加快取和效能優化**
   - Redis 快取策略（可選）
   - 資料庫查詢優化與索引設計

6. **🚀 Zeabur 部署和監控設定**
   - 自動化部署流程配置
   - 監控、日誌與告警系統

### 🎯 Zeabur 專用特色 | Zeabur-Specific Features
- **🔄 自動部署**: GitHub 分支對應環境自動部署
- **🗄️ 資料庫管理**: 完全託管的 PostgreSQL 服務
- **📊 監控整合**: 內建應用效能監控與日誌管理
- **🌍 全球 CDN**: 自動靜態資源分發優化
- **🔧 環境管理**: 簡化的多環境配置與切換

### 🚀 部署就緒 | Deployment Ready
這個 Zeabur 優化的技術架構將為 ES International Department 提供：

✅ **穩定可靠**的雲端原生平台  
✅ **高效能**的多環境部署策略  
✅ **易於維護**的現代化開發體驗  
✅ **安全合規**的資料管理機制  
✅ **成本優化**的雲端資源使用  

**🎉 立即開始使用 Zeabur 部署您的 ES International Department 系統！**