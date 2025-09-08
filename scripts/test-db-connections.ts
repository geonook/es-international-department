/**
 * Database Connection Test Script
 * Tests database connections for all three environments
 */

import { PrismaClient } from '@prisma/client'

// Database URLs for each environment (corrected ports)
const databases = {
  development: "postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur",
  staging: "postgresql://root:dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n@tpe1.clusters.zeabur.com:30592/zeabur", 
  production: "postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur"
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
    
    // Try to get table information for isolation verification
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ ${env}: Found ${userCount} users`)
      
      // Check other table counts for isolation verification
      try {
        const eventCount = await prisma.event.count()
        const communicationCount = await prisma.communication.count()
        const fileUploadCount = await prisma.fileUpload.count()
        console.log(`📊 ${env}: Tables - Users: ${userCount}, Events: ${eventCount}, Communications: ${communicationCount}, Files: ${fileUploadCount}`)
      } catch (tableError) {
        console.log(`⚠️  ${env}: Some tables not available:`, (tableError as Error).message)
      }
    } catch (schemaError) {
      console.log(`⚠️  ${env}: Schema/table issue:`, (schemaError as Error).message)
      
      // Try raw query to check if database exists
      try {
        const tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
        console.log(`📋 ${env}: Available tables:`, tables)
      } catch (rawError) {
        console.log(`❌ ${env}: Raw query failed:`, (rawError as Error).message)
      }
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