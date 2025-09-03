#!/usr/bin/env tsx

/**
 * Test Suite Runner
 * 測試套件執行器
 * 
 * This script orchestrates the execution of all test types
 * and provides comprehensive reporting
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface TestResult {
  suite: string
  passed: boolean
  duration: number
  coverage?: number
  details: string
}

class TestRunner {
  private results: TestResult[] = []
  
  async runTestSuite(): Promise<void> {
    console.log('🚀 Starting comprehensive test suite...\n')
    
    // Run different test types
    await this.runUnitTests()
    await this.runIntegrationTests()
    await this.runAPITests()
    await this.runSecurityTests()
    
    // Generate summary report
    this.generateSummaryReport()
  }
  
  private async runUnitTests(): Promise<void> {
    console.log('📊 Running unit tests...')
    try {
      const startTime = Date.now()
      const output = execSync('npm run test:unit -- --passWithNoTests', {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      const duration = Date.now() - startTime
      
      this.results.push({
        suite: 'Unit Tests',
        passed: true,
        duration,
        details: output
      })
      
      console.log('✅ Unit tests passed\n')
    } catch (error: any) {
      const duration = Date.now() - Date.now()
      this.results.push({
        suite: 'Unit Tests',
        passed: false,
        duration,
        details: error.stdout || error.message
      })
      
      console.log('❌ Unit tests failed')
      console.log(error.stdout || error.message)
      console.log()
    }
  }
  
  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running integration tests...')
    try {
      const startTime = Date.now()
      const output = execSync('npm run test:integration -- --passWithNoTests', {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      const duration = Date.now() - startTime
      
      this.results.push({
        suite: 'Integration Tests',
        passed: true,
        duration,
        details: output
      })
      
      console.log('✅ Integration tests passed\n')
    } catch (error: any) {
      const duration = Date.now() - Date.now()
      this.results.push({
        suite: 'Integration Tests',
        passed: false,
        duration,
        details: error.stdout || error.message
      })
      
      console.log('❌ Integration tests failed')
      console.log(error.stdout || error.message)
      console.log()
    }
  }
  
  private async runAPITests(): Promise<void> {
    console.log('🌐 Running API tests...')
    try {
      const startTime = Date.now()
      const output = execSync('npm run test -- tests/api --passWithNoTests', {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      const duration = Date.now() - startTime
      
      this.results.push({
        suite: 'API Tests',
        passed: true,
        duration,
        details: output
      })
      
      console.log('✅ API tests passed\n')
    } catch (error: any) {
      const duration = Date.now() - Date.now()
      this.results.push({
        suite: 'API Tests',
        passed: false,
        duration,
        details: error.stdout || error.message
      })
      
      console.log('❌ API tests failed')
      console.log(error.stdout || error.message)
      console.log()
    }
  }
  
  private async runSecurityTests(): Promise<void> {
    console.log('🔒 Running security tests...')
    try {
      const startTime = Date.now()
      
      // Run npm audit
      console.log('  - Running npm audit...')
      const auditOutput = execSync('npm audit --audit-level moderate', {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      // Run ESLint security rules
      console.log('  - Running ESLint security checks...')
      const lintOutput = execSync('npx eslint . --ext .ts,.tsx --quiet', {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = Date.now() - startTime
      
      this.results.push({
        suite: 'Security Tests',
        passed: true,
        duration,
        details: `Audit: ${auditOutput}\nLint: ${lintOutput}`
      })
      
      console.log('✅ Security tests passed\n')
    } catch (error: any) {
      const duration = Date.now() - Date.now()
      this.results.push({
        suite: 'Security Tests',
        passed: false,
        duration,
        details: error.stdout || error.message
      })
      
      console.log('⚠️  Security tests found issues')
      console.log(error.stdout || error.message)
      console.log()
    }
  }
  
  private generateSummaryReport(): void {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    
    console.log('📋 Test Suite Summary')
    console.log('='.repeat(50))
    console.log(`Total Test Suites: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log()
    
    // Detail breakdown
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌'
      const duration = (result.duration / 1000).toFixed(2)
      console.log(`${status} ${result.suite}: ${duration}s`)
    })
    
    console.log()
    
    // Generate JSON report
    this.generateJSONReport()
    
    if (failedTests > 0) {
      console.log('❌ Some test suites failed. Please review the output above.')
      process.exit(1)
    } else {
      console.log('🎉 All test suites passed successfully!')
    }
  }
  
  private generateJSONReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
      },
      results: this.results
    }
    
    // Ensure test-results directory exists
    const resultsDir = path.join(process.cwd(), 'test-results')
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    }
    
    const reportPath = path.join(resultsDir, 'test-summary.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📄 Test report saved to: ${reportPath}`)
  }
}

// Run the test suite
async function main() {
  const runner = new TestRunner()
  await runner.runTestSuite()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  })
}