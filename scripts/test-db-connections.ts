/**
 * Database Connection Test Script
 * Tests database connections for all three environments
 */

import { PrismaClient } from '@prisma/client'

// Database URLs for each environment
const databases = {
  development: "postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur",
  staging: "postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur", 
  production: "postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur"
}

async function testDatabaseConnection(env: string, url: string) {
  console.log(`\n🔍 Testing ${env.toUpperCase()} database...`)
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  })

  try {
    // Test basic connection
    await prisma.$connect()
    console.log(`✅ ${env}: Connected successfully`)
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log(`✅ ${env}: Query executed successfully`, result)
    
    // Try to query a table (this might fail if schema doesn't exist)
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ ${env}: Found ${userCount} users`)
    } catch (schemaError) {
      console.log(`⚠️  ${env}: Schema/table issue:`, (schemaError as Error).message)
    }
    
  } catch (error) {
    console.log(`❌ ${env}: Connection failed:`, (error as Error).message)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🚀 Testing Database Connections for All Environments\n')
  
  for (const [env, url] of Object.entries(databases)) {
    await testDatabaseConnection(env, url)
  }
  
  console.log('\n✅ Database connection testing completed!')
}

main().catch(console.error)