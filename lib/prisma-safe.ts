/**
 * Build-Safe Prisma Client Wrapper
 * Build-Safe Prisma Client Wrapper
 * 
 * Provides safe placeholders during build time to avoid database connection errors
 * Provides safe placeholders during build time to avoid database connection errors
 */

import type { PrismaClient } from '@prisma/client'

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
 * Build-time safe Prisma placeholder
 * Build-time safe Prisma placeholder
 */
const buildTimePrisma = {
  // Common database table query methods
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
  // Other common methods
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $transaction: () => Promise.reject(new Error('Transactions not available during build')),
  $executeRaw: () => Promise.reject(new Error('Raw queries not available during build')),
  $queryRaw: () => Promise.reject(new Error('Raw queries not available during build')),
} as any

/**
 * Get safe Prisma instance
 * Get safe Prisma instance
 */
export function getSafePrisma(): PrismaClient {
  if (isBuildTime()) {
    console.log('🔧 Build time detected - returning safe Prisma placeholder')
    return buildTimePrisma
  }
  
  // Dynamically import actual Prisma instance (runtime only)
  const { prisma } = require('@/lib/prisma')
  return prisma
}

/**
 * Prisma instance for API routes
 * Prisma instance for API routes
 */
export const prisma = getSafePrisma()

export default prisma