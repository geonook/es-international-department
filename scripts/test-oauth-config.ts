#!/usr/bin/env tsx

/**
 * Google OAuth Configuration Test Script
 * Google OAuth 配置測試腳本
 */

import { validateGoogleOAuthConfig, generateGoogleAuthUrl, generateSecureState } from '../lib/google-oauth'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
}

class OAuthConfigTester {
  private results: TestResult[] = []

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string) {
    this.results.push({ test, status, message })
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warn: '\x1b[33m'     // yellow
    }
    const reset = '\x1b[0m'
    console.log(`${colors[type]}${message}${reset}`)
  }

  async testEnvironmentVariables() {
    this.log('\n🔧 Testing Environment Variables...', 'info')
    
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL'
    ]

    let allPresent = true

    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        this.addResult(
          `Environment Variable: ${varName}`,
          'FAIL',
          'Missing required environment variable'
        )
        allPresent = false
      } else {
        // 隱藏敏感資訊，只顯示前幾個字符
        const displayValue = varName.includes('SECRET') 
          ? `${value.substring(0, 8)}...` 
          : value.length > 50 
            ? `${value.substring(0, 30)}...` 
            : value

        this.addResult(
          `Environment Variable: ${varName}`,
          'PASS',
          `Found: ${displayValue}`
        )
      }
    }

    return allPresent
  }

  async testOAuthConfiguration() {
    this.log('\n🔐 Testing OAuth Configuration...', 'info')
    
    try {
      const isValid = validateGoogleOAuthConfig()
      
      if (isValid) {
        this.addResult(
          'OAuth Config Validation',
          'PASS',
          'Google OAuth configuration is valid'
        )
        return true
      } else {
        this.addResult(
          'OAuth Config Validation',
          'FAIL',
          'Google OAuth configuration is invalid or incomplete'
        )
        return false
      }
    } catch (error) {
      this.addResult(
        'OAuth Config Validation',
        'FAIL',
        `Error validating config: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
  }

  async testAuthUrlGeneration() {
    this.log('\n🔗 Testing Auth URL Generation...', 'info')
    
    try {
      const state = generateSecureState()
      const authUrl = generateGoogleAuthUrl(state)
      
      // 驗證 URL 格式
      const url = new URL(authUrl)
      const expectedParams = ['client_id', 'redirect_uri', 'response_type', 'scope', 'state']
      
      let validParams = true
      for (const param of expectedParams) {
        if (!url.searchParams.has(param)) {
          this.addResult(
            `Auth URL Parameter: ${param}`,
            'FAIL',
            'Missing required parameter'
          )
          validParams = false
        } else {
          this.addResult(
            `Auth URL Parameter: ${param}`,
            'PASS',
            `Present: ${url.searchParams.get(param)?.substring(0, 30)}...`
          )
        }
      }

      if (validParams) {
        this.addResult(
          'Auth URL Generation',
          'PASS',
          `Generated valid OAuth URL: ${authUrl.substring(0, 80)}...`
        )
        return true
      }
      
      return false
    } catch (error) {
      this.addResult(
        'Auth URL Generation',
        'FAIL',
        `Error generating auth URL: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
  }

  async testDatabaseConnection() {
    this.log('\n💾 Testing Database Connection...', 'info')
    
    try {
      // 動態導入 Prisma client 以避免在沒有環境變數時出錯
      const { prisma } = await import('../lib/prisma')
      
      // 測試資料庫連接
      await prisma.$queryRaw`SELECT 1`
      
      this.addResult(
        'Database Connection',
        'PASS',
        'Successfully connected to database'
      )

      // 檢查必要的表格是否存在
      const tables = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'accounts', 'roles', 'user_roles')
      `

      const requiredTables = ['users', 'accounts', 'roles', 'user_roles']
      const existingTables = tables.map(t => t.table_name)
      
      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          this.addResult(
            `Database Table: ${table}`,
            'PASS',
            'Table exists'
          )
        } else {
          this.addResult(
            `Database Table: ${table}`,
            'FAIL',
            'Table missing - run database migration'
          )
        }
      }

      await prisma.$disconnect()
      return true
    } catch (error) {
      this.addResult(
        'Database Connection',
        'FAIL',
        `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
  }

  async testRoleAssignmentLogic() {
    this.log('\n👥 Testing Role Assignment Logic...', 'info')
    
    try {
      const { assignRoleByEmailDomain } = await import('../lib/google-oauth')
      
      const testCases = [
        { email: 'teacher@school.edu', expectedRole: 'teacher' },
        { email: 'prof@university.edu', expectedRole: 'teacher' },
        { email: 'parent@gmail.com', expectedRole: 'parent' },
        { email: 'user@yahoo.com', expectedRole: 'parent' },
        { email: 'unknown@example.com', expectedRole: 'parent' }
      ]

      let allPassed = true
      for (const testCase of testCases) {
        const assignedRole = assignRoleByEmailDomain(testCase.email)
        
        if (assignedRole === testCase.expectedRole) {
          this.addResult(
            `Role Assignment: ${testCase.email}`,
            'PASS',
            `Correctly assigned role: ${assignedRole}`
          )
        } else {
          this.addResult(
            `Role Assignment: ${testCase.email}`,
            'FAIL',
            `Expected: ${testCase.expectedRole}, Got: ${assignedRole}`
          )
          allPassed = false
        }
      }

      return allPassed
    } catch (error) {
      this.addResult(
        'Role Assignment Logic',
        'FAIL',
        `Error testing role assignment: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
  }

  printResults() {
    this.log('\n📊 Test Results Summary', 'info')
    this.log('=' * 50, 'info')
    
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : '❌'
      const color = result.status === 'PASS' ? 'success' : 'error'
      this.log(`${icon} ${result.test}: ${result.message}`, color)
    }

    this.log('\n' + '=' * 50, 'info')
    this.log(`Total Tests: ${total}`, 'info')
    this.log(`Passed: ${passed}`, 'success')
    if (failed > 0) {
      this.log(`Failed: ${failed}`, 'error')
    }
    
    const passRate = ((passed / total) * 100).toFixed(1)
    if (failed === 0) {
      this.log(`\n🎉 All tests passed! (${passRate}%)`, 'success')
      this.log('✅ Google OAuth system is ready for testing!', 'success')
    } else {
      this.log(`\n⚠️  Pass rate: ${passRate}%`, 'warn')
      this.log('❌ Please fix the failing tests before proceeding.', 'error')
    }

    return failed === 0
  }

  async runAllTests(): Promise<boolean> {
    this.log('🚀 Starting Google OAuth Configuration Tests...', 'info')
    
    const tests = [
      () => this.testEnvironmentVariables(),
      () => this.testOAuthConfiguration(),
      () => this.testAuthUrlGeneration(),
      () => this.testDatabaseConnection(),
      () => this.testRoleAssignmentLogic()
    ]

    let allPassed = true
    for (const test of tests) {
      try {
        const result = await test()
        if (!result) allPassed = false
      } catch (error) {
        this.log(`Test failed with error: ${error}`, 'error')
        allPassed = false
      }
    }

    return this.printResults()
  }
}

// 執行測試
async function main() {
  const tester = new OAuthConfigTester()
  const success = await tester.runAllTests()
  
  if (success) {
    console.log('\n🎯 Next Steps:')
    console.log('1. Set up Google Developer Console credentials')
    console.log('2. Configure environment variables')
    console.log('3. Test OAuth flow in browser: http://localhost:3000/login')
    process.exit(0)
  } else {
    console.log('\n🔧 Fix the failing tests and run again')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { OAuthConfigTester }