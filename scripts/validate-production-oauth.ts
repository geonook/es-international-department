#!/usr/bin/env tsx

/**
 * Production OAuth Configuration Validation Script
 * 生產環境 OAuth 配置驗證腳本
 * 
 * This script validates OAuth configuration for production deployment
 * 此腳本驗證用於生產部署的 OAuth 配置
 */

import { z } from 'zod'
import chalk from 'chalk'

interface ValidationResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  required: boolean
}

class ProductionOAuthValidator {
  private results: ValidationResult[] = []

  constructor() {
    console.log(chalk.blue('🔍 Production OAuth Configuration Validation'))
    console.log(chalk.blue('=================================================='))
  }

  private addResult(result: ValidationResult) {
    this.results.push(result)
  }

  private validateEnvironmentVariable(
    name: string,
    value: string | undefined,
    validator: z.ZodSchema,
    required: boolean = true
  ) {
    if (!value) {
      this.addResult({
        name,
        status: required ? 'fail' : 'warn',
        message: required ? 'Required environment variable not set' : 'Optional environment variable not set',
        required
      })
      return
    }

    try {
      validator.parse(value)
      this.addResult({
        name,
        status: 'pass',
        message: 'Valid configuration',
        required
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.addResult({
          name,
          status: 'fail',
          message: error.errors[0]?.message || 'Invalid format',
          required
        })
      }
    }
  }

  private validateSecurityRequirements() {
    // Check HTTPS requirement
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl && !nextAuthUrl.startsWith('https://')) {
      this.addResult({
        name: 'HTTPS Requirement',
        status: 'fail',
        message: 'Production deployment must use HTTPS',
        required: true
      })
    } else if (nextAuthUrl?.startsWith('https://')) {
      this.addResult({
        name: 'HTTPS Requirement',
        status: 'pass',
        message: 'HTTPS correctly configured',
        required: true
      })
    }

    // Check production domain
    if (nextAuthUrl?.includes('localhost') || nextAuthUrl?.includes('127.0.0.1')) {
      this.addResult({
        name: 'Production Domain',
        status: 'fail',
        message: 'Using development domain in production environment',
        required: true
      })
    } else if (nextAuthUrl?.includes('zeabur.app')) {
      this.addResult({
        name: 'Production Domain',
        status: 'pass',
        message: 'Production domain correctly configured',
        required: true
      })
    }

    // Check CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS
    if (allowedOrigins?.includes('localhost')) {
      this.addResult({
        name: 'CORS Configuration',
        status: 'warn',
        message: 'CORS includes development origins - should be production-only',
        required: false
      })
    }
  }

  private validateGoogleOAuthSetup() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    // Validate Client ID format
    if (clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' || 
        clientId === 'your-production-client-id.apps.googleusercontent.com') {
      this.addResult({
        name: 'Google OAuth Client ID',
        status: 'fail',
        message: 'Using placeholder value - must set actual Google OAuth Client ID',
        required: true
      })
    } else if (clientId && clientId.includes('.apps.googleusercontent.com')) {
      this.addResult({
        name: 'Google OAuth Client ID',
        status: 'pass',
        message: 'Valid Google OAuth Client ID format',
        required: true
      })
    }

    // Validate Client Secret format
    if (clientSecret === 'YOUR_GOOGLE_CLIENT_SECRET' || 
        clientSecret === 'GOCSPX-your-production-client-secret') {
      this.addResult({
        name: 'Google OAuth Client Secret',
        status: 'fail',
        message: 'Using placeholder value - must set actual Google OAuth Client Secret',
        required: true
      })
    } else if (clientSecret && clientSecret.startsWith('GOCSPX-')) {
      this.addResult({
        name: 'Google OAuth Client Secret',
        status: 'pass',
        message: 'Valid Google OAuth Client Secret format',
        required: true
      })
    }

