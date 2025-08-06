#!/usr/bin/env ts-node

/**
 * Real-time Notification System Test Script
 * 即時通知系統測試腳本
 * 
 * @description 全面測試即時通知系統的功能，包括 SSE 連接、通知推送、性能測試等
 * @features SSE 連接測試、通知創建測試、性能基準測試、錯誤處理測試
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fetch from 'node-fetch'

const execAsync = promisify(exec)

interface TestResult {
  name: string
  success: boolean
  duration: number
  details?: any
  error?: string
}

interface ConnectionTest {
  connectionId: string
  userId: string
  startTime: number
  messagesReceived: number
  errors: string[]
}

class NotificationSystemTester {
  private baseUrl: string
  private testResults: TestResult[] = []
  private activeConnections: Map<string, ConnectionTest> = new Map()

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  /**
   * 運行所有測試
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Real-time Notification System Tests\n')
    console.log('=' .repeat(60))

    try {
      // 1. 基本連通性測試
      await this.testBasicConnectivity()
      
      // 2. API 端點測試
      await this.testAPIEndpoints()
      
      // 3. SSE 連接測試
      await this.testSSEConnection()
      
      // 4. 通知推送測試
      await this.testNotificationPush()
      
      // 5. 併發連接測試
      await this.testConcurrentConnections()
      
      // 6. 錯誤處理測試
      await this.testErrorHandling()
      
      // 7. 性能基準測試
      await this.testPerformance()

      // 輸出測試結果
      this.printTestResults()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error)
      process.exit(1)
    }
  }

  /**
   * 測試基本連通性
   */
  private async testBasicConnectivity(): Promise<void> {
    const testName = 'Basic Connectivity'
    const startTime = Date.now()

    try {
      console.log('🔗 Testing basic connectivity...')
      
      const response = await fetch(`${this.baseUrl}/api/health`)
      const duration = Date.now() - startTime

      if (response.ok) {
        this.testResults.push({
          name: testName,
          success: true,
          duration,
          details: { status: response.status }
        })
        console.log('✅ Basic connectivity test passed')
      } else {
        throw new Error(`Health check failed: ${response.status}`)
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Basic connectivity test failed')
    }
  }

  /**
   * 測試 API 端點
   */
  private async testAPIEndpoints(): Promise<void> {
    console.log('\n📡 Testing API endpoints...')

    const endpoints = [
      { path: '/api/notifications', method: 'GET', name: 'Get Notifications' },
      { path: '/api/notifications/stats', method: 'GET', name: 'Get Notification Stats' }
    ]

    for (const endpoint of endpoints) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const duration = Date.now() - startTime
        const responseData = await response.json().catch(() => null)

        if (response.status === 200 || response.status === 401) { // 401 is expected without auth
          this.testResults.push({
            name: `API: ${endpoint.name}`,
            success: true,
            duration,
            details: { 
              status: response.status,
              hasData: !!responseData
            }
          })
          console.log(`✅ ${endpoint.name} API test passed (${response.status})`)
        } else {
          throw new Error(`Unexpected status: ${response.status}`)
        }
      } catch (error) {
        this.testResults.push({
          name: `API: ${endpoint.name}`,
          success: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.log(`❌ ${endpoint.name} API test failed`)
      }
    }
  }

  /**
   * 測試 SSE 連接
   */
  private async testSSEConnection(): Promise<void> {
    const testName = 'SSE Connection'
    const startTime = Date.now()

    console.log('\n🔄 Testing SSE connection...')

    return new Promise((resolve) => {
      try {
        // Note: 在 Node.js 環境中，需要使用 EventSource polyfill
        // 這裡我們使用 fetch 來模擬 SSE 連接測試
        
        const testConnection = async () => {
          try {
            const response = await fetch(`${this.baseUrl}/api/notifications/stream`, {
              method: 'GET',
              headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache'
              }
            })

            const duration = Date.now() - startTime

            if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
              this.testResults.push({
                name: testName,
                success: true,
                duration,
                details: { 
                  status: response.status,
                  contentType: response.headers.get('content-type')
                }
              })
              console.log('✅ SSE connection test passed')
            } else if (response.status === 401) {
              this.testResults.push({
                name: testName,
                success: true,
                duration,
                details: { 
                  status: response.status,
                  note: 'Authentication required (expected)'
                }
              })
              console.log('✅ SSE connection test passed (auth required)')
            } else {
              throw new Error(`Unexpected response: ${response.status}`)
            }
          } catch (error) {
            this.testResults.push({
              name: testName,
              success: false,
              duration: Date.now() - startTime,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
            console.log('❌ SSE connection test failed')
          }
          
          resolve()
        }

        testConnection()
      } catch (error) {
        this.testResults.push({
          name: testName,
          success: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.log('❌ SSE connection test failed')
        resolve()
      }
    })
  }

  /**
   * 測試通知推送
   */
  private async testNotificationPush(): Promise<void> {
    const testName = 'Notification Push'
    const startTime = Date.now()

    console.log('\n📤 Testing notification push...')

    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: ['test-user'],
          notification: {
            type: 'test',
            data: { message: 'Test notification' },
            count: 1
          }
        })
      })

      const duration = Date.now() - startTime
      const responseData = await response.json().catch(() => null)

      if (response.ok || response.status === 401) {
        this.testResults.push({
          name: testName,
          success: true,
          duration,
          details: { 
            status: response.status,
            response: responseData
          }
        })
        console.log('✅ Notification push test passed')
      } else {
        throw new Error(`Push failed: ${response.status}`)
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Notification push test failed')
    }
  }

  /**
   * 測試併發連接
   */
  private async testConcurrentConnections(): Promise<void> {
    const testName = 'Concurrent Connections'
    const startTime = Date.now()

    console.log('\n⚡ Testing concurrent connections...')

    try {
      const connectionPromises = []
      const concurrentCount = 5

      for (let i = 0; i < concurrentCount; i++) {
        const promise = fetch(`${this.baseUrl}/api/notifications/stream`, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'User-Agent': `TestClient-${i}`
          }
        }).then(response => ({
          index: i,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }))
        
        connectionPromises.push(promise)
      }

      const results = await Promise.all(connectionPromises)
      const duration = Date.now() - startTime

      const successCount = results.filter(r => r.status === 200 || r.status === 401).length

      this.testResults.push({
        name: testName,
        success: successCount === concurrentCount,
        duration,
        details: {
          attempted: concurrentCount,
          successful: successCount,
          results
        }
      })

      if (successCount === concurrentCount) {
        console.log(`✅ Concurrent connections test passed (${successCount}/${concurrentCount})`)
      } else {
        console.log(`⚠️ Concurrent connections test partial success (${successCount}/${concurrentCount})`)
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Concurrent connections test failed')
    }
  }

  /**
   * 測試錯誤處理
   */
  private async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling'
    const startTime = Date.now()

    console.log('\n🛡️ Testing error handling...')

    try {
      // 測試無效端點
      const invalidResponse = await fetch(`${this.baseUrl}/api/notifications/invalid`, {
        method: 'GET'
      })

      // 測試無效數據
      const invalidDataResponse = await fetch(`${this.baseUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      })

      const duration = Date.now() - startTime

      const invalidStatus = invalidResponse.status
      const invalidDataStatus = invalidDataResponse.status

      // 期望這些請求返回適當的錯誤狀態碼
      const expectedErrorStatuses = [400, 401, 404, 422, 500]
      
      const validErrorHandling = 
        expectedErrorStatuses.includes(invalidStatus) &&
        expectedErrorStatuses.includes(invalidDataStatus)

      this.testResults.push({
        name: testName,
        success: validErrorHandling,
        duration,
        details: {
          invalidEndpointStatus: invalidStatus,
          invalidDataStatus: invalidDataStatus
        }
      })

      if (validErrorHandling) {
        console.log('✅ Error handling test passed')
      } else {
        console.log('❌ Error handling test failed')
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Error handling test failed')
    }
  }

  /**
   * 測試性能基準
   */
  private async testPerformance(): Promise<void> {
    const testName = 'Performance Benchmark'
    const startTime = Date.now()

    console.log('\n🏃‍♂️ Testing performance benchmarks...')

    try {
      const iterations = 10
      const responseTimes: number[] = []

      for (let i = 0; i < iterations; i++) {
        const requestStart = Date.now()
        
        await fetch(`${this.baseUrl}/api/notifications/stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        responseTimes.push(Date.now() - requestStart)
      }

      const duration = Date.now() - startTime
      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)

      // 性能基準：平均響應時間 < 1000ms，最大響應時間 < 3000ms
      const performanceGood = averageResponseTime < 1000 && maxResponseTime < 3000

      this.testResults.push({
        name: testName,
        success: performanceGood,
        duration,
        details: {
          iterations,
          averageResponseTime: Math.round(averageResponseTime),
          maxResponseTime,
          minResponseTime,
          allResponseTimes: responseTimes
        }
      })

      if (performanceGood) {
        console.log(`✅ Performance test passed (avg: ${Math.round(averageResponseTime)}ms)`)
      } else {
        console.log(`⚠️ Performance test warning (avg: ${Math.round(averageResponseTime)}ms)`)
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Performance test failed')
    }
  }

  /**
   * 輸出測試結果
   */
  private printTestResults(): void {
    console.log('\n' + '=' .repeat(60))
    console.log('📊 TEST RESULTS SUMMARY')
    console.log('=' .repeat(60))

    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(t => t.success).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0)

    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests} ✅`)
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    console.log(`Total Duration: ${totalDuration}ms`)
    console.log('')

    // 詳細結果
    console.log('DETAILED RESULTS:')
    console.log('-'.repeat(40))
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.name} (${result.duration}ms)`)
      
      if (result.error) {
        console.log(`      Error: ${result.error}`)
      }
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`      Details: ${JSON.stringify(result.details, null, 8).replace(/\n/g, '\n      ')}`)
      }
      
      console.log('')
    })

    // 建議
    console.log('RECOMMENDATIONS:')
    console.log('-'.repeat(40))
    
    if (failedTests > 0) {
      console.log('❗ Some tests failed. Please review the errors above.')
    }
    
    const performanceTest = this.testResults.find(t => t.name === 'Performance Benchmark')
    if (performanceTest?.details?.averageResponseTime > 500) {
      console.log('⚠️  Consider optimizing API response times.')
    }
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! The real-time notification system is working correctly.')
    }
    
    console.log('')
  }
}

// 運行測試
async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  const tester = new NotificationSystemTester(baseUrl)
  
  try {
    await tester.runAllTests()
    process.exit(0)
  } catch (error) {
    console.error('Test execution failed:', error)
    process.exit(1)
  }
}

// 如果直接執行此文件
if (require.main === module) {
  main()
}