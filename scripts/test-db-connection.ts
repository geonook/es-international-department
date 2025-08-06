/**
 * Database Connection Test Script for Zeabur Multi-Environment
 * KCISLK ESID Info Hub - Zeabur 資料庫連接測試腳本
 */

import { PrismaClient } from '@prisma/client'
import { env, getEnvironmentInfo, checkEnvironmentHealth } from '../lib/env'

const prisma = new PrismaClient()

/**
 * 測試資料庫連接
 * Test database connection
 */
async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...\n')
  
  try {
    // 環境資訊
    const envInfo = getEnvironmentInfo()
    const health = checkEnvironmentHealth()
    
    console.log('📊 Environment Information:')
    console.log(`  Environment: ${envInfo.nodeEnv}`)
    console.log(`  Database URL: ${envInfo.database.url}`)
    console.log(`  Zeabur Database: ${envInfo.database.isZeabur ? '✅' : '❌'}`)
    console.log(`  Cache Enabled: ${envInfo.cache.enabled ? '✅' : '❌'}`)
    console.log(`  Storage: ${envInfo.storage.vercelBlob ? 'Vercel Blob ✅' : envInfo.storage.awsS3 ? 'AWS S3 ✅' : '❌'}`)
    console.log('')
    
    if (!health.healthy) {
      console.log('⚠️  Configuration Issues:')
      health.issues.forEach(issue => console.log(`  - ${issue}`))
      console.log('')
    }
    
    // 測試連接
    console.log('🔗 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // 測試查詢
    console.log('📋 Testing basic queries...')
    
    // 測試系統設定表
    const settingsCount = await prisma.systemSetting.count()
    console.log(`  - System settings: ${settingsCount} records`)
    
    // 測試角色表
    const rolesCount = await prisma.role.count()
    console.log(`  - Roles: ${rolesCount} records`)
    
    // 測試使用者表
    const usersCount = await prisma.user.count()
    console.log(`  - Users: ${usersCount} records`)
    
    // 測試年級表
    const gradeLevelsCount = await prisma.gradeLevel.count()
    console.log(`  - Grade levels: ${gradeLevelsCount} records`)
    
    // 測試資源分類表
    const categoriesCount = await prisma.resourceCategory.count()
    console.log(`  - Resource categories: ${categoriesCount} records`)
    
    // 測試公告表
    const announcementsCount = await prisma.announcement.count()
    console.log(`  - Announcements: ${announcementsCount} records`)
    
    console.log('\n🎉 All database tests passed!')
    
    // 資料庫版本資訊
    const result = await prisma.$queryRaw`SELECT version() as version;`
    console.log(`\n📋 Database Version:`)
    console.log(`  ${(result as any)[0]?.version || 'Unknown'}`)
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:')
    console.error(error)
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Troubleshooting tips:')
        console.error('  - Check if your DATABASE_URL is correct')
        console.error('  - Verify Zeabur database is running')
        console.error('  - Check your network connection')
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Troubleshooting tips:')
        console.error('  - Check your database credentials')
        console.error('  - Verify the DATABASE_URL format')
      } else if (error.message.includes('database does not exist')) {
        console.error('\n💡 Troubleshooting tips:')
        console.error('  - Check if the database name is correct')
        console.error('  - Run migrations: npm run db:migrate:deploy')
      }
    }
    
    return false
  } finally {
    await prisma.$disconnect()
  }
  
  return true
}

/**
 * 執行測試
 * Run the test
 */
async function main() {
  console.log('🚀 KCISLK ESID Info Hub - Database Connection Test')
  console.log('=' .repeat(60))
  
  const success = await testDatabaseConnection()
  
  console.log('=' .repeat(60))
  
  if (success) {
    console.log('✅ Database connection test completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database connection test failed!')
    process.exit(1)
  }
}

// 執行主函數
main().catch((error) => {
  console.error('💥 Test script failed:', error)
  process.exit(1)
})