    // Validate redirect URI consistency
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl) {
      const expectedRedirectUri = `${nextAuthUrl}/api/auth/callback/google`
      this.addResult({
        name: 'OAuth Redirect URI',
        status: 'pass',
        message: `Expected redirect URI: ${expectedRedirectUri}`,
        required: true
      })
    }
  }

  private validateProductionSecrets() {
    const jwtSecret = process.env.JWT_SECRET
    const nextAuthSecret = process.env.NEXTAUTH_SECRET

    // Check for placeholder values
    const dangerousValues = [
      'CHANGE_THIS_FOR_PRODUCTION',
      'your-secret-key',
      'change-me',
      'default',
      '123456'
    ]

    if (jwtSecret && dangerousValues.some(dangerous => jwtSecret.includes(dangerous))) {
      this.addResult({
        name: 'JWT Secret Security',
        status: 'fail',
        message: 'JWT_SECRET appears to use placeholder or weak value',
        required: true
      })
    }

    if (nextAuthSecret && dangerousValues.some(dangerous => nextAuthSecret.includes(dangerous))) {
      this.addResult({
        name: 'NextAuth Secret Security',
        status: 'fail',
        message: 'NEXTAUTH_SECRET appears to use placeholder or weak value',
        required: true
      })
    }
  }

  async validateConfiguration() {
    console.log(chalk.yellow('\n📋 Validating Core Configuration...'))

    // Core environment validation
    this.validateEnvironmentVariable(
      'NODE_ENV',
      process.env.NODE_ENV,
      z.enum(['production']),
      true
    )

    this.validateEnvironmentVariable(
      'DATABASE_URL',
      process.env.DATABASE_URL,
      z.string().url().refine(url => url.includes('postgresql://') || url.includes('postgres://')),
      true
    )

    this.validateEnvironmentVariable(
      'JWT_SECRET',
      process.env.JWT_SECRET,
      z.string().min(32),
      true
    )

    this.validateEnvironmentVariable(
      'NEXTAUTH_SECRET',
      process.env.NEXTAUTH_SECRET,
      z.string().min(32),
      true
    )

    this.validateEnvironmentVariable(
      'NEXTAUTH_URL',
      process.env.NEXTAUTH_URL,
      z.string().url(),
      true
    )

    console.log(chalk.yellow('\n🔐 Validating Google OAuth Configuration...'))

    this.validateEnvironmentVariable(
      'GOOGLE_CLIENT_ID',
      process.env.GOOGLE_CLIENT_ID,
      z.string().refine(id => id.includes('.apps.googleusercontent.com')),
      true
    )

    this.validateEnvironmentVariable(
      'GOOGLE_CLIENT_SECRET',
      process.env.GOOGLE_CLIENT_SECRET,
      z.string().min(24),
      true
    )

    console.log(chalk.yellow('\n🛡️  Validating Security Configuration...'))

    this.validateSecurityRequirements()
    this.validateGoogleOAuthSetup()
    this.validateProductionSecrets()

    console.log(chalk.yellow('\n📦 Validating Optional Services...'))

    // Optional services
    this.validateEnvironmentVariable(
      'SENTRY_DSN',
      process.env.SENTRY_DSN,
      z.string().url(),
      false
    )

    this.validateEnvironmentVariable(
      'VERCEL_BLOB_READ_WRITE_TOKEN',
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
      z.string().min(10),
      false
    )
  }

  generateSecrets() {
    console.log(chalk.blue('\n🔑 Generate Production Secrets'))
    console.log(chalk.blue('================================'))
    console.log('Run these commands to generate secure secrets:\n')
    
    console.log(chalk.green('# Generate JWT_SECRET'))
    console.log(chalk.white('openssl rand -base64 32\n'))
    
    console.log(chalk.green('# Generate NEXTAUTH_SECRET'))
    console.log(chalk.white('openssl rand -base64 32\n'))
    
    console.log(chalk.green('# Alternative using Node.js:'))
    console.log(chalk.white('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"\n'))
  }

  printResults() {
    console.log(chalk.blue('\n📊 Validation Results'))
    console.log(chalk.blue('====================='))

    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const warnings = this.results.filter(r => r.status === 'warn').length

    console.log(`\n${chalk.green('✅ Passed:')} ${passed}`)
    console.log(`${chalk.red('❌ Failed:')} ${failed}`)
    console.log(`${chalk.yellow('⚠️  Warnings:')} ${warnings}\n`)

    // Group results by status
    const failedResults = this.results.filter(r => r.status === 'fail')
    const warnResults = this.results.filter(r => r.status === 'warn')
    const passedResults = this.results.filter(r => r.status === 'pass')

    if (failedResults.length > 0) {
      console.log(chalk.red('❌ FAILED VALIDATIONS:'))
      failedResults.forEach(result => {
        console.log(`   ${chalk.red('●')} ${chalk.bold(result.name)}: ${result.message}`)
      })
      console.log('')
    }

    if (warnResults.length > 0) {
      console.log(chalk.yellow('⚠️  WARNINGS:'))
      warnResults.forEach(result => {
        console.log(`   ${chalk.yellow('●')} ${chalk.bold(result.name)}: ${result.message}`)
      })
      console.log('')
    }

    if (passedResults.length > 0) {
      console.log(chalk.green('✅ PASSED VALIDATIONS:'))
      passedResults.forEach(result => {
        console.log(`   ${chalk.green('●')} ${chalk.bold(result.name)}: ${result.message}`)
      })
    }

    // Overall result
    const criticalFailed = failedResults.filter(r => r.required).length
    
    console.log(chalk.blue('\n🎯 Overall Status'))
    console.log(chalk.blue('================='))
    
    if (criticalFailed === 0) {
      console.log(chalk.green('✅ READY FOR PRODUCTION DEPLOYMENT'))
      console.log(chalk.green('   All critical validations passed.'))
      
      if (warnResults.length > 0) {
        console.log(chalk.yellow('   Consider addressing warnings for optimal setup.'))
      }
    } else {
      console.log(chalk.red('❌ NOT READY FOR PRODUCTION'))
      console.log(chalk.red(`   ${criticalFailed} critical validation(s) failed.`))
      console.log(chalk.white('   Please fix the issues above before deploying.'))
    }
  }

  printDeploymentInstructions() {
    console.log(chalk.blue('\n🚀 Deployment Instructions'))
    console.log(chalk.blue('=========================='))
    
    console.log('1. Set environment variables in Zeabur console:')
    console.log(chalk.gray('   https://dash.zeabur.com/ > Your Project > Environment'))
    
    console.log('\n2. Required Google Cloud Console setup:')
    console.log(chalk.gray('   • Create production OAuth 2.0 credentials'))
    console.log(chalk.gray('   • Set redirect URI: https://landing-app-v2.zeabur.app/api/auth/callback/google'))
    console.log(chalk.gray('   • Configure OAuth consent screen'))
    
    console.log('\n3. After deployment, test OAuth flow:')
    console.log(chalk.gray('   • Visit: https://landing-app-v2.zeabur.app/login'))
    console.log(chalk.gray('   • Test Google OAuth login'))
    console.log(chalk.gray('   • Verify user creation and role assignment'))
    
    console.log('\n4. Monitor application logs in Zeabur console')
  }
}

// Main execution
async function main() {
  const validator = new ProductionOAuthValidator()
  
  try {
    await validator.validateConfiguration()
    validator.printResults()
    validator.generateSecrets()
    validator.printDeploymentInstructions()
  } catch (error) {
    console.error(chalk.red('Error during validation:'), error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { ProductionOAuthValidator }