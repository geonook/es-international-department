/**
 * Multi-Environment Database Connection Test Script
 * KCISLK ESID Info Hub - Tests staging and production databases
 */

import { PrismaClient } from '@prisma/client'

// Database connection strings for each environment
const DATABASE_CONFIGS = {
  staging: {
    name: 'Staging Environment',
    url: 'postgresql://root:dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n@tpe1.clusters.zeabur.com:30592/zeabur',
    expectedTables: ['User', 'Role', 'SystemSetting', 'GradeLevel', 'ResourceCategory', 'Announcement']
  },
  production: {
    name: 'Production Environment',
    url: 'postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur',
    expectedTables: ['User', 'Role', 'SystemSetting', 'GradeLevel', 'ResourceCategory', 'Announcement']
  },
  development: {
    name: 'Development Environment',
    url: 'postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur',
    expectedTables: ['User', 'Role', 'SystemSetting', 'GradeLevel', 'ResourceCategory', 'Announcement']
  }
}

interface TestResult {
  environment: string
  success: boolean
  connectionTime?: number
  details?: {
    version?: string
    tablesCounts?: Record<string, number>
    error?: string
  }
}

/**
 * Test a single database connection
 */
async function testSingleDatabase(config: typeof DATABASE_CONFIGS.staging): Promise<TestResult> {
  const startTime = Date.now()
  
  // Create a new Prisma client with the specific database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.url
      }
    }
  })

  try {
    console.log(`\n🔌 Testing ${config.name}...`)
    console.log(`   URL: ${config.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`)
    
    // Test connection
    await prisma.$connect()
    console.log(`   ✅ Connection successful`)
    
    // Test basic queries
    const tablesCounts: Record<string, number> = {}
    
    // Test essential tables
    try {
      tablesCounts.systemSettings = await prisma.systemSetting.count()
      console.log(`   📋 System settings: ${tablesCounts.systemSettings} records`)
    } catch (error) {
      console.log(`   ⚠️  System settings table: ERROR - ${error.message}`)
      tablesCounts.systemSettings = -1
    }
    
    try {
      tablesCounts.roles = await prisma.role.count()
      console.log(`   👥 Roles: ${tablesCounts.roles} records`)
    } catch (error) {
      console.log(`   ⚠️  Roles table: ERROR - ${error.message}`)
      tablesCounts.roles = -1
    }
    
    try {
      tablesCounts.users = await prisma.user.count()
      console.log(`   👤 Users: ${tablesCounts.users} records`)
    } catch (error) {
      console.log(`   ⚠️  Users table: ERROR - ${error.message}`)
      tablesCounts.users = -1
    }
    
    try {
      tablesCounts.gradeLevels = await prisma.gradeLevel.count()
      console.log(`   🎓 Grade levels: ${tablesCounts.gradeLevels} records`)
    } catch (error) {
      console.log(`   ⚠️  Grade levels table: ERROR - ${error.message}`)
      tablesCounts.gradeLevels = -1
    }
    
    try {
      tablesCounts.resourceCategories = await prisma.resourceCategory.count()
      console.log(`   📚 Resource categories: ${tablesCounts.resourceCategories} records`)
    } catch (error) {
      console.log(`   ⚠️  Resource categories table: ERROR - ${error.message}`)
      tablesCounts.resourceCategories = -1
    }
    
    try {
      tablesCounts.announcements = await prisma.announcement.count()
      console.log(`   📢 Announcements: ${tablesCounts.announcements} records`)
    } catch (error) {
      console.log(`   ⚠️  Announcements table: ERROR - ${error.message}`)
      tablesCounts.announcements = -1
    }
    
    // Get database version
    let version = 'Unknown'
    try {
      const result = await prisma.$queryRaw`SELECT version() as version;`
      version = (result as any)[0]?.version || 'Unknown'
      console.log(`   🗄️  Database version: ${version.split(' ').slice(0, 2).join(' ')}`)
    } catch (error) {
      console.log(`   ⚠️  Unable to get database version: ${error.message}`)
    }
    
    const connectionTime = Date.now() - startTime
    console.log(`   ⏱️  Connection time: ${connectionTime}ms`)
    
    return {
      environment: config.name,
      success: true,
      connectionTime,
      details: {
        version,
        tablesCounts
      }
    }
    
  } catch (error) {
    const connectionTime = Date.now() - startTime
    console.log(`   ❌ Connection failed: ${error.message}`)
    console.log(`   ⏱️  Failed after: ${connectionTime}ms`)
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.log(`   💡 Issue: Connection refused - database may be down or unreachable`)
    } else if (error.message.includes('authentication failed')) {
      console.log(`   💡 Issue: Authentication failed - check credentials`)
    } else if (error.message.includes('database does not exist')) {
      console.log(`   💡 Issue: Database does not exist - check database name`)
    } else if (error.message.includes('timeout')) {
      console.log(`   💡 Issue: Connection timeout - network or server issues`)
    }
    
    return {
      environment: config.name,
      success: false,
      connectionTime,
      details: {
        error: error.message
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Generate summary report
 */
function generateSummaryReport(results: TestResult[]): void {
  console.log('\n' + '='.repeat(80))
  console.log('📊 DATABASE CONNECTION SUMMARY REPORT')
  console.log('='.repeat(80))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`\n✅ Successful connections: ${successful.length}/${results.length}`)
  console.log(`❌ Failed connections: ${failed.length}/${results.length}`)
  
  if (successful.length > 0) {
    console.log('\n🎉 WORKING ENVIRONMENTS:')
    successful.forEach(result => {
      console.log(`  ✅ ${result.environment} - ${result.connectionTime}ms`)
      if (result.details?.tablesCounts) {
        const counts = result.details.tablesCounts
        const totalRecords = Object.values(counts).reduce((sum, count) => sum + Math.max(0, count), 0)
        console.log(`     📊 Total records: ${totalRecords}`)
      }
    })
  }
  
  if (failed.length > 0) {
    console.log('\n🚨 PROBLEMATIC ENVIRONMENTS:')
    failed.forEach(result => {
      console.log(`  ❌ ${result.environment}`)
      if (result.details?.error) {
        console.log(`     Error: ${result.details.error}`)
      }
    })
    
    console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:')
    
    const hasConnectionRefused = failed.some(r => r.details?.error?.includes('ECONNREFUSED'))
    const hasAuthErrors = failed.some(r => r.details?.error?.includes('authentication'))
    const hasTimeouts = failed.some(r => r.details?.error?.includes('timeout'))
    
    if (hasConnectionRefused) {
      console.log('  🔌 Connection refused errors detected:')
      console.log('     - Verify Zeabur database services are running')
      console.log('     - Check network connectivity to tpe1.clusters.zeabur.com')
      console.log('     - Confirm port numbers are correct')
    }
    
    if (hasAuthErrors) {
      console.log('  🔐 Authentication errors detected:')
      console.log('     - Verify database credentials are correct')
      console.log('     - Check if passwords have been rotated')
      console.log('     - Confirm user accounts have proper permissions')
    }
    
    if (hasTimeouts) {
      console.log('  ⏰ Timeout errors detected:')
      console.log('     - Database server may be overloaded')
      console.log('     - Network latency issues')
      console.log('     - Consider increasing connection timeout')
    }
  }
  
  console.log('\n📋 NEXT STEPS:')
  if (failed.length === 0) {
    console.log('  ✅ All database connections are healthy!')
    console.log('  🚀 Ready for deployment and production use')
  } else {
    console.log('  🔧 Fix connection issues for failed environments')
    console.log('  🧪 Re-run tests after addressing the issues')
    console.log('  📞 Contact Zeabur support if issues persist')
  }
  
  console.log('\n' + '='.repeat(80))
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 KCISLK ESID Info Hub - Multi-Environment Database Test')
  console.log('🎯 Testing all database environments for connectivity and health')
  console.log('=' .repeat(80))
  
  const results: TestResult[] = []
  
  // Test all environments
  for (const [envKey, config] of Object.entries(DATABASE_CONFIGS)) {
    const result = await testSingleDatabase(config)
    results.push(result)
  }
  
  // Generate summary report
  generateSummaryReport(results)
  
  // Exit with appropriate code
  const allSuccessful = results.every(r => r.success)
  if (allSuccessful) {
    console.log('\n🎉 All database tests passed successfully!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some database tests failed. See details above.')
    process.exit(1)
  }
}

// Execute main function
main().catch((error) => {
  console.error('💥 Test script failed:', error)
  process.exit(1)
})