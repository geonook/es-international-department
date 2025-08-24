/**
 * API Health Testing Suite
 * 
 * @description Comprehensive testing for all recently fixed API endpoints
 * @author Claude Code | API Testing Specialist
 * @date 2025-01-24
 */

import fetch from 'node-fetch'
import { performance } from 'perf_hooks'

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN
const TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'

// Test results tracking
interface TestResult {
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  responseTime?: number
  error?: string
  details?: any
}

interface TestSuite {
  name: string
  results: TestResult[]
  successRate: number
  totalTests: number
  passed: number
  failed: number
  skipped: number
}

// Test configuration for each API group
const API_TESTS = {
  email: {
    name: 'Email API System',
    baseUrl: '/api/email',
    endpoints: [
      { path: '/send', methods: ['POST', 'GET'] },
      { path: '/test', methods: ['POST', 'GET'] },
      { path: '/preferences', methods: ['GET', 'PUT', 'POST'] }
    ]
  },
  notifications: {
    name: 'Notification System API',
    baseUrl: '/api/notifications',
    endpoints: [
      { path: '', methods: ['GET', 'POST'] },
      { path: '/preferences', methods: ['GET', 'PUT'] },
      { path: '/stats', methods: ['GET'] },
      { path: '/templates', methods: ['GET', 'POST'] },
      { path: '/mark-read', methods: ['POST'] },
      { path: '/stream', methods: ['GET'] },
      { path: '/1', methods: ['GET', 'PATCH', 'DELETE'] } // Using ID=1 for dynamic route
    ]
  },
  events: {
    name: 'Event System API',
    baseUrl: '/api/admin/events',
    endpoints: [
      { path: '', methods: ['GET', 'POST'] },
      { path: '/1', methods: ['GET', 'PUT', 'DELETE'] } // Using ID=1 for dynamic route
    ]
  },
  announcements: {
    name: 'Announcement System API',
    baseUrl: '/api/announcements',
    endpoints: [
      { path: '', methods: ['GET'] }
    ]
  }
}

// Utility functions
function formatResponseTime(ms: number): string {
  if (ms < 100) return `${Math.round(ms)}ms (Excellent)`
  if (ms < 500) return `${Math.round(ms)}ms (Good)`
  if (ms < 1000) return `${Math.round(ms)}ms (Acceptable)`
  return `${Math.round(ms)}ms (Slow)`
}

function getTestPayload(endpoint: string, method: string): any {
  const payloads: { [key: string]: any } = {
    // Email API payloads
    'POST /api/email/send': {
      type: 'single',
      recipients: [TEST_RECIPIENT],
      template: 'test',
      templateData: {
        userName: 'Test User',
        title: 'API Health Check'
      }
    },
    'POST /api/email/test': {
      testType: 'connection'
    },
    'POST /api/email/preferences': {
      language: 'zh-TW',
      notifications: true,
      newsletter: true
    },
    'PUT /api/email/preferences': {
      language: 'en-US',
      notifications: false
    },
    
    // Notification API payloads
    'POST /api/notifications': {
      title: 'Health Check Notification',
      message: 'This is a test notification from API health check',
      type: 'info',
      priority: 'medium'
    },
    'PUT /api/notifications/preferences': {
      email: true,
      push: true,
      sms: false
    },
    'POST /api/notifications/templates': {
      name: 'health-check-template',
      subject: 'Health Check Template',
      content: 'This is a test template'
    },
    'POST /api/notifications/mark-read': {
      notificationIds: [1, 2, 3]
    },
    'PATCH /api/notifications/1': {
      action: 'mark_read'
    },
    
    // Event API payloads
    'POST /api/admin/events': {
      title: 'Health Check Event',
      description: 'This is a test event from API health check',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      type: 'test',
      priority: 'medium'
    },
    'PUT /api/admin/events/1': {
      title: 'Updated Health Check Event',
      status: 'active'
    }
  }
  
  return payloads[`${method} ${endpoint}`] || null
}

