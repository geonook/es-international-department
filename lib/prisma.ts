/**
 * Prisma Client Configuration for Zeabur Multi-Environment Deployment
 * KCISLK ESID Info Hub - Zeabur 多環境雲端資料庫配置
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Performance optimizations
  errorFormat: 'minimal',
  transactionOptions: {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
    isolationLevel: 'ReadCommitted'
  }
})

// 開發環境防止熱重載時重複建立連接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * 環境檢查與資料庫連接驗證
 * Environment check and database connection validation
 */
export async function validateDatabaseConnection() {
  try {
    const startTime = performance.now()
    await prisma.$connect()
    const connectionTime = performance.now() - startTime
    
    // 記錄當前環境與資料庫連接狀態
    const environment = process.env.NODE_ENV || 'development'
    const dbUrl = process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'Not configured'
    
    console.log(`✅ Database connected successfully (${connectionTime.toFixed(2)}ms)`)
    console.log(`🌍 Environment: ${environment}`)
    console.log(`🗄️  Database: ${dbUrl}`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * 執行資料庫健康檢查
 * Perform database health check with performance metrics
 */
export async function performHealthCheck() {
  const startTime = performance.now()
  
  try {
    // Test basic query performance
    const [userCount, eventCount, resourceCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.resource.count()
    ])
    
    const queryTime = performance.now() - startTime
    
    const healthData = {
      status: 'healthy',
      connectionTime: queryTime,
      counts: {
        users: userCount,
        events: eventCount,
        resources: resourceCount
      },
      timestamp: new Date().toISOString()
    }
    
    // Alert if queries are slow
    if (queryTime > 100) {
      console.warn(`⚠️ Database health check slow: ${queryTime.toFixed(2)}ms`)
    }
    
    return healthData
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Query performance monitoring middleware
 * 查詢效能監控中間件
 */
export function setupQueryMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    prisma.$use(async (params, next) => {
      const before = performance.now()
      const result = await next(params)
      const after = performance.now()
      const duration = after - before
      
      // Log slow queries (>50ms)
      if (duration > 50) {
        console.warn(
          `🐌 Slow Query: ${params.model}.${params.action} took ${duration.toFixed(2)}ms`
        )
      }
      
      // Log very slow queries (>200ms) with details
      if (duration > 200) {
        console.error(
          `🚨 Very Slow Query: ${params.model}.${params.action}`,
          `Duration: ${duration.toFixed(2)}ms`,
          `Args:`, params.args
        )
      }
      
      return result
    })
  }
}

/**
 * 優雅地關閉資料庫連接
 * Gracefully disconnect from the database
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// 程序結束時自動關閉連接
process.on('beforeExit', async () => {
  await disconnectDatabase()
})

// Initialize query monitoring in development
if (process.env.NODE_ENV === 'development') {
  setupQueryMonitoring()
}

// Connection pool optimization
if (process.env.NODE_ENV === 'production') {
  // Warm up the connection pool
  prisma.$connect().catch(console.error)
}

export default prisma