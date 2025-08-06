#!/usr/bin/env tsx

/**
 * Production Deployment Verification Script
 * 生產環境部署驗證腳本
 * 
 * This script verifies that the OAuth system is properly configured for production
 * 此腳本驗證 OAuth 系統是否正確配置用於生產環境
 */

import { z } from 'zod'
import chalk from 'chalk'

interface VerificationTest {
  name: string
  status: 'pass' | 'fail' | 'pending'
  message: string
  critical: boolean
}

class ProductionDeploymentVerifier {
  private tests: VerificationTest[] = []
  private readonly PRODUCTION_URL = 'https://landing-app-v2.zeabur.app'

  constructor() {
    console.log(chalk.blue.bold('🚀 Production Deployment Verification'))
    console.log(chalk.blue('====================================='))
    console.log(chalk.gray(`Target: ${this.PRODUCTION_URL}\n`))
  }

  private addTest(test: VerificationTest) {
    this.tests.push(test)
  }

  private async testHTTPSConnection() {
    console.log(chalk.yellow('🔒 Testing HTTPS Connection...'))
    
    try {
      const response = await fetch(this.PRODUCTION_URL, { method: 'HEAD' })
      
      if (response.ok) {
        this.addTest({
          name: 'HTTPS Connection',
          status: 'pass',
          message: 'Successfully connected over HTTPS',
          critical: true
        })
      } else {
        this.addTest({
          name: 'HTTPS Connection',
          status: 'fail',
          message: `HTTP ${response.status}: ${response.statusText}`,
          critical: true
        })
      }
    } catch (error) {
      this.addTest({
        name: 'HTTPS Connection',
        status: 'fail',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        critical: true
      })
    }
  }

  private async testHealthEndpoint() {
    console.log(chalk.yellow('💓 Testing Health Endpoint...'))
    
    try {
      const response = await fetch(`${this.PRODUCTION_URL}/api/health`)
      
      if (response.ok) {
        const data = await response.json()
        this.addTest({
          name: 'Health Endpoint',
          status: 'pass',
          message: `API healthy: ${data.status || 'OK'}`,
          critical: true
        })
      } else {
        this.addTest({
          name: 'Health Endpoint',
          status: 'fail',
          message: `Health check failed: ${response.status}`,
          critical: true
        })
      }
    } catch (error) {
      this.addTest({
        name: 'Health Endpoint',
        status: 'fail',
        message: `Health endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        critical: true
      })
    }
  }

  private async testOAuthEndpoint() {
    console.log(chalk.yellow('🔑 Testing OAuth Endpoint...'))
    
    try {
      const response = await fetch(`${this.PRODUCTION_URL}/api/auth/google`, { method: 'HEAD' })
      
      // OAuth endpoint should redirect or return 302/200
      if (response.status === 200 || response.status === 302) {
        this.addTest({
          name: 'OAuth Endpoint',
          status: 'pass',
          message: 'OAuth endpoint responding correctly',
          critical: true
        })
      } else {
        this.addTest({
          name: 'OAuth Endpoint',
          status: 'fail',
          message: `OAuth endpoint error: ${response.status}`,
          critical: true
        })
      }
    } catch (error) {
      this.addTest({
        name: 'OAuth Endpoint',
        status: 'fail',
        message: `OAuth endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        critical: true
      })
    }
  }

  private async testSecurityHeaders() {
    console.log(chalk.yellow('🛡️  Testing Security Headers...'))
    
    try {
      const response = await fetch(this.PRODUCTION_URL, { method: 'HEAD' })
      const headers = response.headers

      // Check for security headers
      const securityHeaders = [
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ]

      let foundHeaders = 0
      securityHeaders.forEach(header => {
        if (headers.get(header)) {
          foundHeaders++
        }
      })

      if (foundHeaders >= 2) {
        this.addTest({
          name: 'Security Headers',
          status: 'pass',
          message: `${foundHeaders}/${securityHeaders.length} security headers present`,
          critical: false
        })
      } else {
        this.addTest({
          name: 'Security Headers',
          status: 'fail',
          message: `Only ${foundHeaders}/${securityHeaders.length} security headers found`,
          critical: false
        })
      }
    } catch (error) {
      this.addTest({
        name: 'Security Headers',
        status: 'fail',
        message: 'Could not check security headers',
        critical: false
      })
    }
  }

