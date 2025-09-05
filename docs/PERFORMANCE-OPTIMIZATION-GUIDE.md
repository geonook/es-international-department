# Performance Optimization Guide
# KCISLK ESID Info Hub - 效能優化指南

> **Document Version**: 1.0 | **文件版本**: 1.0  
> **Last Updated**: 2025-09-03 | **最後更新**: 2025-09-03  
> **Performance Score**: 0/100 → Target: 85+/100 | **效能評分**: 0/100 → 目標: 85+/100

## 🚨 Critical Performance Issues Detected | 發現關鍵效能問題

Our comprehensive N+1 query analysis revealed **48 performance issues** including:
我們的綜合 N+1 查詢分析揭示了 **48 個效能問題**，包括：

- 🔴 **10 Critical Issues** - Require immediate attention
- 🟡 **34 Warning Issues** - Should be addressed soon  
- ℹ️ **4 Info Issues** - Monitor and optimize when possible

### Performance Impact Analysis | 效能影響分析
- **Total Query Time**: 639.81ms for 47 queries
- **Average Query Time**: 13.61ms (Target: <5ms)
- **Slow Queries**: 1 query >100ms
- **Primary Issue**: Inefficient data loading patterns causing N+1 queries

## 🎯 Priority 1: Critical N+1 Query Fixes | 優先級 1：關鍵 N+1 查詢修復

### 1. Resource Management N+1 Issues | 資源管理 N+1 問題

**❌ Current Problem (Bad)**:
```typescript
// This causes N+1 queries - DON'T DO THIS
const resources = await prisma.resource.findMany({ take: 5 })

// Each resource triggers additional queries
for (const resource of resources) {
  const creator = await prisma.user.findUnique({ where: { id: resource.createdBy } })
  const category = await prisma.resourceCategory.findUnique({ where: { id: resource.categoryId } })
  if (resource.gradeLevelId) {
    const gradeLevel = await prisma.gradeLevel.findUnique({ where: { id: resource.gradeLevelId } })
  }
}
```

**✅ Optimized Solution (Good)**:
```typescript
// Single query with includes - MUCH BETTER
const resources = await prisma.resource.findMany({
  take: 5,
  include: {
    creator: {
      select: {
        id: true,
        displayName: true,
        email: true
      }
    },
    category: {
      select: {
        id: true,
        name: true,
        description: true
      }
    },
    gradeLevel: {
      select: {
        id: true,
        name: true,
        description: true
      }
    },
    tags: {
      include: {
        tag: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    }
  }
})
```

**Performance Impact**: Reduces 19 individual queries to 1 optimized query (~95% improvement)

### 2. Event Management N+1 Issues | 活動管理 N+1 問題

**❌ Current Problem**:
```typescript
const events = await prisma.event.findMany({ take: 3 })

for (const event of events) {
  const registrations = await prisma.eventRegistration.findMany({ 
    where: { eventId: event.id }
  })
  const creator = await prisma.user.findUnique({ where: { id: event.createdBy } })
}
```

**✅ Optimized Solution**:
```typescript
const events = await prisma.event.findMany({
  take: 3,
  include: {
    creator: {
      select: {
        id: true,
        displayName: true,
        email: true
      }
    },
    registrations: {
      take: 10, // Limit to prevent excessive data loading
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    },
    _count: {
      select: {
        registrations: true // Get total count without loading all records
      }
    }
  }
})
```

### 3. User Management N+1 Issues | 用戶管理 N+1 問題

**❌ Current Problem**:
```typescript
const users = await prisma.user.findMany({ take: 5 })

for (const user of users) {
  const userRoles = await prisma.userRole.findMany({ 
    where: { userId: user.id },
    include: { role: true }
  })
  const accounts = await prisma.account.findMany({ where: { userId: user.id } })
}
```

**✅ Optimized Solution**:
```typescript
const users = await prisma.user.findMany({
  take: 5,
  include: {
    userRoles: {
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    },
    accounts: {
      select: {
        id: true,
        type: true,
        provider: true,
        providerAccountId: true
      }
    },
    _count: {
      select: {
        announcements: true,
        events: true,
        resources: true
      }
    }
  }
})
```

