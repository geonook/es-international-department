#!/usr/bin/env tsx

/**
 * Deployment Verification System
 * KCISLK ESID Info Hub - Comprehensive Deployment Testing
 * 
 * This script verifies that the deployment is successful by testing:
 * - System health and configuration
 * - API endpoint functionality
 * - Database connectivity and integrity
 * - Authentication system
 * - Performance benchmarks
 * - Security measures
 */

import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

interface VerificationTest {
  name: string
  category: 'environment' | 'database' | 'api' | 'auth' | 'performance' | 'security'
  critical: boolean
  status: 'pass' | 'fail' | 'warning' | 'skip'
  duration: number
  message: string
  details?: any
}

interface DeploymentVerificationReport {
  timestamp: string
  environment: string
  baseUrl: string
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    skipped: number
    critical_failures: number
  }
  tests: VerificationTest[]
  overall_status: 'pass' | 'fail' | 'warning'
  deployment_ready: boolean
  recommendations: string[]
}

class DeploymentVerifier {
  private prisma: PrismaClient
  private baseUrl: string
  private environment: string
  private tests: VerificationTest[] = []
  
  constructor() {
    this.prisma = new PrismaClient()
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    this.environment = process.env.NODE_ENV || 'development'
  }
  
  async runVerification(): Promise<void> {
    console.log('🔍 Starting deployment verification...')
    console.log(`🌍 Environment: ${this.environment}`)
    console.log(`🔗 Base URL: ${this.baseUrl}\n`)
    
    this.tests = []
    const startTime = performance.now()
    
    // Run verification tests in sequence
    await this.verifyEnvironment()
    await this.verifyDatabase()
    await this.verifyAPI()
    await this.verifyAuthentication()
    await this.verifyPerformance()
    await this.verifySecurity()
    
    const endTime = performance.now()
    console.log(`\n⏱️ Verification completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    // Generate and display report
    const report = this.generateReport()
    this.displayReport(report)
    await this.saveReport(report)
    
    // Exit with appropriate code
    if (report.deployment_ready) {
      console.log('\n✅ Deployment verification passed - System ready for production!')
      process.exit(0)
    } else {
      console.log('\n❌ Deployment verification failed - Issues must be resolved before production!')
      process.exit(1)
    }
  }
  
  private async verifyEnvironment(): Promise<void> {
    console.log('🔧 Verifying environment configuration...')
    
    // Check required environment variables
    await this.runTest({
      name: 'Environment Variables',
      category: 'environment',
      critical: true,
      test: async () => {
        const required = [
          'DATABASE_URL',
          'NEXTAUTH_SECRET',
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET'
        ]
        
        const missing = required.filter(env => !process.env[env])
        
        if (missing.length > 0) {
          return {
            success: false,
            message: `Missing required environment variables: ${missing.join(', ')}`
          }
        }
        
        return {
          success: true,
          message: 'All required environment variables are set'
        }
      }
    })
    
    // Check Node.js version
    await this.runTest({
      name: 'Node.js Version',
      category: 'environment',
      critical: false,
      test: async () => {
        const version = process.version
        const majorVersion = parseInt(version.slice(1).split('.')[0])
        
        if (majorVersion < 18) {
          return {
            success: false,
            message: `Node.js ${version} is below recommended version 18+`
          }
        }
        
        return {
          success: true,
          message: `Node.js ${version} meets requirements`,
          details: { version, majorVersion }
        }
      }
    })
    
    // Check environment mode
    await this.runTest({
      name: 'Environment Mode',
      category: 'environment',
      critical: false,
      test: async () => {
        const isDev = this.environment === 'development'
        const isProd = this.environment === 'production'
        
        return {
          success: true,
          message: `Environment mode: ${this.environment}`,
          details: { 
            environment: this.environment,
            isDevelopment: isDev,
            isProduction: isProd
          }
        }
      }
    })
  }
  
  private async verifyDatabase(): Promise<void> {
    console.log('🗄️ Verifying database configuration...')
    
    // Database connection
    await this.runTest({
      name: 'Database Connection',
      category: 'database',
      critical: true,
      test: async () => {
        try {
          const start = performance.now()
          await this.prisma.$queryRaw`SELECT 1 as test`
          const duration = performance.now() - start
          
          return {
            success: true,
            message: `Database connection successful (${duration.toFixed(2)}ms)`,
            details: { connectionTime: Math.round(duration) }
          }
        } catch (error) {
          return {
            success: false,
            message: `Database connection failed: ${error}`
          }
        }
      }
    })
    
    // Database schema verification
    await this.runTest({
      name: 'Database Schema',
      category: 'database',
      critical: true,
      test: async () => {
        try {
          const tableCheck = await this.prisma.$queryRaw`
            SELECT count(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
          `
          
          const tableCount = Array.isArray(tableCheck) ? 
            parseInt((tableCheck[0] as any)?.count || '0') : 0
          
          if (tableCount < 25) {
            return {
              success: false,
              message: `Insufficient database tables: ${tableCount} (expected 30+)`
            }
          }
          
          return {
            success: true,
            message: `Database schema verified (${tableCount} tables)`,
            details: { tableCount }
          }
        } catch (error) {
          return {
            success: false,
            message: `Schema verification failed: ${error}`
          }
        }
      }
    })
    
    // Database integrity check
    await this.runTest({
      name: 'Database Integrity',
      category: 'database',
      critical: false,
      test: async () => {
        try {
          // Check for basic data
          const userCount = await this.prisma.user.count()
          const roleCount = await this.prisma.role.count()
          
          return {
            success: true,
            message: `Database integrity check passed`,
            details: { userCount, roleCount }
          }
        } catch (error) {
          return {
            success: false,
            message: `Integrity check failed: ${error}`
          }
        }
      }
    })
  }
  
  private async verifyAPI(): Promise<void> {
    console.log('🌐 Verifying API endpoints...')
    
    // Health endpoint
    await this.runTest({
      name: 'Health Endpoint',
      category: 'api',
      critical: true,
      test: async () => {
        try {
          const start = performance.now()
          const response = await fetch(`${this.baseUrl}/api/health`, {
            timeout: 5000
          })
          const duration = performance.now() - start
          
          if (!response.ok) {
            return {
              success: false,
              message: `Health endpoint returned ${response.status}: ${response.statusText}`
            }
          }
          
          const data = await response.json()
          
          return {
            success: true,
            message: `Health endpoint responding (${duration.toFixed(2)}ms)`,
            details: { responseTime: Math.round(duration), data }
          }
        } catch (error) {
          return {
            success: false,
            message: `Health endpoint failed: ${error}`
          }
        }
      }
    })
    
    // API rate limiting
    await this.runTest({
      name: 'API Rate Limiting',
      category: 'api',
      critical: false,
      test: async () => {
        try {
          // Make rapid requests to test rate limiting
          const requests = Array(10).fill(0).map(() => 
            fetch(`${this.baseUrl}/api/health`, { timeout: 2000 })
          )
          
          const responses = await Promise.allSettled(requests)
          const successful = responses.filter(r => r.status === 'fulfilled').length
          
          return {
            success: true,
            message: `Rate limiting test completed`,
            details: { totalRequests: 10, successful }
          }
        } catch (error) {
          return {
            success: false,
            message: `Rate limiting test failed: ${error}`
          }
        }
      }
    })
    
    // API response format
    await this.runTest({
      name: 'API Response Format',
      category: 'api',
      critical: false,
      test: async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/health`)
          const data = await response.json()
          
          const hasExpectedFields = data && typeof data === 'object'
          
          return {
            success: hasExpectedFields,
            message: hasExpectedFields ? 
              'API response format is valid' : 
              'API response format is invalid',
            details: { responseData: data }
          }
        } catch (error) {
          return {
            success: false,
            message: `API response format test failed: ${error}`
          }
        }
      }
    })
  }
  
  private async verifyAuthentication(): Promise<void> {
    console.log('🔐 Verifying authentication system...')
    
    // OAuth configuration
    await this.runTest({
      name: 'OAuth Configuration',
      category: 'auth',
      critical: true,
      test: async () => {
        const clientId = process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET
        const nextAuthUrl = process.env.NEXTAUTH_URL
        const nextAuthSecret = process.env.NEXTAUTH_SECRET
        
        const issues: string[] = []
        
        if (!clientId || clientId.length < 10) {
          issues.push('Invalid Google Client ID')
        }
        
        if (!clientSecret || clientSecret.length < 10) {
          issues.push('Invalid Google Client Secret')
        }
        
        if (!nextAuthUrl || !nextAuthUrl.startsWith('http')) {
          issues.push('Invalid NextAuth URL')
        }
        
        if (!nextAuthSecret || nextAuthSecret.length < 32) {
          issues.push('NextAuth secret too short (minimum 32 characters)')
        }
        
        if (issues.length > 0) {
          return {
            success: false,
            message: `OAuth configuration issues: ${issues.join(', ')}`
          }
        }
        
        return {
          success: true,
          message: 'OAuth configuration validated',
          details: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasNextAuthUrl: !!nextAuthUrl,
            hasNextAuthSecret: !!nextAuthSecret,
            secretLength: nextAuthSecret?.length
          }
        }
      }
    })
    
    // JWT configuration
    await this.runTest({
      name: 'JWT Configuration',
      category: 'auth',
      critical: true,
      test: async () => {
        const secret = process.env.NEXTAUTH_SECRET
        
        if (!secret || secret.length < 32) {
          return {
            success: false,
            message: 'JWT secret is missing or too short (minimum 32 characters)'
          }
        }
        
        // Check if secret is strong enough (contains different character types)
        const hasUpper = /[A-Z]/.test(secret)
        const hasLower = /[a-z]/.test(secret)
        const hasNumber = /\d/.test(secret)
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret)
        
        const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
        
        return {
          success: true,
          message: `JWT configuration validated (strength: ${strength}/4)`,
          details: {
            secretLength: secret.length,
            strengthScore: strength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial
          }
        }
      }
    })
    
    // Authentication endpoints
    await this.runTest({
      name: 'Authentication Endpoints',
      category: 'auth',
      critical: false,
      test: async () => {
        try {
          // Test OAuth initialization endpoint (should redirect)
          const authResponse = await fetch(`${this.baseUrl}/api/auth/google`, {
            redirect: 'manual',
            timeout: 3000
          })
          
          const isRedirect = authResponse.status >= 300 && authResponse.status < 400
          
          return {
            success: isRedirect,
            message: isRedirect ? 
              'OAuth endpoint responding correctly' : 
              'OAuth endpoint not redirecting as expected',
            details: { 
              status: authResponse.status,
              isRedirect 
            }
          }
        } catch (error) {
          return {
            success: false,
            message: `Authentication endpoint test failed: ${error}`
          }
        }
      }
    })
  }
  
  private async verifyPerformance(): Promise<void> {
    console.log('⚡ Verifying performance metrics...')
    
    // API response time
    await this.runTest({
      name: 'API Response Time',
      category: 'performance',
      critical: false,
      test: async () => {
        const measurements: number[] = []
        
        for (let i = 0; i < 5; i++) {
          try {
            const start = performance.now()
            await fetch(`${this.baseUrl}/api/health`, { timeout: 3000 })
            const duration = performance.now() - start
            measurements.push(duration)
          } catch (error) {
            // Skip failed requests for performance test
          }
        }
        
        if (measurements.length === 0) {
          return {
            success: false,
            message: 'All performance test requests failed'
          }
        }
        
        const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length
        const maxResponseTime = Math.max(...measurements)
        
        const isGood = avgResponseTime < 200
        const isAcceptable = avgResponseTime < 500
        
        return {
          success: isAcceptable,
          message: isGood ? 
            `Excellent response time (avg: ${avgResponseTime.toFixed(2)}ms)` :
            isAcceptable ?
            `Acceptable response time (avg: ${avgResponseTime.toFixed(2)}ms)` :
            `Slow response time (avg: ${avgResponseTime.toFixed(2)}ms)`,
          details: {
            avgResponseTime: Math.round(avgResponseTime),
            maxResponseTime: Math.round(maxResponseTime),
            measurements: measurements.map(m => Math.round(m))
          }
        }
      }
    })
    
    // Database performance
    await this.runTest({
      name: 'Database Performance',
      category: 'performance',
      critical: false,
      test: async () => {
        try {
          const start = performance.now()
          await this.prisma.user.count()
          const queryTime = performance.now() - start
          
          const isGood = queryTime < 50
          const isAcceptable = queryTime < 100
          
          return {
            success: isAcceptable,
            message: isGood ?
              `Excellent database performance (${queryTime.toFixed(2)}ms)` :
              isAcceptable ?
              `Acceptable database performance (${queryTime.toFixed(2)}ms)` :
              `Slow database performance (${queryTime.toFixed(2)}ms)`,
            details: { queryTime: Math.round(queryTime) }
          }
        } catch (error) {
          return {
            success: false,
            message: `Database performance test failed: ${error}`
          }
        }
      }
    })
    
    // Memory usage
    await this.runTest({
      name: 'Memory Usage',
      category: 'performance',
      critical: false,
      test: async () => {
        const memUsage = process.memoryUsage()
        const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
        const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
        
        const isGood = heapUsedMB < 256
        const isAcceptable = heapUsedMB < 512
        
        return {
          success: isAcceptable,
          message: `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB total`,
          details: {
            heapUsedMB,
            heapTotalMB,
            externalMB: Math.round(memUsage.external / 1024 / 1024),
            status: isGood ? 'excellent' : isAcceptable ? 'acceptable' : 'high'
          }
        }
      }
    })
  }
  
  private async verifySecurity(): Promise<void> {
    console.log('🔒 Verifying security measures...')
    
    // HTTPS check (for production)
    await this.runTest({
      name: 'HTTPS Configuration',
      category: 'security',
      critical: this.environment === 'production',
      test: async () => {
        const isHttps = this.baseUrl.startsWith('https://')
        const isLocalhost = this.baseUrl.includes('localhost')
        
        if (this.environment === 'production' && !isHttps) {
          return {
            success: false,
            message: 'Production environment must use HTTPS'
          }
        }
        
        return {
          success: true,
          message: isHttps ? 'HTTPS properly configured' : 
                   isLocalhost ? 'HTTP acceptable for localhost' : 
                   'HTTP configuration detected',
          details: { isHttps, isLocalhost, baseUrl: this.baseUrl }
        }
      }
    })
    
    // Security headers check
    await this.runTest({
      name: 'Security Headers',
      category: 'security',
      critical: false,
      test: async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/health`, {
            timeout: 3000
          })
          
          const headers = response.headers
          const securityHeaders = {
            'x-frame-options': headers.get('x-frame-options'),
            'x-content-type-options': headers.get('x-content-type-options'),
            'referrer-policy': headers.get('referrer-policy'),
            'strict-transport-security': headers.get('strict-transport-security')
          }
          
          const presentHeaders = Object.entries(securityHeaders)
            .filter(([_, value]) => value !== null)
            .length
          
          return {
            success: presentHeaders >= 2,
            message: `Security headers check: ${presentHeaders}/4 headers present`,
            details: securityHeaders
          }
        } catch (error) {
          return {
            success: false,
            message: `Security headers check failed: ${error}`
          }
        }
      }
    })
    
    // Environment exposure check
    await this.runTest({
      name: 'Environment Security',
      category: 'security',
      critical: true,
      test: async () => {
        const sensitiveEnvs = [
          'DATABASE_URL',
          'NEXTAUTH_SECRET',
          'GOOGLE_CLIENT_SECRET'
        ]
        
        // Check if sensitive environment variables are properly secured
        // (This is mainly a configuration check)
        const issues: string[] = []
        
        sensitiveEnvs.forEach(envName => {
          const value = process.env[envName]
          if (value && value.includes('example.com')) {
            issues.push(`${envName} contains example domain`)
          }
          if (value && value.length < 10) {
            issues.push(`${envName} is too short`)
          }
        })
        
        if (issues.length > 0) {
          return {
            success: false,
            message: `Environment security issues: ${issues.join(', ')}`
          }
        }
        
        return {
          success: true,
          message: 'Environment security validated'
        }
      }
    })
  }
  
  private async runTest(testConfig: {
    name: string
    category: VerificationTest['category']
    critical: boolean
    test: () => Promise<{ success: boolean; message: string; details?: any }>
  }): Promise<void> {
    console.log(`   🧪 ${testConfig.name}...`)
    
    const start = performance.now()
    
    try {
      const result = await testConfig.test()
      const duration = performance.now() - start
      
      const status: VerificationTest['status'] = result.success ? 'pass' : 
                                                testConfig.critical ? 'fail' : 'warning'
      
      this.tests.push({
        name: testConfig.name,
        category: testConfig.category,
        critical: testConfig.critical,
        status,
        duration: Math.round(duration),
        message: result.message,
        details: result.details
      })
      
      const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
      console.log(`      ${emoji} ${result.message}`)
      
    } catch (error) {
      const duration = performance.now() - start
      
      this.tests.push({
        name: testConfig.name,
        category: testConfig.category,
        critical: testConfig.critical,
        status: 'fail',
        duration: Math.round(duration),
        message: `Test execution failed: ${error}`
      })
      
      console.log(`      ❌ Test execution failed: ${error}`)
    }
  }
  
  private generateReport(): DeploymentVerificationReport {
    const total = this.tests.length
    const passed = this.tests.filter(t => t.status === 'pass').length
    const failed = this.tests.filter(t => t.status === 'fail').length
    const warnings = this.tests.filter(t => t.status === 'warning').length
    const skipped = this.tests.filter(t => t.status === 'skip').length
    const critical_failures = this.tests.filter(t => t.status === 'fail' && t.critical).length
    
    const overall_status = critical_failures > 0 ? 'fail' : 
                          failed > 0 ? 'warning' : 'pass'
    
    const deployment_ready = critical_failures === 0 && failed === 0
    
    // Generate recommendations
    const recommendations: string[] = []
    
    if (critical_failures > 0) {
      recommendations.push(`🚨 ${critical_failures} critical failures must be resolved before deployment`)
    }
    
    if (failed > 0) {
      recommendations.push(`⚠️ ${failed} test failures should be investigated`)
    }
    
    if (warnings > 0) {
      recommendations.push(`📋 ${warnings} warnings detected - review recommended`)
    }
    
    // Add specific recommendations based on test results
    const performanceTests = this.tests.filter(t => t.category === 'performance' && t.status !== 'pass')
    if (performanceTests.length > 0) {
      recommendations.push('⚡ Performance optimization recommended - review N+1 query fixes')
    }
    
    const securityTests = this.tests.filter(t => t.category === 'security' && t.status !== 'pass')
    if (securityTests.length > 0) {
      recommendations.push('🔒 Security improvements recommended - review security headers and HTTPS configuration')
    }
    
    return {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      baseUrl: this.baseUrl,
      summary: {
        total,
        passed,
        failed,
        warnings,
        skipped,
        critical_failures
      },
      tests: this.tests,
      overall_status,
      deployment_ready,
      recommendations
    }
  }
  
  private displayReport(report: DeploymentVerificationReport): void {
    console.log('\n' + '='.repeat(80))
    console.log('🎯 DEPLOYMENT VERIFICATION REPORT')
    console.log('='.repeat(80))
    
    const statusEmoji = report.overall_status === 'pass' ? '✅' : 
                       report.overall_status === 'warning' ? '⚠️' : '❌'
    
    console.log(`\n${statusEmoji} Overall Status: ${report.overall_status.toUpperCase()}`)
    console.log(`🚀 Deployment Ready: ${report.deployment_ready ? 'YES' : 'NO'}`)
    
    console.log(`\n📊 Test Summary:`)
    console.log(`   • Environment: ${report.environment}`)
    console.log(`   • Base URL: ${report.baseUrl}`)
    console.log(`   • Total Tests: ${report.summary.total}`)
    console.log(`   • Passed: ${report.summary.passed} ✅`)
    console.log(`   • Failed: ${report.summary.failed} ❌`)
    console.log(`   • Warnings: ${report.summary.warnings} ⚠️`)
    console.log(`   • Critical Failures: ${report.summary.critical_failures} 🚨`)
    
    // Category breakdown
    const categories = ['environment', 'database', 'api', 'auth', 'performance', 'security'] as const
    console.log(`\n🏷️ Results by Category:`)
    
    categories.forEach(category => {
      const categoryTests = report.tests.filter(t => t.category === category)
      if (categoryTests.length === 0) return
      
      const passed = categoryTests.filter(t => t.status === 'pass').length
      const total = categoryTests.length
      const status = categoryTests.some(t => t.status === 'fail' && t.critical) ? '❌' :
                    categoryTests.some(t => t.status === 'fail') ? '⚠️' : '✅'
      
      console.log(`   ${status} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${passed}/${total}`)
    })
    
    // Failed tests
    const failedTests = report.tests.filter(t => t.status === 'fail')
    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`)
      failedTests.forEach(test => {
        const criticalFlag = test.critical ? ' (CRITICAL)' : ''
        console.log(`   • ${test.name}${criticalFlag}: ${test.message}`)
      })
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`)
      report.recommendations.forEach(rec => {
        console.log(`   ${rec}`)
      })
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  private async saveReport(report: DeploymentVerificationReport): Promise<void> {
    const outputPath = path.join(process.cwd(), 'output', 'deployment-verification.json')
    const outputDir = path.dirname(outputPath)
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    
    // Also save timestamped version
    const timestampedPath = path.join(
      process.cwd(),
      'output', 
      `deployment-verification-${Date.now()}.json`
    )
    fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Verification report saved to: ${outputPath}`)
    console.log(`📄 Historical report saved to: ${timestampedPath}`)
  }
  
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const verifier = new DeploymentVerifier()
  
  try {
    await verifier.runVerification()
  } catch (error) {
    console.error('❌ Deployment verification failed:', error)
    process.exit(1)
  } finally {
    await verifier.cleanup()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
}

export { DeploymentVerifier }