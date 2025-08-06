/**
 * Environment Variables Validation Script for Zeabur Deployment
 * KCISLK ESID Info Hub - 環境變數驗證腳本
 */

import { z } from 'zod'
import fs from 'fs'
import path from 'path'

/**
 * 驗證環境變數格式與安全性
 * Validate environment variables format and security
 */
function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables...\n')
  
  const errors: string[] = []
  const warnings: string[] = []
  const success: string[] = []
  
  // 檢查 DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required')
  } else {
    try {
      const url = new URL(databaseUrl)
      if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
        errors.push('DATABASE_URL must be a PostgreSQL connection string')
      } else {
        success.push('DATABASE_URL format is valid')
        
        // 檢查是否為 Zeabur 資料庫
        if (url.hostname.includes('zeabur')) {
          success.push('DATABASE_URL points to Zeabur database')
        } else {
          warnings.push('DATABASE_URL does not appear to be from Zeabur')
        }
      }
    } catch {
      errors.push('DATABASE_URL format is invalid')
    }
  }
  
  // 檢查 JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required')
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  } else {
    success.push(`JWT_SECRET is secure (${jwtSecret.length} characters)`)
  }
  
  // 檢查 NEXTAUTH_SECRET
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  if (!nextAuthSecret) {
    errors.push('NEXTAUTH_SECRET is required')
  } else if (nextAuthSecret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long')
  } else {
    success.push(`NEXTAUTH_SECRET is secure (${nextAuthSecret.length} characters)`)
  }
  
  // 檢查 NEXTAUTH_URL
  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (!nextAuthUrl) {
    errors.push('NEXTAUTH_URL is required')
  } else {
    try {
      const url = new URL(nextAuthUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('NEXTAUTH_URL must be a valid HTTP/HTTPS URL')
      } else {
        success.push('NEXTAUTH_URL format is valid')
        
        // 生產環境必須使用 HTTPS
        if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
          errors.push('NEXTAUTH_URL must use HTTPS in production environment')
        }
      }
    } catch {
      errors.push('NEXTAUTH_URL format is invalid')
    }
  }
  
  // 檢查 NODE_ENV
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv && !['development', 'staging', 'production'].includes(nodeEnv)) {
    warnings.push('NODE_ENV should be one of: development, staging, production')
  } else {
    success.push(`NODE_ENV is set to ${nodeEnv || 'development'}`)
  }
  
  // 檢查可選的配置
  const optionalConfigs = [
    {
      name: 'REDIS_URL',
      validator: (value: string) => {
        try {
          const url = new URL(value)
          return url.protocol === 'redis:' || url.protocol === 'rediss:'
        } catch {
          return false
        }
      },
      description: 'Cache configuration'
    },
    {
      name: 'VERCEL_BLOB_READ_WRITE_TOKEN',
      validator: (value: string) => value.length > 10,
      description: 'File storage configuration'
    },
    {
      name: 'SENTRY_DSN',
      validator: (value: string) => {
        try {
          const url = new URL(value)
          return url.protocol === 'https:' && url.hostname.includes('sentry')
        } catch {
          return false
        }
      },
      description: 'Error monitoring configuration'
    }
  ]
  
  optionalConfigs.forEach((config) => {
    const value = process.env[config.name]
    if (value) {
      if (config.validator(value)) {
        success.push(`${config.name} is configured and valid`)
      } else {
        warnings.push(`${config.name} is configured but format may be invalid`)
      }
    }
  })
  
  // 安全性檢查
  console.log('🔒 Security Checks:')
  
  // 檢查是否有預設值
  const dangerousDefaults = [
    { name: 'JWT_SECRET', value: jwtSecret, dangerous: ['your-secret-key', 'change-me', 'default'] },
    { name: 'NEXTAUTH_SECRET', value: nextAuthSecret, dangerous: ['your-secret-key', 'change-me', 'default'] }
  ]
  
  dangerousDefaults.forEach(({ name, value, dangerous }) => {
    if (value && dangerous.some(d => value.toLowerCase().includes(d))) {
      errors.push(`${name} appears to use a default or insecure value`)
    }
  })
  
  // 輸出結果
  if (success.length > 0) {
    console.log('\n✅ Valid Configuration:')
    success.forEach(msg => console.log(`  ✓ ${msg}`))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(msg => console.log(`  ⚠ ${msg}`))
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(msg => console.log(`  ✗ ${msg}`))
  }
  
  return errors.length === 0
}

/**
 * 生成安全的密鑰建議
 * Generate secure key suggestions
 */
function generateSecureKeys() {
  console.log('\n🔐 Security Key Generation Suggestions:')
  console.log('')
  console.log('Generate secure secrets using one of these methods:')
  console.log('')
  console.log('Option 1 - OpenSSL (Recommended):')
  console.log('  openssl rand -base64 32')
  console.log('')
  console.log('Option 2 - Node.js:')
  console.log('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"')
  console.log('')
  console.log('Option 3 - Online Generator:')
  console.log('  https://generate-secret.vercel.app/32')
  console.log('')
  console.log('⚠️  Never share these secrets or commit them to version control!')
}

/**
 * 檢查環境檔案存在性
 * Check environment file existence
 */
function checkEnvironmentFiles() {
  console.log('\n📁 Environment Files Check:')
  
  const envFiles = ['Development', 'Staging', 'Production']
  const currentEnv = process.env.NODE_ENV || 'development'
  
  envFiles.forEach(env => {
    const fileName = `.env.${env.toLowerCase()}`
    const filePath = path.join(process.cwd(), fileName)
    const exists = fs.existsSync(filePath)
    const isCurrent = env.toLowerCase() === currentEnv
    
    const status = exists ? '✅' : '❌'
    const current = isCurrent ? ' (current)' : ''
    
    console.log(`  ${status} ${fileName}${current}`)
  })
  
  // 檢查 .env.example
  const examplePath = path.join(process.cwd(), '.env.example')
  const exampleExists = fs.existsSync(examplePath)
  console.log(`  ${exampleExists ? '✅' : '❌'} .env.example (template)`)
}

/**
 * 主函數
 * Main function
 */
function main() {
  console.log('🚀 KCISLK ESID Info Hub - Environment Variables Validation')
  console.log('=' .repeat(70))
  
  checkEnvironmentFiles()
  
  const isValid = validateEnvironmentVariables()
  
  if (!isValid) {
    generateSecureKeys()
  }
  
  console.log('=' .repeat(70))
  
  if (isValid) {
    console.log('✅ Environment variables validation passed!')
    console.log('🎉 Your configuration is ready for Zeabur deployment!')
    process.exit(0)
  } else {
    console.log('❌ Environment variables validation failed!')
    console.log('💡 Please fix the errors above before deploying.')
    process.exit(1)
  }
}

// 執行主函數
main()