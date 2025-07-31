/**
 * Prisma Client Configuration for Zeabur Multi-Environment Deployment
 * ES International Department - Zeabur 多環境雲端資料庫配置
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
  // Zeabur 雲端資料庫連接優化配置
  __internal: {
    engine: {
      // 優化連接池設定以適配 Zeabur 資料庫限制
      connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 5,
    }
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
    await prisma.$connect()
    
    // 記錄當前環境與資料庫連接狀態
    const environment = process.env.NODE_ENV || 'development'
    const dbUrl = process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'Not configured'
    
    console.log(`✅ Database connected successfully`)
    console.log(`🌍 Environment: ${environment}`)
    console.log(`🗄️  Database: ${dbUrl}`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
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

export default prisma