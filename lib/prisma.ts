/**
 * Prisma Client Configuration for Zeabur Multi-Environment Deployment
 * KCISLK ESID Info Hub - Zeabur Multi-Environment Cloud Database Configuration
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Check if it's build time
 * Check if it's build time
 */
function isBuildTime(): boolean {
  return process.env.NODE_ENV !== 'test' && (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build' ||
    process.argv.includes('build') ||
    process.env.CI === 'true'
  )
}

/**
 * Get safe database URL for build time
 * Get safe database URL for build time
 */
function getSafeDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  
  // During build time, if DATABASE_URL is missing or placeholder, provide valid default
  if (isBuildTime() && (!dbUrl || dbUrl.includes('placeholder'))) {
    console.log('🔧 Build time detected - using placeholder database URL for Prisma')
    return 'postgresql://build:build@localhost:5432/build'
  }
  
  return dbUrl || 'postgresql://localhost:5432/default'
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getSafeDatabaseUrl()
    }
  },
  // ENHANCED Performance optimizations for N+1 query prevention
  errorFormat: 'minimal',
  transactionOptions: {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
    isolationLevel: 'ReadCommitted'
  },
  // Connection pool optimization
  __internal: {
    engine: {
      // Optimize connection pool for performance
      connectionTimeout: 2000,
      poolTimeout: 10000,
      maxConnections: 20, // Increase connection pool size
      minConnections: 2   // Maintain minimum connections
    }
  }
})

// Prevent duplicate connections during hot reload in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Environment check and database connection validation
 * Environment check and database connection validation
 */
export async function validateDatabaseConnection() {
  try {
    const startTime = performance.now()
    await prisma.$connect()
    const connectionTime = performance.now() - startTime
    
    // Log current environment and database connection status
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
 * Perform database health check with performance metrics
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
 * ENHANCED Query performance monitoring middleware with N+1 detection
 * Query performance monitoring middleware
 */
export function setupQueryMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    let queryCount = 0
    let requestQueries: Array<{model: string, action: string, duration: number}> = []
    
    prisma.$use(async (params, next) => {
      const before = performance.now()
      const result = await next(params)
      const after = performance.now()
      const duration = after - before
      
      queryCount++
      requestQueries.push({
        model: params.model || 'unknown',
        action: params.action,
        duration
      })
      
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
      
      // N+1 Query Detection: Check for multiple queries of same type
      const recentSimilarQueries = requestQueries
        .slice(-10) // Check last 10 queries
        .filter(q => q.model === params.model && q.action === params.action)
      
      if (recentSimilarQueries.length >= 5) {
        console.warn(
          `⚠️ Potential N+1 Query Pattern: ${params.model}.${params.action}`,
          `Detected ${recentSimilarQueries.length} similar queries recently`
        )
      }
      
      // Reset query tracking periodically
      if (queryCount % 100 === 0) {
        requestQueries = []
        queryCount = 0
      }
      
      return result
    })
  }
}

/**
 * Gracefully disconnect from the database
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

// Automatically disconnect on program exit
process.on('beforeExit', async () => {
  await disconnectDatabase()
})

// Initialize enhanced query monitoring in development
if (process.env.NODE_ENV === 'development') {
  setupQueryMonitoring()
}

// ENHANCED Connection pool optimization with prewarming
if (process.env.NODE_ENV === 'production' && !isBuildTime()) {
  // Warm up the connection pool with multiple connections
  Promise.allSettled([
    prisma.$connect(),
    // Pre-warm with a simple query to establish connections
    prisma.user.findFirst({ select: { id: true } }).catch(() => null)
  ]).catch(console.error)
}

/**
 * Optimized batch query helper to prevent N+1 queries
 */
export async function batchQuery<T>(
  queries: Promise<T>[],
  batchSize: number = 10
): Promise<T[]> {
  const results: T[] = []
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(batch)
    
    results.push(...batchResults.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error('Batch query failed:', result.reason)
        throw result.reason
      }
    }))
  }
  
  return results
}

/**
 * Query optimization helpers for common patterns
 */
export const OptimizedQueries = {
  /**
   * Get user with roles (optimized for performance)
   */
  async getUserWithRoles(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    })
  },

  /**
   * Get users list with pagination and roles (optimized)
   */
  async getUsersList({
    page = 1,
    limit = 20,
    search,
    role
  }: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) {
    const where: any = {}
    
    if (role && role !== 'all') {
      where.userRoles = {
        some: {
          role: {
            name: role
          }
        }
      }
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const skip = (page - 1) * limit
    
    return await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
  }
}

export default prisma