# Technology Stack & Architecture Recommendations
*ES 國際部技術棧與架構建議*

## 資料庫技術選型 | Database Technology Selection

### 主要推薦：PostgreSQL
**優勢 | Advantages:**
- 強大的 JSON/JSONB 支援，適合彈性資料結構
- 優秀的全文搜索功能
- 強大的索引和查詢優化能力
- 符合 ACID 特性，資料一致性保證
- 豐富的資料類型支援（UUID、Array、日期時間等）
- 良好的 Next.js 生態整合

**適用場景:**
- 複雜的關聯查詢需求
- 需要進階搜索功能
- 高資料完整性要求
- 支援大量並發讀寫

### 替代方案：MySQL 8.0+
**優勢 | Advantages:**
- 廣泛的社群支援和資源
- 優秀的效能表現
- JSON 欄位支援
- 成熟的備份和恢復工具

**適用場景:**
- 團隊對 MySQL 較為熟悉
- 現有基礎設施已使用 MySQL
- 注重運維成本控制

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

### 整體架構 | Overall Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React Components │  │ - API Routes    │    │ - Prisma Schema │
│ - State Management │  │ - Authentication│    │ - Indexes       │
│ - UI/UX           │  │ - Business Logic│    │ - Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Cache Layer   │    │   File Storage  │
│   (Vercel CDN)  │    │   (Redis)       │    │   (AWS S3/      │
│                 │    │                 │    │    Vercel Blob) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 資料層架構 | Data Layer Architecture

#### 1. 資料庫連接管理
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
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

### Vercel 部署 (推薦)
```yaml
# vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "REDIS_URL": "@redis-url"
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "1"
    }
  }
}
```

### Docker 部署 (替代方案)
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
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

此技術棧建議提供了一個完整的、可擴展的、現代化的解決方案，適合 ES International Department 系統的需求：

**核心優勢:**
1. **型別安全**: 全棧 TypeScript 支援
2. **高效能**: 多層次快取策略
3. **可擴展**: 模組化架構設計
4. **安全性**: 完整的身份驗證和授權
5. **維護性**: 清晰的代碼結構和文檔

**實作優先級:**
1. 設定 PostgreSQL + Prisma 基礎架構
2. 實作使用者驗證系統
3. 建立 API 端點和資料存取層
4. 整合前端組件與後端 API
5. 添加快取和效能優化
6. 部署和監控設定

這個技術架構將為 ES International Department 提供一個穩定、高效、易於維護的現代化平台。