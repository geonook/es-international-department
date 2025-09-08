/**
 * Production Environment Configuration Validator
 * 生產環境配置驗證工具
 */

import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'

// 載入生產環境配置
dotenv.config({ path: '.env.production' })

interface ValidationResult {
  category: string
  check: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: string
}

class ProductionConfigValidator {
  private results: ValidationResult[] = []

  private addResult(category: string, check: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string) {
    this.results.push({ category, check, status, message, details })
  }

  /**
   * 驗證環境變數
   */
  private validateEnvironmentVariables() {
    const category = '🌍 Environment Variables'
    
    // 必要變數檢查
    const requiredVars = [
      'NODE_ENV',
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ]

    let allPresent = true
    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        this.addResult(category, varName, 'FAIL', `Missing required environment variable: ${varName}`)
        allPresent = false
      } else {
        this.addResult(category, varName, 'PASS', `✓ ${varName} is set`, `Length: ${value.length} chars`)
      }
    }

    // 環境檢查
    if (process.env.NODE_ENV !== 'production') {
      this.addResult(category, 'NODE_ENV', 'WARNING', 'NODE_ENV is not set to "production"', `Current: ${process.env.NODE_ENV}`)
    }

    return allPresent
  }

  /**
   * 驗證 JWT 配置
   */
  private validateJWTConfiguration() {
    const category = '🔐 JWT Configuration'
    
    const jwtSecret = process.env.JWT_SECRET
    const nextAuthSecret = process.env.NEXTAUTH_SECRET

    if (jwtSecret) {
      if (jwtSecret.length < 32) {
        this.addResult(category, 'JWT_SECRET', 'WARNING', 'JWT_SECRET is too short (< 32 chars)', `Length: ${jwtSecret.length}`)
      } else {
        this.addResult(category, 'JWT_SECRET', 'PASS', '✓ JWT_SECRET length is sufficient', `Length: ${jwtSecret.length} chars`)
      }
    }

    if (nextAuthSecret) {
      if (nextAuthSecret.length < 32) {
        this.addResult(category, 'NEXTAUTH_SECRET', 'WARNING', 'NEXTAUTH_SECRET is too short (< 32 chars)', `Length: ${nextAuthSecret.length}`)
      } else {
        this.addResult(category, 'NEXTAUTH_SECRET', 'PASS', '✓ NEXTAUTH_SECRET length is sufficient', `Length: ${nextAuthSecret.length} chars`)
      }
    }
  }

  /**
   * 驗證 Google OAuth 配置
   */
  private async validateGoogleOAuthConfiguration() {
    const category = '🔍 Google OAuth Configuration'
    
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL

    if (clientId) {
      if (clientId.endsWith('.apps.googleusercontent.com')) {
        this.addResult(category, 'CLIENT_ID', 'PASS', '✓ Google Client ID format is valid')
      } else {
        this.addResult(category, 'CLIENT_ID', 'FAIL', 'Invalid Google Client ID format', 'Should end with .apps.googleusercontent.com')
      }
    }

    if (clientSecret) {
      if (clientSecret.startsWith('GOCSPX-')) {
        this.addResult(category, 'CLIENT_SECRET', 'PASS', '✓ Google Client Secret format is valid')
      } else {
        this.addResult(category, 'CLIENT_SECRET', 'FAIL', 'Invalid Google Client Secret format', 'Should start with GOCSPX-')
      }
    }

    if (nextAuthUrl) {
      if (nextAuthUrl === 'https://kcislk-infohub.zeabur.app') {
        this.addResult(category, 'NEXTAUTH_URL', 'PASS', '✓ NEXTAUTH_URL is correctly set for production')
      } else {
        this.addResult(category, 'NEXTAUTH_URL', 'WARNING', 'NEXTAUTH_URL might not be production URL', `Current: ${nextAuthUrl}`)
      }
    }

    // 測試 OAuth 客戶端創建
    if (clientId && clientSecret) {
      try {
        const oauth2Client = new OAuth2Client(clientId, clientSecret)
        this.addResult(category, 'OAUTH_CLIENT', 'PASS', '✓ Google OAuth2 client can be created')
      } catch (error) {
        this.addResult(category, 'OAUTH_CLIENT', 'FAIL', 'Failed to create Google OAuth2 client', error instanceof Error ? error.message : String(error))
      }
    }
  }

  /**
   * 驗證資料庫配置
   */
  private async validateDatabaseConfiguration() {
    const category = '🗄️ Database Configuration'
    
    const databaseUrl = process.env.DATABASE_URL
    
    if (databaseUrl) {
      if (databaseUrl.startsWith('postgresql://')) {
        this.addResult(category, 'DATABASE_URL', 'PASS', '✓ Database URL format is valid (PostgreSQL)')
      } else {
        this.addResult(category, 'DATABASE_URL', 'WARNING', 'Database URL format might be incorrect', `Current: ${databaseUrl.substring(0, 20)}...`)
      }
      
      // 測試資料庫連線
      try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        await prisma.$connect()
        await prisma.$disconnect()
        this.addResult(category, 'DATABASE_CONNECTION', 'PASS', '✓ Database connection successful')
      } catch (error) {
        this.addResult(category, 'DATABASE_CONNECTION', 'FAIL', 'Database connection failed', error instanceof Error ? error.message : String(error))
      }
    }
  }

  /**
   * 驗證生產環境設定
   */
  private validateProductionSettings() {
    const category = '🚀 Production Settings'
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS
    const rateLimitMax = process.env.RATE_LIMIT_MAX_REQUESTS
    const rateLimitWindow = process.env.RATE_LIMIT_WINDOW_MS

    if (allowedOrigins) {
      if (allowedOrigins.includes('https://kcislk-infohub.zeabur.app')) {
        this.addResult(category, 'ALLOWED_ORIGINS', 'PASS', '✓ Production domain is in allowed origins')
      } else {
        this.addResult(category, 'ALLOWED_ORIGINS', 'WARNING', 'Production domain not found in allowed origins', `Current: ${allowedOrigins}`)
      }
    }

    if (rateLimitMax) {
      const max = parseInt(rateLimitMax)
      if (max > 0 && max <= 1000) {
        this.addResult(category, 'RATE_LIMIT', 'PASS', '✓ Rate limiting is properly configured', `Max: ${max} requests`)
      } else {
        this.addResult(category, 'RATE_LIMIT', 'WARNING', 'Rate limit might be too high or invalid', `Current: ${max}`)
      }
    }
  }

  /**
   * 執行所有驗證
   */
  async validateAll() {
    console.log('🔍 Starting Production Configuration Validation...\n')
    
    this.validateEnvironmentVariables()
    this.validateJWTConfiguration()
    await this.validateGoogleOAuthConfiguration()
    await this.validateDatabaseConfiguration()
    this.validateProductionSettings()
    
    this.printResults()
    return this.getSummary()
  }

  /**
   * 打印結果
   */
  private printResults() {
    const categories = [...new Set(this.results.map(r => r.category))]
    
    for (const category of categories) {
      console.log(`\n${category}`)
      console.log('=' .repeat(50))
      
      const categoryResults = this.results.filter(r => r.category === category)
      for (const result of categoryResults) {
        const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
        console.log(`${statusIcon} ${result.check}: ${result.message}`)
        if (result.details) {
          console.log(`   Details: ${result.details}`)
        }
      }
    }
  }

  /**
   * 取得總結
   */
  private getSummary() {
    const passes = this.results.filter(r => r.status === 'PASS').length
    const warnings = this.results.filter(r => r.status === 'WARNING').length
    const failures = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length

    console.log('\n📊 Validation Summary')
    console.log('=' .repeat(50))
    console.log(`✅ PASSED: ${passes}/${total}`)
    console.log(`⚠️ WARNINGS: ${warnings}/${total}`)
    console.log(`❌ FAILURES: ${failures}/${total}`)
    
    if (failures === 0) {
      console.log('\n🎉 Production configuration is ready for deployment!')
      return true
    } else {
      console.log('\n🚨 Please fix the failures before deploying to production.')
      return false
    }
  }
}

// 執行驗證
async function main() {
  const validator = new ProductionConfigValidator()
  const isValid = await validator.validateAll()
  
  process.exit(isValid ? 0 : 1)
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed with error:', error)
    process.exit(1)
  })
}

export { ProductionConfigValidator }