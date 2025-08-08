/**
 * Build-Safe Prisma Client Wrapper
 * 構建安全的 Prisma Client 包裝器
 * 
 * 在構建時期提供安全的佔位符，避免資料庫連接錯誤
 * Provides safe placeholders during build time to avoid database connection errors
 */

import type { PrismaClient } from '@prisma/client'

/**
 * 檢查是否為構建時期
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
 * 構建時的安全 Prisma 佔位符
 * Build-time safe Prisma placeholder
 */
const buildTimePrisma = {
  // 所有常用的資料表查詢方法
  user: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.reject(new Error('Database operations not available during build')),
    update: () => Promise.reject(new Error('Database operations not available during build')),
    delete: () => Promise.reject(new Error('Database operations not available during build')),
  },
  event: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.reject(new Error('Database operations not available during build')),
    update: () => Promise.reject(new Error('Database operations not available during build')),
    delete: () => Promise.reject(new Error('Database operations not available during build')),
  },
  resource: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.reject(new Error('Database operations not available during build')),
    update: () => Promise.reject(new Error('Database operations not available during build')),
    delete: () => Promise.reject(new Error('Database operations not available during build')),
  },
  announcement: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.reject(new Error('Database operations not available during build')),
    update: () => Promise.reject(new Error('Database operations not available during build')),
    delete: () => Promise.reject(new Error('Database operations not available during build')),
  },
  notification: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.reject(new Error('Database operations not available during build')),
    update: () => Promise.reject(new Error('Database operations not available during build')),
    delete: () => Promise.reject(new Error('Database operations not available during build')),
  },
  // 其他常用方法
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $transaction: () => Promise.reject(new Error('Transactions not available during build')),
  $executeRaw: () => Promise.reject(new Error('Raw queries not available during build')),
  $queryRaw: () => Promise.reject(new Error('Raw queries not available during build')),
} as any

/**
 * 獲取安全的 Prisma 實例
 * Get safe Prisma instance
 */
export function getSafePrisma(): PrismaClient {
  if (isBuildTime()) {
    console.log('🔧 Build time detected - returning safe Prisma placeholder')
    return buildTimePrisma
  }
  
  // 動態導入實際的 Prisma 實例（僅在運行時）
  const { prisma } = require('@/lib/prisma')
  return prisma
}

/**
 * 用於 API 路由的 Prisma 實例
 * Prisma instance for API routes
 */
export const prisma = getSafePrisma()

export default prisma