  private validateEnvironmentForProduction() {
    console.log(chalk.yellow('📋 Validating Environment Configuration...'))

    // Check NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      this.addTest({
        name: 'Environment Mode',
        status: 'pass',
        message: 'NODE_ENV set to production',
        critical: true
      })
    } else {
      this.addTest({
        name: 'Environment Mode',
        status: 'fail',
        message: `NODE_ENV is '${process.env.NODE_ENV}', should be 'production'`,
        critical: true
      })
    }

    // Check NEXTAUTH_URL
    if (process.env.NEXTAUTH_URL === this.PRODUCTION_URL) {
      this.addTest({
        name: 'NextAuth URL',
        status: 'pass',
        message: 'NEXTAUTH_URL matches production domain',
        critical: true
      })
    } else {
      this.addTest({
        name: 'NextAuth URL',
        status: 'fail',
        message: `NEXTAUTH_URL is '${process.env.NEXTAUTH_URL}', should be '${this.PRODUCTION_URL}'`,
        critical: true
      })
    }

    // Check Google OAuth configuration
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (clientId && clientId.includes('.apps.googleusercontent.com') && 
        !clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      this.addTest({
        name: 'Google Client ID',
        status: 'pass',
        message: 'Valid Google OAuth Client ID configured',
        critical: true
      })
    } else {
      this.addTest({
        name: 'Google Client ID',
        status: 'fail',
        message: 'Google OAuth Client ID not properly configured',
        critical: true
      })
    }

    if (clientSecret && clientSecret.startsWith('GOCSPX-') && 
        !clientSecret.includes('YOUR_GOOGLE_CLIENT_SECRET')) {
      this.addTest({
        name: 'Google Client Secret',
        status: 'pass',
        message: 'Valid Google OAuth Client Secret configured',
        critical: true
      })
    } else {
      this.addTest({
        name: 'Google Client Secret',
        status: 'fail',
        message: 'Google OAuth Client Secret not properly configured',
        critical: true
      })
    }

    // Check secrets strength
    const jwtSecret = process.env.JWT_SECRET
    const nextAuthSecret = process.env.NEXTAUTH_SECRET

    if (jwtSecret && jwtSecret.length >= 32 && !jwtSecret.includes('CHANGE_THIS')) {
      this.addTest({
        name: 'JWT Secret Security',
        status: 'pass',
        message: `JWT secret is secure (${jwtSecret.length} chars)`,
        critical: true
      })
    } else {
      this.addTest({
        name: 'JWT Secret Security',
        status: 'fail',
        message: 'JWT secret is not secure or not configured',
        critical: true
      })
    }

    if (nextAuthSecret && nextAuthSecret.length >= 32 && !nextAuthSecret.includes('CHANGE_THIS')) {
      this.addTest({
        name: 'NextAuth Secret Security',
        status: 'pass',
        message: `NextAuth secret is secure (${nextAuthSecret.length} chars)`,
        critical: true
      })
    } else {
      this.addTest({
        name: 'NextAuth Secret Security',
        status: 'fail',
        message: 'NextAuth secret is not secure or not configured',
        critical: true
      })
    }
  }

  private async testDatabaseConnection() {
    console.log(chalk.yellow('🗄️  Testing Database Connection...'))

    try {
      // Test database connection through health endpoint
      const response = await fetch(`${this.PRODUCTION_URL}/api/health`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.database?.status === 'connected') {
          this.addTest({
            name: 'Database Connection',
            status: 'pass',
            message: 'Database connection successful',
            critical: true
          })
        } else {
          this.addTest({
            name: 'Database Connection',
            status: 'fail',
            message: 'Database connection failed',
            critical: true
          })
        }
      }
    } catch (error) {
      this.addTest({
        name: 'Database Connection',
        status: 'fail',
        message: 'Could not test database connection',
        critical: true
      })
    }
  }

  private printResults() {
    console.log(chalk.blue('\n📊 Verification Results'))
    console.log(chalk.blue('======================='))

    const passed = this.tests.filter(t => t.status === 'pass').length
    const failed = this.tests.filter(t => t.status === 'fail').length
    const criticalFailed = this.tests.filter(t => t.status === 'fail' && t.critical).length

    console.log(`\n${chalk.green('✅ Passed:')} ${passed}`)
    console.log(`${chalk.red('❌ Failed:')} ${failed}`)
    console.log(`${chalk.red('🚨 Critical Failed:')} ${criticalFailed}\n`)

    // Show failed tests first
    const failedTests = this.tests.filter(t => t.status === 'fail')
    if (failedTests.length > 0) {
      console.log(chalk.red('❌ FAILED TESTS:'))
      failedTests.forEach(test => {
        const icon = test.critical ? '🚨' : '⚠️'
        console.log(`   ${icon} ${chalk.bold(test.name)}: ${test.message}`)
      })
      console.log('')
    }

    // Show passed tests
    const passedTests = this.tests.filter(t => t.status === 'pass')
    if (passedTests.length > 0) {
      console.log(chalk.green('✅ PASSED TESTS:'))
      passedTests.forEach(test => {
        console.log(`   ${chalk.green('●')} ${chalk.bold(test.name)}: ${test.message}`)
      })
      console.log('')
    }

    // Overall status
    console.log(chalk.blue('🎯 Deployment Status'))
    console.log(chalk.blue('==================='))
    
    if (criticalFailed === 0) {
      console.log(chalk.green('✅ PRODUCTION DEPLOYMENT VERIFIED'))
      console.log(chalk.green('   All critical tests passed. System is ready for production use.'))
      
      if (failed > 0) {
        console.log(chalk.yellow('   Some non-critical issues found. Consider addressing for optimal security.'))
      }
      
      return true
    } else {
      console.log(chalk.red('❌ PRODUCTION DEPLOYMENT FAILED'))
      console.log(chalk.red(`   ${criticalFailed} critical test(s) failed.`))
      console.log(chalk.white('   Please resolve critical issues before using in production.'))
      
      return false
    }
  }

  private printNextSteps(deploymentReady: boolean) {
    console.log(chalk.blue('\n🚀 Next Steps'))
    console.log(chalk.blue('============='))
    
    if (deploymentReady) {
      console.log(chalk.green('🎉 Production OAuth system is verified and ready!'))
      console.log('')
      console.log('✅ Complete OAuth flow test:')
      console.log(`   1. Visit: ${this.PRODUCTION_URL}/login`)
      console.log('   2. Test Google OAuth login')
      console.log('   3. Verify user registration and role assignment')
      console.log('')
      console.log('📊 Monitor production:')
      console.log('   • Check Zeabur logs for any issues')
      console.log('   • Monitor OAuth usage and errors')
      console.log('   • Set up alerts for critical failures')
      
    } else {
      console.log(chalk.red('🔧 Fix critical issues:'))
      console.log('')
      
      const criticalFailed = this.tests.filter(t => t.status === 'fail' && t.critical)
      criticalFailed.forEach((test, index) => {
        console.log(`${index + 1}. ${chalk.bold(test.name)}: ${test.message}`)
      })
      
      console.log('')
      console.log('📚 Resources:')
      console.log('   • Production setup guide: docs/PRODUCTION-OAUTH-SETUP.md')
      console.log('   • Security checklist: docs/OAUTH-SECURITY-CHECKLIST.md')
      console.log('   • Environment validation: npm run validate:prod')
    }
  }

  async runVerification() {
    try {
      // Environment checks (local)
      this.validateEnvironmentForProduction()
      
      // Network tests (remote)
      await this.testHTTPSConnection()
      await this.testHealthEndpoint()
      await this.testOAuthEndpoint()
      await this.testSecurityHeaders()
      await this.testDatabaseConnection()
      
      // Print results
      const deploymentReady = this.printResults()
      this.printNextSteps(deploymentReady)
      
      // Exit with appropriate code
      process.exit(deploymentReady ? 0 : 1)
      
    } catch (error) {
      console.error(chalk.red('❌ Verification failed with error:'), error)
      process.exit(1)
    }
  }
}

// Main execution
async function main() {
  const verifier = new ProductionDeploymentVerifier()
  await verifier.runVerification()
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { ProductionDeploymentVerifier }