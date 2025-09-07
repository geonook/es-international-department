/**
 * Production Authentication Diagnostics
 * Comprehensive diagnostic tool for Production environment 401 errors
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DiagnosticResults {
  environment: {
    nodeEnv: string
    nextAuthUrl: string
    cookieSecure: boolean
    jwtSecret: boolean
  }
  database: {
    connection: boolean
    userSessions: number
    recentSessions: number
    orphanedSessions: number
  }
  cookies: {
    configuration: object
    potentialIssues: string[]
  }
  recommendations: string[]
}

/**
 * Check environment configuration
 */
async function checkEnvironmentConfig(): Promise<DiagnosticResults['environment']> {
  console.log('🔍 Checking environment configuration...')
  
  const nodeEnv = process.env.NODE_ENV || 'development'
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'not-set'
  const jwtSecret = !!(process.env.JWT_SECRET)
  const cookieSecure = nodeEnv === 'production'
  
  console.log(`  NODE_ENV: ${nodeEnv}`)
  console.log(`  NEXTAUTH_URL: ${nextAuthUrl}`)
  console.log(`  JWT_SECRET: ${jwtSecret ? 'configured' : 'missing'}`)
  console.log(`  Cookie secure mode: ${cookieSecure}`)
  
  return {
    nodeEnv,
    nextAuthUrl,
    cookieSecure,
    jwtSecret
  }
}

/**
 * Check database and user sessions
 */
