#!/usr/bin/env ts-node
/**
 * Newsletter API Testing Script
 * 測試增強的電子報 API 功能
 * 
 * Tests the enhanced newsletter API with date filtering capabilities
 * 測試具有日期篩選功能的增強電子報 API
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001'

interface TestResult {
  name: string
  endpoint: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  responseTime: number
  data?: any
  error?: string
}

class NewsletterAPITester {
  private results: TestResult[] = []

  private async makeRequest(endpoint: string, testName: string): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🧪 Testing: ${testName}`)
      console.log(`📡 Endpoint: ${endpoint}`)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log(`✅ ${testName} - Response time: ${responseTime}ms`)
      console.log(`📊 Data summary:`, {
        success: data.success,
        dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
        total: data.total || 'N/A',
        source: data.source || 'N/A'
      })
      console.log('') // Empty line for readability
      
      return {
        name: testName,
        endpoint,
        status: 'PASS',
        responseTime,
        data
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.log(`❌ ${testName} - Failed after ${responseTime}ms`)
      console.log(`💥 Error:`, error.message)
      console.log('') // Empty line for readability
      
      return {
        name: testName,
        endpoint,
        status: 'FAIL',
        responseTime,
        error: error.message
      }
    }
  }

  async runTests() {
    console.log('🚀 Starting Newsletter API Tests...')
    console.log(`🌐 Base URL: ${API_BASE_URL}`)
    console.log('=' .repeat(60))
    console.log('')

    // Test 1: Basic Newsletter API (no filters)
    this.results.push(await this.makeRequest(
      '/api/public/newsletters',
      'Basic Newsletter API - No Filters'
    ))

    // Test 2: Newsletter API with limit
    this.results.push(await this.makeRequest(
      '/api/public/newsletters?limit=5',
      'Newsletter API - With Limit'
    ))

    // Test 3: Newsletter API with current month filter
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    this.results.push(await this.makeRequest(
      `/api/public/newsletters?month=${currentMonth}`,
      `Newsletter API - Current Month Filter (${currentMonth})`
    ))

    // Test 4: Newsletter API with year filter
    const currentYear = new Date().getFullYear()
    this.results.push(await this.makeRequest(
      `/api/public/newsletters?year=${currentYear}`,
      `Newsletter API - Current Year Filter (${currentYear})`
    ))

    // Test 5: Newsletter API with previous month filter
    const prevMonth = new Date()
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const prevMonthStr = prevMonth.toISOString().slice(0, 7)
    this.results.push(await this.makeRequest(
      `/api/public/newsletters?month=${prevMonthStr}`,
      `Newsletter API - Previous Month Filter (${prevMonthStr})`
    ))

    // Test 6: Newsletter Archive API - Monthly grouping
    this.results.push(await this.makeRequest(
      '/api/public/newsletters/archive?groupBy=month',
      'Newsletter Archive API - Monthly Grouping'
    ))

    // Test 7: Newsletter Archive API - Yearly grouping
    this.results.push(await this.makeRequest(
      '/api/public/newsletters/archive?groupBy=year',
      'Newsletter Archive API - Yearly Grouping'
    ))

    // Test 8: Newsletter Archive API - Both groupings
    this.results.push(await this.makeRequest(
      '/api/public/newsletters/archive?groupBy=both',
      'Newsletter Archive API - Both Groupings'
    ))

    // Test 9: Newsletter Archive API - Limited results
    this.results.push(await this.makeRequest(
      '/api/public/newsletters/archive?groupBy=month&limit=6',
      'Newsletter Archive API - Limited to 6 Months'
    ))

    // Test 10: Edge case - Invalid month format
    this.results.push(await this.makeRequest(
      '/api/public/newsletters?month=2025-13',
      'Newsletter API - Invalid Month Format (Edge Case)'
    ))

    // Test 11: Edge case - Invalid year format
    this.results.push(await this.makeRequest(
      '/api/public/newsletters?year=invalid',
      'Newsletter API - Invalid Year Format (Edge Case)'
    ))

    this.printSummary()
  }

  private printSummary() {
    console.log('=' .repeat(60))
    console.log('📈 TEST SUMMARY')
    console.log('=' .repeat(60))

    const passCount = this.results.filter(r => r.status === 'PASS').length
    const failCount = this.results.filter(r => r.status === 'FAIL').length
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length

    console.log(`✅ Passed: ${passCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📊 Total Tests: ${this.results.length}`)
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`)
    console.log('')

    // Print failed tests details
    const failedTests = this.results.filter(r => r.status === 'FAIL')
    if (failedTests.length > 0) {
      console.log('💥 FAILED TESTS DETAILS:')
      failedTests.forEach(test => {
        console.log(`  ❌ ${test.name}`)
        console.log(`     Endpoint: ${test.endpoint}`)
        console.log(`     Error: ${test.error}`)
        console.log('')
      })
    }

    // Print performance insights
    console.log('⚡ PERFORMANCE INSIGHTS:')
    const sortedByTime = [...this.results].sort((a, b) => a.responseTime - b.responseTime)
    console.log(`  🥇 Fastest: ${sortedByTime[0]?.name} (${sortedByTime[0]?.responseTime}ms)`)
    console.log(`  🐌 Slowest: ${sortedByTime[sortedByTime.length - 1]?.name} (${sortedByTime[sortedByTime.length - 1]?.responseTime}ms)`)
    
    // Data insights from successful tests
    const successfulTests = this.results.filter(r => r.status === 'PASS' && r.data)
    if (successfulTests.length > 0) {
      console.log('')
      console.log('📊 DATA INSIGHTS:')
      successfulTests.forEach(test => {
        if (test.data?.data && Array.isArray(test.data.data)) {
          console.log(`  📋 ${test.name}: ${test.data.data.length} newsletters returned`)
        } else if (test.data?.archive) {
          const archiveLength = Array.isArray(test.data.archive) ? test.data.archive.length : 'Complex structure'
          console.log(`  📋 ${test.name}: ${archiveLength} archive entries`)
        }
      })
    }

    console.log('')
    console.log('🏁 Newsletter API Testing Complete!')
  }
}

// Run the tests
async function main() {
  const tester = new NewsletterAPITester()
  await tester.runTests()
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

export default NewsletterAPITester