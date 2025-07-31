/**
 * Environment Configuration Validation for Zeabur Multi-Environment Deployment
 * ES International Department - Zeabur 多環境配置驗證
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
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),

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
    
    process.exit(1)
  }
}

/**
 * 驗證的環境配置
 * Validated environment configuration
 */
export const env = validateEnv()

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
  
  return {
    healthy: issues.length === 0,
    issues,
    info,
  }
}

/**
 * 開發模式下顯示環境資訊
 * Display environment information in development mode
 */
if (env.NODE_ENV === 'development' && !env.SKIP_ENV_VALIDATION) {
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
}