// Main testing function
async function testEndpoint(endpoint: string, method: string): Promise<TestResult> {
  const startTime = performance.now()
  const url = `${BASE_URL}${endpoint}`
  
  try {
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    
    // Add auth token if available
    if (TEST_AUTH_TOKEN) {
      options.headers['Authorization'] = `Bearer ${TEST_AUTH_TOKEN}`
    }
    
    // Add body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const payload = getTestPayload(endpoint, method)
      if (payload) {
        options.body = JSON.stringify(payload)
      }
    }
    
    const response = await fetch(url, options)
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    let responseData
    try {
      responseData = await response.json()
    } catch {
      responseData = { message: 'Non-JSON response' }
    }
    
    // Determine test status
    const isSuccess = response.status >= 200 && response.status < 400
    // Special handling for auth-required endpoints
    const isAuthRequired = response.status === 401 && !TEST_AUTH_TOKEN
    
    return {
      endpoint,
      method,
      status: isSuccess ? 'PASS' : (isAuthRequired ? 'SKIP' : 'FAIL'),
      statusCode: response.status,
      responseTime,
      details: {
        url,
        response: responseData,
        headers: Object.fromEntries(response.headers.entries())
      },
      error: isSuccess || isAuthRequired ? undefined : `HTTP ${response.status}: ${response.statusText}`
    }
    
  } catch (error) {
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    return {
      endpoint,
      method,
      status: 'FAIL',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test suite runner
async function runTestSuite(suiteConfig: any): Promise<TestSuite> {
  const results: TestResult[] = []
  const { name, baseUrl, endpoints } = suiteConfig
  
  console.log(`\n🧪 Testing ${name}...`)
  console.log('='.repeat(50))
  
  for (const endpointConfig of endpoints) {
    const fullPath = `${baseUrl}${endpointConfig.path}`
    
    for (const method of endpointConfig.methods) {
      console.log(`Testing ${method} ${fullPath}...`)
      const result = await testEndpoint(fullPath, method)
      results.push(result)
      
      // Print immediate result
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌'
      const responseTime = result.responseTime ? formatResponseTime(result.responseTime) : 'N/A'
      console.log(`  ${statusIcon} ${result.status} - ${result.statusCode} - ${responseTime}`)
      
      if (result.error) {
        console.log(`    Error: ${result.error}`)
      }
    }
  }
  
  // Calculate statistics
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const total = results.length
  const successRate = total > 0 ? (passed / total) * 100 : 0
  
  return {
    name,
    results,
    successRate,
    totalTests: total,
    passed,
    failed,
    skipped
  }
}

// Performance analysis
function analyzePerformance(allResults: TestResult[]): any {
  const responseTimes = allResults
    .filter(r => r.responseTime !== undefined)
    .map(r => r.responseTime!)
  
  if (responseTimes.length === 0) {
    return { message: 'No response time data available' }
  }
  
  responseTimes.sort((a, b) => a - b)
  
  const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)]
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)]
  const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)]
  const average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const min = responseTimes[0]
  const max = responseTimes[responseTimes.length - 1]
  
  return {
    average: Math.round(average),
    median: Math.round(p50),
    p95: Math.round(p95),
    p99: Math.round(p99),
    min: Math.round(min),
    max: Math.round(max),
    totalRequests: responseTimes.length
  }
}

