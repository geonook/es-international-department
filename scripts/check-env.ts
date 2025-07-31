/**
 * Environment Configuration Check Script for Zeabur Deployment
 * ES International Department - 環境配置檢查腳本
 */

// Load environment variables from .env file
import { config } from 'dotenv'
import { join } from 'path'

// Load .env file before importing lib/env
config({ path: join(process.cwd(), '.env') })

import { getValidatedEnv, getEnvironmentInfo, checkEnvironmentHealth } from '../lib/env'

/**
 * 檢查環境配置完整性
 * Check environment configuration completeness
 */
function checkEnvironmentConfiguration() {
  console.log('🔍 Checking environment configuration...\n')
  
  try {
    // 獲取驗證的環境配置
    const env = getValidatedEnv()
    const envInfo = getEnvironmentInfo()
    const health = checkEnvironmentHealth()
    
    // 顯示基本環境資訊
    console.log('📊 Basic Environment Information:')
    console.log(`  NODE_ENV: ${envInfo.nodeEnv}`)
    console.log(`  Database Provider: PostgreSQL`)
    console.log(`  Database Host: ${envInfo.database.isZeabur ? 'Zeabur Cloud ✅' : 'Other/Local ⚠️'}`)
    console.log(`  Cache: ${envInfo.cache.enabled ? 'Redis Enabled ✅' : 'Disabled ❌'}`)
    console.log(`  File Storage: ${envInfo.storage.vercelBlob ? 'Vercel Blob ✅' : envInfo.storage.awsS3 ? 'AWS S3 ✅' : 'Not Configured ❌'}`)
    console.log(`  Monitoring: ${envInfo.monitoring.sentry ? 'Sentry ✅' : 'None ❌'}`)
    console.log('')
    
    // 詳細配置檢查
    console.log('🔧 Detailed Configuration Check:')
    
    // 必要環境變數檢查
    const requiredVars = [
      { name: 'DATABASE_URL', value: env.DATABASE_URL, masked: true },
      { name: 'JWT_SECRET', value: env.JWT_SECRET, masked: true },
      { name: 'NEXTAUTH_SECRET', value: env.NEXTAUTH_SECRET, masked: true },
      { name: 'NEXTAUTH_URL', value: env.NEXTAUTH_URL, masked: false }
    ]
    
    requiredVars.forEach(({ name, value, masked }) => {
      const displayValue = masked ? '*'.repeat(Math.min(value.length, 20)) : value
      console.log(`  ✅ ${name}: ${displayValue}`)
    })
    
    // 可選環境變數檢查
    console.log('\n🔧 Optional Configuration:')
    
    const optionalVars = [
      { name: 'REDIS_URL', value: env.REDIS_URL, description: 'Caching' },
      { name: 'VERCEL_BLOB_READ_WRITE_TOKEN', value: env.VERCEL_BLOB_READ_WRITE_TOKEN, description: 'File Storage' },
      { name: 'SENTRY_DSN', value: env.SENTRY_DSN, description: 'Error Monitoring' },
      { name: 'GOOGLE_ANALYTICS_ID', value: env.GOOGLE_ANALYTICS_ID, description: 'Analytics' }
    ]
    
    optionalVars.forEach(({ name, value, description }) => {
      const status = value ? '✅ Configured' : '❌ Not Set'
      console.log(`  ${status} ${name} (${description})`)
    })
    
    // 安全性檢查
    console.log('\n🔒 Security Configuration:')
    console.log(`  JWT Secret Length: ${env.JWT_SECRET.length >= 32 ? '✅ Secure' : '❌ Too Short'} (${env.JWT_SECRET.length} chars)`)
    console.log(`  NextAuth Secret Length: ${env.NEXTAUTH_SECRET.length >= 32 ? '✅ Secure' : '❌ Too Short'} (${env.NEXTAUTH_SECRET.length} chars)`)
    console.log(`  HTTPS: ${env.NEXTAUTH_URL.startsWith('https://') || env.NODE_ENV === 'development' ? '✅' : '❌ Required for production'}`)
    
    // 問題報告
    if (!health.healthy) {
      console.log('\n⚠️  Configuration Issues Found:')
      health.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
      
      console.log('\n💡 Recommendations:')
      if (health.issues.some(issue => issue.includes('file storage'))) {
        console.log('  - Configure Vercel Blob or AWS S3 for file uploads')
      }
      if (health.issues.some(issue => issue.includes('Sentry'))) {
        console.log('  - Set up Sentry for production error monitoring')
      }
      if (health.issues.some(issue => issue.includes('Zeabur'))) {
        console.log('  - Ensure DATABASE_URL points to Zeabur PostgreSQL instance')
      }
    } else {
      console.log('\n🎉 Configuration looks good!')
    }
    
    // 環境特定建議
    console.log('\n📋 Environment-Specific Recommendations:')
    
    switch (envInfo.nodeEnv) {
      case 'development':
        console.log('  - Development environment detected')
        console.log('  - Consider using Zeabur dev database for consistency')
        console.log('  - Debug logging is enabled')
        break
      
      case 'staging':
        console.log('  - Staging environment detected') 
        console.log('  - Ensure database isolation from production')
        console.log('  - Test all integrations thoroughly')
        break
      
      case 'production':
        console.log('  - Production environment detected')
        console.log('  - Ensure all monitoring is configured')
        console.log('  - Verify backup procedures')
        console.log('  - Check SSL/HTTPS configuration')
        break
    }
    
    return health.healthy
    
  } catch (error) {
    console.error('\n❌ Error checking environment configuration:')
    console.error(error)
    return false
  }
}

/**
 * 顯示環境配置指南
 * Display environment configuration guide
 */
function showConfigurationGuide() {
  console.log('\n📚 Quick Configuration Guide:')
  console.log('')
  console.log('1. Copy .env.example to create environment-specific files:')
  console.log('   cp .env.example .env.development')
  console.log('   cp .env.example .env.staging')
  console.log('   cp .env.example .env.production')
  console.log('')
  console.log('2. Get your Zeabur database URLs from:')
  console.log('   https://dash.zeabur.com → Your Project → Database → Connection String')
  console.log('')
  console.log('3. Generate secure secrets:')
  console.log('   openssl rand -base64 32  # For JWT_SECRET')
  console.log('   openssl rand -base64 32  # For NEXTAUTH_SECRET')
  console.log('')
  console.log('4. Test your configuration:')
  console.log('   npm run env:check')
  console.log('   npm run test:db')
  console.log('')
}

/**
 * 主函數
 * Main function
 */
function main() {
  console.log('🚀 ES International Department - Environment Configuration Check')
  console.log('=' .repeat(70))
  
  const isHealthy = checkEnvironmentConfiguration()
  
  if (!isHealthy) {
    showConfigurationGuide()
  }
  
  console.log('=' .repeat(70))
  
  if (isHealthy) {
    console.log('✅ Environment configuration check completed successfully!')
    process.exit(0)
  } else {
    console.log('⚠️  Environment configuration needs attention!')
    process.exit(1)
  }
}

// 執行主函數
main()