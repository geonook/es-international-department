/**
 * Zeabur Database Connections Test Script
 * ES International Department - Zeabur 資料庫連接測試
 */

import { Client } from 'pg'

// Zeabur 資料庫連接字串
const databases = {
  development: "postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur",
  staging: "postgresql://root:dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n@tpe1.clusters.zeabur.com:30592/zeabur",
  production: "postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur"
}

/**
 * 測試單個資料庫連接
 */
async function testDatabaseConnection(environment: string, connectionString: string): Promise<boolean> {
  console.log(`\n🔌 Testing ${environment} database connection...`)
  
  const client = new Client({
    connectionString
    // Zeabur doesn't require SSL - removed SSL configuration
  })
  
  try {
    await client.connect()
    console.log(`  ✅ Connected to ${environment} database successfully`)
    
    // 測試基本查詢
    const result = await client.query('SELECT version(), current_database(), current_user')
    const { version, current_database, current_user } = result.rows[0]
    
    console.log(`  📊 Database Info:`)
    console.log(`     Version: ${version.split(' ')[0]} ${version.split(' ')[1]}`)
    console.log(`     Database: ${current_database}`)
    console.log(`     User: ${current_user}`)
    
    // 測試基本權限
    await client.query('SELECT NOW() as current_time')
    console.log(`  🕒 Time Query: SUCCESS`)
    
    return true
  } catch (error) {
    console.log(`  ❌ Failed to connect to ${environment} database`)
    console.log(`  💡 Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  } finally {
    try {
      await client.end()
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

/**
 * 主測試函數
 */
async function main() {
  console.log('🚀 ES International Department - Zeabur Databases Connection Test')
  console.log('=' .repeat(70))
  
  const results: Record<string, boolean> = {}
  
  // 測試所有環境
  for (const [environment, connectionString] of Object.entries(databases)) {
    results[environment] = await testDatabaseConnection(environment, connectionString)
  }
  
  // 總結結果
  console.log('\n📋 Connection Test Summary:')
  console.log('=' .repeat(70))
  
  let allPassed = true
  for (const [environment, success] of Object.entries(results)) {
    const status = success ? '✅ PASS' : '❌ FAIL'
    const port = databases[environment as keyof typeof databases].match(/:(\d+)\//)?.[1] || 'Unknown'
    console.log(`  ${status} ${environment.padEnd(12)} (Port: ${port})`)
    if (!success) allPassed = false
  }
  
  console.log('=' .repeat(70))
  
  if (allPassed) {
    console.log('🎉 All database connections successful!')
    console.log('✨ Ready to proceed with database initialization')
    process.exit(0)
  } else {
    console.log('⚠️  Some database connections failed')
    console.log('💡 Please check your network connection and database credentials')
    process.exit(1)
  }
}

// 執行測試
main().catch((error) => {
  console.error('💥 Test script error:', error)
  process.exit(1)
})