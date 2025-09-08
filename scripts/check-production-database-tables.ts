/**
 * Production Database Tables Checker
 * 生產環境資料庫表格檢查工具
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// 載入生產環境配置
dotenv.config({ path: '.env.production' })

const prisma = new PrismaClient()

async function checkDatabaseTables() {
  console.log('🔍 Checking Production Database Tables...\n')
  
  try {
    // 檢查資料庫連線
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')
    
    // 查詢所有表格
    console.log('📊 Querying existing tables...')
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    console.log('🗄️ Existing tables in production database:')
    console.log('=' .repeat(50))
    
    if (tables.length === 0) {
      console.log('❌ No tables found in the database!')
      console.log('   This confirms the issue - the database is empty.\n')
    } else {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`)
      })
      console.log(`\nTotal tables: ${tables.length}\n`)
    }
    
    // 檢查關鍵表格是否存在
    const criticalTables = ['users', 'roles', 'user_roles', 'accounts']
    console.log('🔑 Checking critical tables:')
    console.log('=' .repeat(50))
    
    for (const tableName of criticalTables) {
      const tableExists = tables.some(t => t.table_name === tableName)
      const status = tableExists ? '✅' : '❌'
      console.log(`${status} ${tableName}: ${tableExists ? 'EXISTS' : 'MISSING'}`)
    }
    
    // 檢查 _prisma_migrations 表
    console.log('\n🔄 Checking migration status:')
    console.log('=' .repeat(50))
    
    const migrationTableExists = tables.some(t => t.table_name === '_prisma_migrations')
    
    if (migrationTableExists) {
      console.log('✅ _prisma_migrations table exists')
      
      try {
        const migrations = await prisma.$queryRaw<Array<{
          id: string,
          checksum: string,
          finished_at: Date | null,
          migration_name: string,
          rolled_back_at: Date | null
        }>>`
          SELECT id, checksum, finished_at, migration_name, rolled_back_at
          FROM "_prisma_migrations"
          ORDER BY finished_at ASC;
        `
        
        console.log(`📈 Found ${migrations.length} migration records:`)
        migrations.forEach((migration, index) => {
          const status = migration.finished_at ? '✅' : migration.rolled_back_at ? '🔄' : '⏳'
          console.log(`   ${index + 1}. ${status} ${migration.migration_name}`)
        })
      } catch (error) {
        console.log('❌ Failed to query migrations:', error)
      }
    } else {
      console.log('❌ _prisma_migrations table does not exist')
      console.log('   This indicates no migrations have been run in production')
    }
    
    // 總結
    console.log('\n📋 Summary:')
    console.log('=' .repeat(50))
    
    const hasUsers = tables.some(t => t.table_name === 'users')
    if (hasUsers) {
      console.log('✅ Database appears to be properly migrated')
    } else {
      console.log('❌ Database needs migration - users table is missing')
      console.log('   Solution: Run `npx prisma migrate deploy` in production environment')
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
    
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('\n💡 This confirms the issue: Required tables are missing from the database.')
      console.log('   The database exists but has not been migrated.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// 執行檢查
if (require.main === module) {
  checkDatabaseTables().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
}

export { checkDatabaseTables }