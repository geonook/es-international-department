/**
 * Quick API Health Check
 * 
 * @description Quick validation of API endpoints without requiring full setup
 * @author Claude Code | API Testing Specialist
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fetch from 'node-fetch'

const execAsync = promisify(exec)

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url: string, options: any = {}) {
  const { timeout = 5000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Configuration
const BASE_URL = 'http://localhost:3000'
const ENDPOINTS_TO_CHECK = [
  '/api/email/send',
  '/api/email/test', 
  '/api/notifications',
  '/api/admin/events',
  '/api/announcements'
]

async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    })
    return response.ok
  } catch {
    try {
      // Try root endpoint if health endpoint doesn't exist
      const response = await fetchWithTimeout(BASE_URL, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }
}

async function quickEndpointCheck(endpoint: string): Promise<{endpoint: string, status: string, statusCode?: number, error?: string}> {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    return {
      endpoint,
      status: response.ok ? 'HEALTHY' : response.status === 401 ? 'AUTH_REQUIRED' : 'ERROR',
      statusCode: response.status
    }
  } catch (error) {
    return {
      endpoint,
      status: 'UNREACHABLE',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function main() {
  console.log('🚑 Quick API Health Check')
  console.log('==========================')
  console.log('Time:', new Date().toLocaleString())
  console.log('Target:', BASE_URL)
  
  // Check if server is running
  console.log('\n🔍 Checking server status...')
  const serverRunning = await checkServerStatus()
  
  if (!serverRunning) {
    console.log('🚨 Server is not running or unreachable')
    console.log('\n🛠️  To start the server:')
    console.log('   npm run dev     # Development mode')
    console.log('   npm start       # Production mode')
    return
  }
  
  console.log('✅ Server is running')
  
  // Quick check of key endpoints
  console.log('\n📡 Checking API endpoints...')
  const results = []
  
  for (const endpoint of ENDPOINTS_TO_CHECK) {
    console.log(`Checking ${endpoint}...`)
    const result = await quickEndpointCheck(endpoint)
    results.push(result)
    
    const statusIcon = result.status === 'HEALTHY' ? '✅' : 
                      result.status === 'AUTH_REQUIRED' ? '🔑' :
                      result.status === 'ERROR' ? '⚠️ ' : '❌'
    
    console.log(`  ${statusIcon} ${result.status} ${result.statusCode ? `(${result.statusCode})` : ''}`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
  }
  
  // Summary
  const healthy = results.filter(r => r.status === 'HEALTHY').length
  const authRequired = results.filter(r => r.status === 'AUTH_REQUIRED').length
  const errors = results.filter(r => r.status === 'ERROR').length
  const unreachable = results.filter(r => r.status === 'UNREACHABLE').length
  
  console.log('\n📊 Summary:')
  console.log(`  ✅ Healthy: ${healthy}`)
  console.log(`  🔑 Auth Required: ${authRequired}`)
  console.log(`  ⚠️  Errors: ${errors}`)
  console.log(`  ❌ Unreachable: ${unreachable}`)
  
  const totalFunctional = healthy + authRequired
  const healthPercentage = ((totalFunctional / results.length) * 100).toFixed(1)
  
  console.log(`\n🎯 Overall Health: ${healthPercentage}%`)
  
  if (totalFunctional === results.length) {
    console.log('✨ All APIs are responding correctly!')
    console.log('\n🚀 Ready for comprehensive testing:')
    console.log('   npm run test:api-health')
  } else if (errors > 0 || unreachable > 0) {
    console.log('🚨 Some APIs need attention before full testing')
    console.log('\n🔧 Recommended actions:')
    if (unreachable > 0) {
      console.log('   - Check if all API routes are properly defined')
    }
    if (errors > 0) {
      console.log('   - Review server logs for error details')
    }
  } else {
    console.log('🔑 APIs require authentication for full testing')
    console.log('\n🔑 To test with authentication:')
    console.log('   export TEST_AUTH_TOKEN="your-token-here"')
    console.log('   npm run test:api-health')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { main as quickHealthCheck }