// Generate comprehensive report
function generateReport(testSuites: TestSuite[]): void {
  console.log('\n' + '='.repeat(70))
  console.log('🎯 API HEALTH TEST REPORT')
  console.log('='.repeat(70))
  
  // Overall statistics
  const overallStats = testSuites.reduce(
    (acc, suite) => ({
      totalTests: acc.totalTests + suite.totalTests,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed,
      skipped: acc.skipped + suite.skipped
    }),
    { totalTests: 0, passed: 0, failed: 0, skipped: 0 }
  )
  
  const overallSuccessRate = overallStats.totalTests > 0 
    ? (overallStats.passed / overallStats.totalTests) * 100 
    : 0
  
  console.log(`\n📊 Overall Health Score: ${overallSuccessRate.toFixed(1)}%`)
  console.log(`Total Tests: ${overallStats.totalTests} | Passed: ${overallStats.passed} | Failed: ${overallStats.failed} | Skipped: ${overallStats.skipped}`)
  
  // Individual suite results
  console.log('\n📈 Individual API System Results:')
  console.log('-'.repeat(50))
  
  testSuites.forEach(suite => {
    const icon = suite.successRate >= 90 ? '🟢' : suite.successRate >= 70 ? '🟡' : '🔴'
    console.log(`${icon} ${suite.name}: ${suite.successRate.toFixed(1)}% (${suite.passed}/${suite.totalTests} passed)`)
    
    if (suite.failed > 0) {
      const failedTests = suite.results.filter(r => r.status === 'FAIL')
      failedTests.forEach(test => {
        console.log(`  ❌ ${test.method} ${test.endpoint}: ${test.error}`)
      })
    }
    
    if (suite.skipped > 0) {
      console.log(`  ⏭️  Skipped ${suite.skipped} tests (likely auth required)`)
    }
  })
  
  // Performance analysis
  const allResults = testSuites.flatMap(suite => suite.results)
  const perfStats = analyzePerformance(allResults)
  
  console.log('\n⚡ Performance Analysis:')
  console.log('-'.repeat(30))
  if (perfStats.totalRequests) {
    console.log(`Average Response Time: ${perfStats.average}ms`)
    console.log(`Median (p50): ${perfStats.median}ms`)
    console.log(`95th Percentile: ${perfStats.p95}ms`)
    console.log(`99th Percentile: ${perfStats.p99}ms`)
    console.log(`Range: ${perfStats.min}ms - ${perfStats.max}ms`)
    
    // Performance assessment
    if (perfStats.p95 < 500) {
      console.log('✅ Performance: Excellent (p95 < 500ms)')
    } else if (perfStats.p95 < 1000) {
      console.log('🟡 Performance: Good (p95 < 1000ms)')
    } else {
      console.log('🔴 Performance: Needs optimization (p95 > 1000ms)')
    }
  } else {
    console.log(perfStats.message)
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('-'.repeat(20))
  
  if (overallStats.failed > 0) {
    console.log('🔧 Fix failed endpoints before production deployment')
  }
  
  if (overallStats.skipped > 0) {
    console.log('🔑 Set TEST_AUTH_TOKEN environment variable for complete testing')
  }
  
  if (perfStats.p95 && perfStats.p95 > 1000) {
    console.log('⚡ Consider performance optimization for slow endpoints')
  }
  
  if (overallSuccessRate >= 90) {
    console.log('🎉 APIs are healthy and ready for production!')
  } else if (overallSuccessRate >= 70) {
    console.log('⚠️  APIs have some issues but are mostly functional')
  } else {
    console.log('🚨 APIs need significant attention before production deployment')
  }
  
  console.log('\n' + '='.repeat(70))
}

// Main execution
async function main() {
  console.log('🚀 Starting API Health Testing Suite')
  console.log('Time:', new Date().toISOString())
  console.log('Base URL:', BASE_URL)
  console.log('Auth Token:', TEST_AUTH_TOKEN ? '✅ Configured' : '❌ Not configured')
  
  const testSuites: TestSuite[] = []
  
  // Test each API group
  for (const [key, config] of Object.entries(API_TESTS)) {
    try {
      const suite = await runTestSuite(config)
      testSuites.push(suite)
    } catch (error) {
      console.error(`Failed to test ${config.name}:`, error)
    }
  }
  
  // Generate comprehensive report
  generateReport(testSuites)
  
  // Exit with proper code
  const overallStats = testSuites.reduce(
    (acc, suite) => ({
      totalTests: acc.totalTests + suite.totalTests,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed
    }),
    { totalTests: 0, passed: 0, failed: 0 }
  )
  
  const successRate = overallStats.totalTests > 0 
    ? (overallStats.passed / overallStats.totalTests) * 100 
    : 0
    
  process.exit(successRate >= 90 ? 0 : 1)
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Run the tests
if (require.main === module) {
  main().catch(console.error)
}

export { main as runApiHealthTests, TestResult, TestSuite }