## 🔧 Advanced Query Optimization Techniques | 進階查詢優化技術

### 1. Selective Field Loading | 選擇性欄位加載

**Instead of loading everything**:
```typescript
// Loads ALL fields - wasteful
const users = await prisma.user.findMany()
```

**Load only what you need**:
```typescript
// Loads only required fields - efficient
const users = await prisma.user.findMany({
  select: {
    id: true,
    displayName: true,
    email: true,
    createdAt: true,
    // Don't load sensitive fields like password_hash
  }
})
```

### 2. Pagination for Large Datasets | 大數據集分頁

```typescript
// Implement cursor-based pagination for better performance
const resources = await prisma.resource.findMany({
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  include: {
    creator: {
      select: { id: true, displayName: true }
    },
    category: true,
    _count: {
      select: { tags: true }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### 3. Aggregation and Counting | 聚合和計數

```typescript
// Get counts efficiently without loading all records
const stats = await prisma.$transaction([
  prisma.user.count(),
  prisma.event.count({ where: { status: 'active' } }),
  prisma.resource.count({ where: { isPublished: true } }),
  
  // Get aggregated data
  prisma.resource.aggregate({
    _count: { id: true },
    _avg: { viewCount: true },
    where: { isPublished: true }
  })
])
```

## 📊 Caching Strategy | 緩存策略

### 1. Redis Caching Implementation | Redis 緩存實作

```typescript
// lib/cache/redis-cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }
  
  static async set(key: string, data: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(data))
  }
  
  static async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

// Usage in API routes
export async function getCachedResources() {
  const cacheKey = 'resources:published'
  
  let resources = await CacheService.get(cacheKey)
  if (!resources) {
    resources = await prisma.resource.findMany({
      where: { isPublished: true },
      include: { creator: true, category: true },
      take: 50
    })
    
    await CacheService.set(cacheKey, resources, 1800) // 30 minutes
  }
  
  return resources
}
```

### 2. Database Query Caching | 資料庫查詢緩存

```typescript
// Prisma middleware for query caching
prisma.$use(async (params, next) => {
  const cacheKey = `${params.model}_${params.action}_${JSON.stringify(params.args)}`
  
  // Only cache read operations
  if (['findMany', 'findUnique', 'findFirst'].includes(params.action)) {
    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return cached
    }
  }
  
  const result = await next(params)
  
  // Cache the result for read operations
  if (['findMany', 'findUnique', 'findFirst'].includes(params.action)) {
    await CacheService.set(cacheKey, result, 900) // 15 minutes
  }
  
  // Invalidate cache for write operations
  if (['create', 'update', 'delete', 'upsert'].includes(params.action)) {
    await CacheService.invalidate(`${params.model}_*`)
  }
  
  return result
})
```

## 📈 Database Indexing Strategy | 資料庫索引策略

### 1. Essential Indexes | 基本索引

```sql
-- Performance indexes for common queries
-- Add these to your migration files

-- User lookups by email (authentication)
CREATE INDEX idx_users_email ON users(email);

-- Resource queries by category and grade level
CREATE INDEX idx_resources_category_grade ON resources(category_id, grade_level_id);
CREATE INDEX idx_resources_published_created ON resources(is_published, created_at DESC);

-- Event queries by date and status
CREATE INDEX idx_events_date_status ON events(start_date, status);
CREATE INDEX idx_events_creator_date ON events(created_by, start_date DESC);

-- Tag relationships for resources
CREATE INDEX idx_resource_tags_resource ON resource_tag_relations(resource_id);
CREATE INDEX idx_resource_tags_tag ON resource_tag_relations(tag_id);

-- User role lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Notification queries
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 2. Composite Indexes | 複合索引

```sql
-- Composite indexes for complex queries

-- Resource search with multiple filters
CREATE INDEX idx_resources_search ON resources(is_published, category_id, grade_level_id, created_at DESC);

-- Event registration queries
CREATE INDEX idx_event_registrations_event_status ON event_registrations(event_id, status);

-- Communication queries
CREATE INDEX idx_communications_recipient_read ON communications(recipient_id, is_read, created_at DESC);
```

