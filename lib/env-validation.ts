/**
 * Environment Variable Validation System
 * 環境變數驗證系統 - 統一的配置驗證機制
 * 
 * @description 使用 Zod 統一驗證所有環境變數，提供類型安全和運行時驗證
 * @features 類型安全、運行時驗證、預設值、開發模式支援、錯誤報告
 * @version 1.0.0
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { z } from 'zod'

// 環境變數驗證架構
const envSchema = z.object({
  // Node 環境配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).optional(),
  
  // Next.js 配置
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),
  
  // Database configuration - PostgreSQL
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format. Must be a valid PostgreSQL connection string'),
  
  // Development database URLs (optional for multi-environment support)
  DEV_DATABASE_URL: z.string().url().optional(),
  STAGING_DATABASE_URL: z.string().url().optional(),
  PRODUCTION_DATABASE_URL: z.string().url().optional(),
  
  // JWT 配置
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Google OAuth 配置
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required for OAuth authentication'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required for OAuth authentication'),
  
  // Email Service 配置 (任選其一)
  EMAIL_PROVIDER: z.enum(['smtp', 'gmail', 'sendgrid', 'aws-ses']).default('smtp'),
  
  // SMTP 配置 (EMAIL_PROVIDER = 'smtp' 時必需)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).optional(),
  SMTP_SECURE: z.string().transform((val) => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Gmail OAuth 配置 (EMAIL_PROVIDER = 'gmail' 時必需)
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  
  // SendGrid 配置 (EMAIL_PROVIDER = 'sendgrid' 時必需)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  
  // AWS SES 配置 (EMAIL_PROVIDER = 'aws-ses' 時必需)
  AWS_SES_REGION: z.string().optional(),
  AWS_SES_ACCESS_KEY_ID: z.string().optional(),
  AWS_SES_SECRET_ACCESS_KEY: z.string().optional(),
  
  // 系統配置
  SYSTEM_EMAIL: z.string().email('SYSTEM_EMAIL must be a valid email address').default('system@kcislk.edu.hk'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email address').default('admin@kcislk.edu.hk'),
  
  // 檔案上傳配置
  UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('10485760'), // 10MB
  
  // 速率限制配置
  RATE_LIMIT_MAX: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('900000'), // 15 minutes
  
  // 開發模式配置
  ENABLE_DEBUG_LOGS: z.string().transform((val) => val === 'true').default('false'),
  DISABLE_AUTH_IN_DEV: z.string().transform((val) => val === 'true').default('false'),
  
  // 快取配置
  CACHE_TTL_SHORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('60'), // 1 minute
  CACHE_TTL_MEDIUM: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('300'), // 5 minutes
  CACHE_TTL_LONG: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('3600'), // 1 hour
  
  // 效能監控
  ENABLE_PERFORMANCE_MONITORING: z.string().transform((val) => val === 'true').default('true'),
  SLOW_QUERY_THRESHOLD: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).default('100'), // 100ms
})

// 自定義驗證規則
const validateEmailProvider = (data: any) => {
  const provider = data.EMAIL_PROVIDER
  
  switch (provider) {
    case 'smtp':
      if (!data.SMTP_HOST || !data.SMTP_USER || !data.SMTP_PASS) {
        throw new Error('SMTP configuration incomplete: SMTP_HOST, SMTP_USER, SMTP_PASS required when EMAIL_PROVIDER=smtp')
      }
      break
    case 'gmail':
      if (!data.GMAIL_CLIENT_ID || !data.GMAIL_CLIENT_SECRET || !data.GMAIL_REFRESH_TOKEN) {
        throw new Error('Gmail OAuth configuration incomplete: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN required when EMAIL_PROVIDER=gmail')
      }
      break
    case 'sendgrid':
      if (!data.SENDGRID_API_KEY || !data.SENDGRID_FROM_EMAIL) {
        throw new Error('SendGrid configuration incomplete: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL required when EMAIL_PROVIDER=sendgrid')
      }
      break
    case 'aws-ses':
      if (!data.AWS_SES_REGION || !data.AWS_SES_ACCESS_KEY_ID || !data.AWS_SES_SECRET_ACCESS_KEY) {
        throw new Error('AWS SES configuration incomplete: AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY required when EMAIL_PROVIDER=aws-ses')
      }
      break
  }
  
  return true
}

// 驗證環境變數
export function validateEnv() {
  try {
    // 基本驗證
    const parsed = envSchema.parse(process.env)
    
    // 自定義驗證
    validateEmailProvider(parsed)
    
    console.log('✅ Environment variables validation passed')
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error('❌ Environment validation failed:', error.message)
    }
    
    // 在開發模式下提供友善的錯誤訊息
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📝 Please check your .env file and ensure all required variables are set.')
      console.log('💡 See .env.example for reference configuration.')
    }
    
    process.exit(1)
  }
}

// 類型安全的環境變數存取
let validatedEnv: z.infer<typeof envSchema>

export function getEnv() {
  if (!validatedEnv) {
    validatedEnv = validateEnv()
  }
  return validatedEnv
}

// 簡化的環境變數存取函式
export const env = {
  // 快速存取常用變數
  get NODE_ENV() { return getEnv().NODE_ENV },
  get DATABASE_URL() { return getEnv().DATABASE_URL },
  get JWT_SECRET() { return getEnv().JWT_SECRET },
  get GOOGLE_CLIENT_ID() { return getEnv().GOOGLE_CLIENT_ID },
  get GOOGLE_CLIENT_SECRET() { return getEnv().GOOGLE_CLIENT_SECRET },
  get EMAIL_PROVIDER() { return getEnv().EMAIL_PROVIDER },
  get SYSTEM_EMAIL() { return getEnv().SYSTEM_EMAIL },
  get ADMIN_EMAIL() { return getEnv().ADMIN_EMAIL },
  
  // 條件式存取（僅在配置存在時返回）
  smtp: {
    get host() { return getEnv().SMTP_HOST },
    get port() { return getEnv().SMTP_PORT },
    get secure() { return getEnv().SMTP_SECURE },
    get user() { return getEnv().SMTP_USER },
    get pass() { return getEnv().SMTP_PASS },
  },
  
  gmail: {
    get clientId() { return getEnv().GMAIL_CLIENT_ID },
    get clientSecret() { return getEnv().GMAIL_CLIENT_SECRET },
    get refreshToken() { return getEnv().GMAIL_REFRESH_TOKEN },
  },
  
  sendgrid: {
    get apiKey() { return getEnv().SENDGRID_API_KEY },
    get fromEmail() { return getEnv().SENDGRID_FROM_EMAIL },
  },
  
  awsSes: {
    get region() { return getEnv().AWS_SES_REGION },
    get accessKeyId() { return getEnv().AWS_SES_ACCESS_KEY_ID },
    get secretAccessKey() { return getEnv().AWS_SES_SECRET_ACCESS_KEY },
  },
  
  // 效能和快取設定
  performance: {
    get enableMonitoring() { return getEnv().ENABLE_PERFORMANCE_MONITORING },
    get slowQueryThreshold() { return getEnv().SLOW_QUERY_THRESHOLD },
  },
  
  cache: {
    get ttlShort() { return getEnv().CACHE_TTL_SHORT },
    get ttlMedium() { return getEnv().CACHE_TTL_MEDIUM },
    get ttlLong() { return getEnv().CACHE_TTL_LONG },
  },
  
  // 開發設定
  dev: {
    get enableDebugLogs() { return getEnv().ENABLE_DEBUG_LOGS },
    get disableAuthInDev() { return getEnv().DISABLE_AUTH_IN_DEV },
  },
  
  // 檢查環境
  get isDevelopment() { return this.NODE_ENV === 'development' },
  get isProduction() { return this.NODE_ENV === 'production' },
  get isTest() { return this.NODE_ENV === 'test' },
}

// 環境變數類型匯出
export type ValidatedEnv = z.infer<typeof envSchema>

// 在應用啟動時自動驗證（跳過建置過程和測試環境）
// 暫時停用自動驗證以進行建置測試
// if (process.env.NODE_ENV !== 'test' && !process.env.NEXT_PHASE) {
//   try {
//     validateEnv()
//   } catch (error) {
//     // 在建置過程中不強制終止，但記錄警告
//     if (process.env.NODE_ENV === 'production') {
//       console.warn('⚠️ Environment validation failed during build - ensure proper env vars are set for runtime')
//     } else {
//       throw error
//     }
//   }
// }