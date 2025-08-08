/**
 * Environment Configuration Validation for Zeabur Multi-Environment Deployment
 * KCISLK ESID Info Hub - Zeabur 多環境配置驗證
 */

import { z } from 'zod'

/**
 * 環境變數驗證 Schema
 * Environment variables validation schema
 */
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Database - Zeabur PostgreSQL
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format').refine(
    (url) => url.includes('postgresql://') || url.includes('postgres://'),
    'DATABASE_URL must be a valid PostgreSQL connection string'
  ),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL format'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().refine(
    (id) => id.includes('.apps.googleusercontent.com') || id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    'GOOGLE_CLIENT_ID must be a valid Google OAuth client ID ending with .apps.googleusercontent.com'
  ),
  GOOGLE_CLIENT_SECRET: z.string().min(24, 'GOOGLE_CLIENT_SECRET must be at least 24 characters long').refine(
    (secret) => secret !== 'YOUR_GOOGLE_CLIENT_SECRET',
    'GOOGLE_CLIENT_SECRET must be set to your actual Google OAuth client secret'
  ),

  // Cache (Optional)
  REDIS_URL: z.string().url('Invalid REDIS_URL format').optional(),

  // File Storage (Optional)
  VERCEL_BLOB_READ_WRITE_TOKEN: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Security
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),

  // Monitoring (Optional)
  SENTRY_DSN: z.string().url('Invalid SENTRY_DSN format').optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Development
  PRISMA_CLI_TELEMETRY_DISABLED: z.string().optional(),
  DEBUG: z.string().optional(),
  SKIP_ENV_VALIDATION: z.string().optional(),
})

/**
 * 環境配置類型定義
 * Environment configuration type definition
 */
export type EnvConfig = z.infer<typeof envSchema>

/**
 * 驗證並解析環境變數
 * Validate and parse environment variables
 */
function validateEnv(): EnvConfig {
  // 在構建時期，如果環境變數不完整，提供預設值避免構建失敗
  const isBuildTime = process.env.NODE_ENV !== 'test' && (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build' ||
    process.argv.includes('build') ||
    process.env.CI === 'true'
  )

  if (isBuildTime) {
    console.log('🔧 Build time detected - using fallback environment configuration')
    
    // 為構建提供最小化的環境配置
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || 'production',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
      JWT_SECRET: process.env.JWT_SECRET || 'build-time-placeholder-jwt-secret-32chars',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build-time-placeholder-nextauth-secret',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://localhost:3000',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'build-placeholder.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'build-placeholder-secret',
      REDIS_URL: process.env.REDIS_URL,
      VERCEL_BLOB_READ_WRITE_TOKEN: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      SENTRY_DSN: process.env.SENTRY_DSN,
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      PRISMA_CLI_TELEMETRY_DISABLED: process.env.PRISMA_CLI_TELEMETRY_DISABLED,
      DEBUG: process.env.DEBUG,
      SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    } as EnvConfig
  }

  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    console.error('❌ Environment configuration validation failed:')
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    }
    
    console.error('\n💡 Please check your environment variables configuration.')
    console.error('📋 Refer to .env.example for the required format.')
    
    // 在開發模式下不要終止程序，允許繼續運行並在實際使用時報錯
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Continuing in development mode with incomplete environment configuration')
      return {} as EnvConfig
    }
    
    process.exit(1)
  }
}

/**
 * 獲取驗證的環境配置
 * Get validated environment configuration
 */
export function getValidatedEnv(): EnvConfig {
  return validateEnv()
}

/**
 * 驗證的環境配置 (為了向後相容性，但建議使用 getValidatedEnv())
 * Validated environment configuration (for backward compatibility, but recommend using getValidatedEnv())
 * 
 * 注意：在構建時期，環境變數可能尚未完全可用，因此我們延遲驗證到實際使用時
 * Note: During build time, environment variables may not be fully available, so we defer validation to actual usage
 */
let _env: EnvConfig | null = null

export const env = new Proxy({} as EnvConfig, {
  get(target, prop: keyof EnvConfig) {
    if (!_env) {
      _env = validateEnv()
    }
    return _env[prop]
  }
})

/**
 * 獲取當前環境資訊
 * Get current environment information
 */
export function getEnvironmentInfo() {
  const dbUrl = env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  
  return {
    nodeEnv: env.NODE_ENV,
    database: {
      url: dbUrl,
      isZeabur: dbUrl.includes('zeabur.com') || dbUrl.includes('zeabur.app'),
    },
    cache: {
      enabled: !!env.REDIS_URL,
      url: env.REDIS_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
    },
    storage: {
      vercelBlob: !!env.VERCEL_BLOB_READ_WRITE_TOKEN,
      awsS3: !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
    },
    monitoring: {
      sentry: !!env.SENTRY_DSN,
      analytics: !!env.GOOGLE_ANALYTICS_ID,
    },
  }
}

/**
 * 檢查環境配置完整性
 * Check environment configuration completeness
 */
export function checkEnvironmentHealth() {
  const info = getEnvironmentInfo()
  const issues: string[] = []
  
  // 檢查必要配置
  if (!info.database.isZeabur && env.NODE_ENV !== 'development') {
    issues.push('Database URL does not appear to be from Zeabur')
  }
  
  if (!info.storage.vercelBlob && !info.storage.awsS3) {
    issues.push('No file storage configured (Vercel Blob or AWS S3)')
  }
  
  if (env.NODE_ENV === 'production' && !info.monitoring.sentry) {
    issues.push('Sentry monitoring not configured for production')
  }
  
  // 檢查 OAuth 配置
  if (env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    issues.push('Google OAuth Client ID not configured - still using placeholder value')
  }
  
  if (env.GOOGLE_CLIENT_SECRET === 'YOUR_GOOGLE_CLIENT_SECRET') {
    issues.push('Google OAuth Client Secret not configured - still using placeholder value')
  }
  
  // 檢查生產環境 HTTPS
  if (env.NODE_ENV === 'production' && !env.NEXTAUTH_URL.startsWith('https://')) {
    issues.push('Production environment must use HTTPS for NEXTAUTH_URL')
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    info,
  }
}

/**
 * 開發模式下顯示環境資訊
 * Display environment information in development mode
 * 
 * 注意：延遲執行以避免構建時期的問題
 * Note: Deferred execution to avoid build-time issues
 */
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development' && !process.env.SKIP_ENV_VALIDATION) {
  // 使用 setTimeout 延遲執行，確保在環境完全初始化後才顯示資訊
  setTimeout(() => {
    try {
      const health = checkEnvironmentHealth()
      
      console.log('\n🔧 Environment Configuration:')
      console.log(`  Environment: ${health.info.nodeEnv}`)
      console.log(`  Database: ${health.info.database.url}`)
      console.log(`  Zeabur DB: ${health.info.database.isZeabur ? '✅' : '❌'}`)
      console.log(`  Cache: ${health.info.cache.enabled ? '✅' : '❌'}`)
      console.log(`  Storage: ${health.info.storage.vercelBlob ? 'Vercel Blob ✅' : health.info.storage.awsS3 ? 'AWS S3 ✅' : '❌'}`)
      
      if (!health.healthy) {
        console.log('\n⚠️  Configuration Issues:')
        health.issues.forEach(issue => console.log(`  - ${issue}`))
      }
      
      console.log('')
    } catch (error) {
      console.warn('⚠️ Unable to display environment configuration:', error.message)
    }
  }, 100)
}