## ⚡ API Route Optimization | API 路由優化

### 1. Optimized Resource API | 優化的資源 API

```typescript
// app/api/resources/route.ts - OPTIMIZED VERSION
import { CacheService } from '@/lib/cache/redis-cache'
import { withOptimizations } from '@/lib/performance-middleware'

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Cap at 50
  const category = searchParams.get('category')
  const grade = searchParams.get('grade')
  
  const cacheKey = `resources:${page}:${limit}:${category}:${grade}`
  
  // Try cache first
  let cachedResult = await CacheService.get(cacheKey)
  if (cachedResult) {
    return NextResponse.json(cachedResult)
  }
  
  // Build optimized query
  const where = {
    isPublished: true,
    ...(category && { categoryId: category }),
    ...(grade && { gradeLevelId: grade })
  }
  
  const [resources, totalCount] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        gradeLevel: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            tags: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    }),
    
    prisma.resource.count({ where })
  ])
  
  const result = {
    resources,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    }
  }
  
  // Cache for 10 minutes
  await CacheService.set(cacheKey, result, 600)
  
  return NextResponse.json(result)
}

// Apply all optimizations
export const GET = withOptimizations(handler, {
  enableCaching: true,
  enableRateLimit: true,
  cacheConfig: {
    ttl: 600, // 10 minutes
    shouldCache: (req, res) => res.status === 200
  },
  rateLimitConfig: {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  }
})
```

## 🛠️ Implementation Plan | 實施計劃

### Phase 1: Critical Fixes (Day 1-2) | 第一階段：關鍵修復
1. ✅ Fix top 10 N+1 query issues in resource, event, and user management
2. ✅ Add essential database indexes
3. ✅ Implement basic caching for frequently accessed data

### Phase 2: Advanced Optimization (Day 3-4) | 第二階段：進階優化
1. 🔄 Implement Redis caching layer
2. 🔄 Add query performance monitoring
3. 🔄 Optimize API response pagination

### Phase 3: Monitoring and Maintenance (Day 5-6) | 第三階段：監控與維護
1. 📊 Set up performance monitoring dashboard
2. 📊 Create automated performance regression tests
3. 📊 Document optimization patterns for team

## 📊 Performance Monitoring Scripts | 效能監控腳本

### Running Performance Analysis | 運行效能分析

```bash
# Run N+1 query detection
npm run db:n-plus-one

# Run comprehensive performance analysis  
npm run test:performance

# Generate performance report
npm run report:performance

# Database health check
npm run db:health
```

### Setting Performance Targets | 設定效能目標

| Metric | Current | Target | Priority |
|--------|---------|---------|----------|
| Average Query Time | 13.61ms | <5ms | High |
| API Response Time | Variable | <200ms | High |
| Database Connections | 1 | Monitor | Medium |
| Cache Hit Rate | 0% | >80% | High |
| Page Load Time | Unknown | <2s | High |

## 🎯 Success Metrics | 成功指標

After implementing these optimizations, we expect:

- ✅ **Performance Score**: 0/100 → 85+/100
- ✅ **Query Time Reduction**: 95% improvement for resource loading
- ✅ **API Response Time**: <200ms for 95% of requests
- ✅ **Database Load**: 90% reduction in query count
- ✅ **User Experience**: Significant improvement in page load times

## 🚀 Next Steps | 下一步

1. **Immediate Actions**:
   - Implement the optimized query patterns shown above
   - Add database indexes using migration files
   - Set up basic caching for critical API endpoints

2. **Monitoring**:
   - Run performance analysis weekly
   - Monitor query performance in production
   - Set up alerts for performance regressions

3. **Continuous Improvement**:
   - Regular code reviews for query patterns
   - Performance testing in CI/CD pipeline
   - Team training on optimization best practices

---

*This guide is based on actual performance analysis data from the KCISLK ESID Info Hub application. Update regularly based on monitoring results.*  
*本指南基於 KCISLK ESID Info Hub 應用程式的實際效能分析數據。請根據監控結果定期更新。*