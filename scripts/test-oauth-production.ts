/**
 * Production OAuth Testing Script
 * Comprehensive testing of OAuth functionality in production environment
 */

// Production OAuth Testing Script - No imports needed for testing external endpoints

interface OAuthTestResult {
  step: string
  status: 'pass' | 'fail' | 'skip'
  details: string
  timestamp: string
}

class ProductionOAuthTester {
  private results: OAuthTestResult[] = []
  private baseUrl = 'https://kcislk-infohub.zeabur.app'

  private addResult(step: string, status: 'pass' | 'fail' | 'skip', details: string) {
    this.results.push({
      step,
      status,
      details,
      timestamp: new Date().toISOString()
    })
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️'
    console.log(`${emoji} ${step}: ${details}`)
  }

  async testHealthEndpoint() {
    console.log('🏥 Testing production health endpoint...')
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      const data = await response.json()
      
      if (response.ok && data.status === 'OK') {
        this.addResult('Health Check', 'pass', `Version ${data.version}, database ${data.performance.database.status}`)
        return true
      } else {
        this.addResult('Health Check', 'fail', `Status: ${response.status}, Data: ${JSON.stringify(data)}`)
        return false
      }
    } catch (error) {
      this.addResult('Health Check', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  async testOAuthProviders() {
    console.log('🔐 Testing OAuth providers endpoint...')
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/providers`)
      const data = await response.json()
      
      if (response.ok && data.providers && data.providers.google) {
        this.addResult('OAuth Providers', 'pass', `Google OAuth configured: ${data.providers.google.clientId ? 'Yes' : 'No'}`)
        return true
      } else {
        this.addResult('OAuth Providers', 'fail', `Status: ${response.status}, Data: ${JSON.stringify(data)}`)
        return false
      }
    } catch (error) {
      this.addResult('OAuth Providers', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  async testOAuthFlow() {
    console.log('🚀 Testing OAuth initialization flow...')
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/google`, {
        redirect: 'manual'
      })
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location')
        if (location && location.includes('accounts.google.com')) {
          this.addResult('OAuth Initialization', 'pass', `Redirects to Google: ${location.substring(0, 50)}...`)
          return true
        } else {
          this.addResult('OAuth Initialization', 'fail', `Invalid redirect: ${location}`)
          return false
        }
      } else {
        this.addResult('OAuth Initialization', 'fail', `Status: ${response.status}`)
        return false
      }
    } catch (error) {
      this.addResult('OAuth Initialization', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  async testDatabaseAccess() {
    console.log('🗄️  Testing database access via debug endpoint...')
    try {
      const response = await fetch(`${this.baseUrl}/api/debug/db-test`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        const passedTests = data.diagnostics.tests.filter((t: any) => t.status === 'pass').length
        const totalTests = data.diagnostics.tests.length
        this.addResult('Database Access', 'pass', `${passedTests}/${totalTests} tests passed`)
        return true
      } else {
        this.addResult('Database Access', 'fail', `${data.summary || 'Database tests failed'}`)
        return false
      }
    } catch (error) {
      this.addResult('Database Access', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  async testAuthMeEndpoint() {
    console.log('👤 Testing auth/me endpoint (should return 401)...')
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`)
      const data = await response.json()
      
      if (response.status === 401 && data.error) {
        this.addResult('Auth Me Endpoint', 'pass', 'Correctly returns 401 for unauthenticated request')
        return true
      } else {
        this.addResult('Auth Me Endpoint', 'fail', `Unexpected response: ${response.status} - ${JSON.stringify(data)}`)
        return false
      }
    } catch (error) {
      this.addResult('Auth Me Endpoint', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Production OAuth Testing Suite')
    console.log('='.repeat(50))
    console.log(`🎯 Target: ${this.baseUrl}`)
    console.log(`⏰ Started: ${new Date().toLocaleString()}`)
    console.log('')

    const tests = [
      this.testHealthEndpoint,
      this.testOAuthProviders,
      this.testOAuthFlow,
      this.testDatabaseAccess,
      this.testAuthMeEndpoint
    ]

    let passed = 0
    let failed = 0
    let skipped = 0

    for (const test of tests) {
      try {
        const result = await test.call(this)
        if (result) passed++
        else failed++
      } catch (error) {
        console.error(`❌ Test failed with exception:`, error)
        failed++
      }
      console.log('') // Add spacing between tests
    }

    // Summary
    console.log('📋 TEST SUMMARY')
    console.log('='.repeat(30))
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️  Skipped: ${skipped}`)
    console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
    console.log('')

    // Detailed Results
    console.log('📝 DETAILED RESULTS')
    console.log('='.repeat(30))
    this.results.forEach((result, index) => {
      const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️'
      console.log(`${index + 1}. ${emoji} ${result.step}`)
      console.log(`   Details: ${result.details}`)
      console.log(`   Time: ${new Date(result.timestamp).toLocaleTimeString()}`)
    })

    console.log('')
    console.log('🎯 RECOMMENDATIONS')
    console.log('='.repeat(30))
    
    if (failed === 0) {
      console.log('🎉 All tests passed! OAuth system is functioning correctly.')
      console.log('✅ Production environment is ready for OAuth authentication.')
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Review the following:`)
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`   • ${result.step}: ${result.details}`)
        })
      console.log('')
      console.log('🔧 Next steps:')
      console.log('   1. Review server logs for detailed error information')
      console.log('   2. Check environment configuration')
      console.log('   3. Verify database connectivity and schema')
      console.log('   4. Test OAuth flow manually in browser')
    }

    return { passed, failed, skipped, results: this.results }
  }
}

// Execute the tests
async function main() {
  const tester = new ProductionOAuthTester()
  const results = await tester.runAllTests()
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test suite crashed:', error)
    process.exit(1)
  })
}