async function checkDatabaseSessions(): Promise<DiagnosticResults['database']> {
  console.log('🔍 Checking database sessions...')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('  ✅ Database connection successful')
    
    // Count total user sessions
    const totalSessions = await prisma.userSession.count()
    console.log(`  📊 Total user sessions: ${totalSessions}`)
    
    // Count recent sessions (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentSessions = await prisma.userSession.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    })
    console.log(`  📊 Recent sessions (24h): ${recentSessions}`)
    
    // Check for orphaned sessions
    const orphanedSessions = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      WHERE u.id IS NULL
    `
    
    const orphanCount = Number(orphanedSessions[0].count)
    console.log(`  📊 Orphaned sessions: ${orphanCount}`)
    
    return {
      connection: true,
      userSessions: totalSessions,
      recentSessions,
      orphanedSessions: orphanCount
    }
    
  } catch (error) {
    console.error('  ❌ Database connection failed:', error)
    return {
      connection: false,
      userSessions: 0,
      recentSessions: 0,
      orphanedSessions: 0
    }
  }
}

/**
 * Analyze cookie configuration
 */
function analyzeCookieConfig(envConfig: DiagnosticResults['environment']): DiagnosticResults['cookies'] {
  console.log('🔍 Analyzing cookie configuration...')
  
  const cookieConfig = {
    httpOnly: true,
    secure: envConfig.cookieSecure,
    sameSite: 'lax',
    path: '/',
    domain: 'not-set' // This could be the issue!
  }
  
  const potentialIssues: string[] = []
  
  // Check for potential issues
  if (envConfig.nodeEnv === 'production' && !envConfig.nextAuthUrl.startsWith('https://')) {
    potentialIssues.push('NEXTAUTH_URL should use HTTPS in production')
  }
  
  if (envConfig.cookieSecure && envConfig.nextAuthUrl.includes('localhost')) {
    potentialIssues.push('Secure cookies may not work with localhost in production mode')
  }
  
  if (cookieConfig.domain === 'not-set') {
    potentialIssues.push('Cookie domain not explicitly set - may cause cross-subdomain issues')
  }
  
  if (cookieConfig.sameSite === 'lax') {
    potentialIssues.push('SameSite=lax may cause issues with some OAuth flows')
  }
  
  console.log('  Cookie configuration:', JSON.stringify(cookieConfig, null, 2))
  console.log('  Potential issues:', potentialIssues)
  
  return {
    configuration: cookieConfig,
    potentialIssues
  }
}

/**
 * Generate recommendations based on diagnostic results
 */
function generateRecommendations(results: Omit<DiagnosticResults, 'recommendations'>): string[] {
  const recommendations: string[] = []
  
  // Environment recommendations
  if (!results.environment.jwtSecret) {
    recommendations.push('🔧 Configure JWT_SECRET environment variable')
  }
  
  if (results.environment.nodeEnv === 'production' && !results.environment.nextAuthUrl.startsWith('https://')) {
    recommendations.push('🔧 Update NEXTAUTH_URL to use HTTPS in production')
  }
  
  // Database recommendations
  if (!results.database.connection) {
    recommendations.push('🔧 Fix database connection issues')
  }
  
  if (results.database.orphanedSessions > 0) {
    recommendations.push(`🔧 Clean up ${results.database.orphanedSessions} orphaned user sessions`)
  }
  
  // Cookie recommendations
  if (results.cookies.potentialIssues.length > 0) {
    recommendations.push('🔧 Review and fix cookie configuration issues:')
    results.cookies.potentialIssues.forEach(issue => {
      recommendations.push(`   - ${issue}`)
    })
  }
  
  // Specific 401 error recommendations
  recommendations.push('🔧 Add detailed logging to OAuth callback for debugging')
  recommendations.push('🔧 Test token refresh flow with curl/Postman')
  recommendations.push('🔧 Verify cookie persistence across requests')
  
  return recommendations
}

/**
 * Test token generation (simulated)
 */
async function testTokenGeneration(): Promise<boolean> {
  console.log('🔍 Testing token generation...')
  
  try {
    const { generateJWT } = await import('@/lib/auth')
    
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      roles: ['viewer']
    }
    
    const token = await generateJWT(testUser)
    console.log('  ✅ JWT generation successful')
    console.log(`  Token length: ${token.length}`)
    
    // Verify the token
    const { verifyJWT } = await import('@/lib/auth')
    const payload = await verifyJWT(token)
    
    if (payload && payload.userId === testUser.id) {
      console.log('  ✅ JWT verification successful')
      return true
    } else {
      console.log('  ❌ JWT verification failed')
      return false
    }
    
  } catch (error) {
    console.error('  ❌ Token generation failed:', error)
    return false
  }
}

/**
 * Main diagnostic function
 */
async function main() {
  console.log('🚀 Production Authentication Diagnostics')
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    // Run all diagnostic checks
    const envConfig = await checkEnvironmentConfig()
    console.log('')
    
    const dbResults = await checkDatabaseSessions()
    console.log('')
    
    const cookieAnalysis = analyzeCookieConfig(envConfig)
    console.log('')
    
    const tokenTest = await testTokenGeneration()
    console.log('')
    
    // Compile results
    const results: DiagnosticResults = {
      environment: envConfig,
      database: dbResults,
      cookies: cookieAnalysis,
      recommendations: []
    }
    
    results.recommendations = generateRecommendations(results)
    
    // Display summary
    console.log('📋 DIAGNOSTIC SUMMARY')
    console.log('=' .repeat(30))
    console.log(`Environment: ${results.environment.nodeEnv}`)
    console.log(`Database Connection: ${results.database.connection ? '✅' : '❌'}`)
    console.log(`Token Generation: ${tokenTest ? '✅' : '❌'}`)
    console.log(`Cookie Issues Found: ${results.cookies.potentialIssues.length}`)
    console.log('')
    
    console.log('🔧 RECOMMENDATIONS')
    console.log('=' .repeat(20))
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
    
    console.log('')
    console.log('🎯 NEXT STEPS FOR 401 ERROR RESOLUTION')
    console.log('=' .repeat(40))
    console.log('1. Check browser developer tools for cookie values')
    console.log('2. Verify HTTPS is working correctly on Zeabur')
    console.log('3. Test OAuth flow step by step')
    console.log('4. Check server logs for detailed error messages')
    console.log('5. Consider adding temporary debug endpoints')
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute diagnostics
if (require.main === module) {
  main()
}

export { main as runDiagnostics }