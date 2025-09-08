/**
 * Environment-Specific Database Checker
 * 環境專用資料庫檢查工具
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

const environment = process.argv[2]
if (!environment || !['development', 'staging', 'production'].includes(environment)) {
  console.error('Usage: npx tsx scripts/check-env-database.ts <environment>')
  console.error('Available environments: development, staging, production')
  process.exit(1)
}

// 載入指定環境的配置
dotenv.config({ path: `.env.${environment}` })

async function checkDatabase() {
  console.log(`🔍 Checking ${environment} database...`)
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(`❌ DATABASE_URL not found in .env.${environment}`)
    return
  }
  
  // 從 URL 中提取端口資訊
  const urlMatch = databaseUrl.match(/:(\d+)\//)
  const port = urlMatch ? urlMatch[1] : 'unknown'
  
  console.log(`📡 Database URL port: ${port}`)
  console.log(`🌍 Environment: ${environment}`)
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  })
  
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // 查詢表格
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    console.log(`📊 Found ${tables.length} tables:`)
    if (tables.length === 0) {
      console.log('   ❌ Database is empty - needs migration')
    } else {
      const criticalTables = ['users', 'roles', 'user_roles', 'accounts']
      const existingCritical = criticalTables.filter(table => 
        tables.some(t => t.table_name === table)
      )
      
      console.log(`   ✅ Critical tables present: ${existingCritical.length}/${criticalTables.length}`)
      console.log(`   Tables: ${existingCritical.join(', ')}`)
      
      if (existingCritical.length < criticalTables.length) {
        const missing = criticalTables.filter(table => !existingCritical.includes(table))
        console.log(`   ❌ Missing tables: ${missing.join(', ')}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase().catch(console.error)