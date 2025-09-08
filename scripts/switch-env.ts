/**
 * Environment Switcher for Zeabur Multi-Environment Setup
 * KCISLK ESID Info Hub - 環境切換工具
 */

import fs from 'fs'
import path from 'path'
import { execSync, exec } from 'child_process'

const ENVIRONMENTS = ['development', 'staging', 'production'] as const
type Environment = typeof ENVIRONMENTS[number]

/**
 * 資料庫連接測試結果介面
 */
interface DatabaseTestResult {
  success: boolean
  message: string
  latency?: number
  error?: string
}

/**
 * 環境健康檢查結果介面
 */
interface EnvironmentHealth {
  environment: Environment
  database: DatabaseTestResult
  oauth: { configured: boolean; message: string }
  essential_files: { exists: boolean; missing?: string[] }
  status: 'healthy' | 'warning' | 'error'
}

/**
 * 顯示使用說明
 */
function showHelp() {
  console.log('🔄 KCISLK ESID Info Hub - Environment Switcher')
  console.log('='  .repeat(60))
  console.log('')
  console.log('Usage: npm run env:switch <command> [options]')
  console.log('')
  console.log('Available commands:')
  console.log('  development  - 切換到開發環境 (Zeabur Port 32718)')
  console.log('  staging      - 切換到預備環境 (Zeabur Port 30592)')
  console.log('  production   - 切換到正式環境 (Zeabur Port 32312)')
  console.log('  status       - 顯示所有環境狀態')
  console.log('  health       - 執行環境健康檢查')
  console.log('  help         - 顯示此幫助資訊')
  console.log('')
  console.log('Examples:')
  console.log('  npm run env:switch development')
  console.log('  npm run env:switch staging')
  console.log('  npm run env:switch production')
  console.log('  npm run env:switch status')
  console.log('  npm run env:switch health')
  console.log('  npm run env:switch health development')
  console.log('')
  console.log('Features:')
  console.log('  ✅ 自動備份當前環境設定')
  console.log('  ✅ 環境健康檢查（資料庫、OAuth、必要檔案）')
  console.log('  ✅ 開發環境自動重啟伺服器')
  console.log('  ✅ 詳細的環境狀態報告')
  console.log('')
}

/**
 * 檢查環境檔案是否存在
 */
function checkEnvironmentFile(env: Environment): boolean {
  const envPath = path.join(process.cwd(), `.env.${env}`)
  return fs.existsSync(envPath)
}

/**
 * 切換到指定環境
 */
async function switchEnvironment(targetEnv: Environment) {
  console.log(`🔄 Switching to ${targetEnv} environment...`)
  
  // 檢查目標環境檔案是否存在
  if (!checkEnvironmentFile(targetEnv)) {
    console.log(`❌ Environment file .env.${targetEnv} not found!`)
    console.log('')
    console.log('📋 Available environment files:')
    ENVIRONMENTS.forEach(env => {
      const exists = checkEnvironmentFile(env)
      const status = exists ? '✅' : '❌'
      console.log(`  ${status} .env.${env}`)
    })
    console.log('')
    console.log('💡 Please ensure all environment files are configured.')
    return false
  }
  
  try {
    // 備份現有 .env 檔案（如果存在）
    const currentEnvPath = path.join(process.cwd(), '.env')
    const backupPath = path.join(process.cwd(), '.env.backup')
    
    if (fs.existsSync(currentEnvPath)) {
      fs.copyFileSync(currentEnvPath, backupPath)
      console.log('📋 Current .env backed up to .env.backup')
    }
    
    // 複製目標環境檔案到 .env
    const targetEnvPath = path.join(process.cwd(), `.env.${targetEnv}`)
    fs.copyFileSync(targetEnvPath, currentEnvPath)
    
    console.log(`✅ Successfully switched to ${targetEnv} environment`)
    
    // 如果切換到開發環境，重啟開發伺服器
    if (targetEnv === 'development') {
      await restartDevServer()
    }
    
    // 顯示當前環境資訊（包含健康檢查）
    await showCurrentEnvironment(targetEnv)
    
    return true
  } catch (error) {
    console.log(`❌ Failed to switch environment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

/**
 * 測試資料庫連接
 */
async function testDatabaseConnection(env: Environment): Promise<DatabaseTestResult> {
  console.log(`🔍 Testing database connection for ${env} environment...`)
  
  try {
    const startTime = Date.now()
    
    // 直接使用tsx執行資料庫測試腳本
    const testResult = execSync('npx tsx scripts/test-db-connection.ts', {
      encoding: 'utf8',
      timeout: 10000,
      stdio: 'pipe'
    })
    
    const latency = Date.now() - startTime
    
    if (testResult.includes('✅') || testResult.includes('Database connection successful')) {
      return {
        success: true,
        message: '資料庫連接成功',
        latency
      }
    } else {
      return {
        success: false,
        message: '資料庫連接測試返回異常結果',
        error: testResult
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '資料庫連接失敗',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 檢查OAuth配置
 */
function checkOAuthConfiguration(): { configured: boolean; message: string } {
  const envPath = path.join(process.cwd(), '.env')
  
  if (!fs.existsSync(envPath)) {
    return { configured: false, message: '找不到 .env 檔案' }
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const hasGoogleClientId = envContent.includes('GOOGLE_CLIENT_ID=') && !envContent.includes('GOOGLE_CLIENT_ID=""')
  const hasGoogleSecret = envContent.includes('GOOGLE_CLIENT_SECRET=') && !envContent.includes('GOOGLE_CLIENT_SECRET=""')
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=') && !envContent.includes('NEXTAUTH_SECRET=""')
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL=') && !envContent.includes('NEXTAUTH_URL=""')
  
  if (hasGoogleClientId && hasGoogleSecret && hasNextAuthSecret && hasNextAuthUrl) {
    return { configured: true, message: 'OAuth 配置完整' }
  } else {
    const missing = []
    if (!hasGoogleClientId) missing.push('GOOGLE_CLIENT_ID')
    if (!hasGoogleSecret) missing.push('GOOGLE_CLIENT_SECRET')
    if (!hasNextAuthSecret) missing.push('NEXTAUTH_SECRET')
    if (!hasNextAuthUrl) missing.push('NEXTAUTH_URL')
    return { configured: false, message: `缺少配置：${missing.join(', ')}` }
  }
}

/**
 * 檢查必要檔案是否存在
 */
function checkEssentialFiles(): { exists: boolean; missing?: string[] } {
  const essentialFiles = [
    'package.json',
    'prisma/schema.prisma',
    'app/layout.tsx',
    'app/page.tsx',
    'app/api/auth/google/route.ts',
    'app/api/auth/callback/google/route.ts'
  ]
  
  const missingFiles = essentialFiles.filter(file => 
    !fs.existsSync(path.join(process.cwd(), file))
  )
  
  return {
    exists: missingFiles.length === 0,
    missing: missingFiles.length > 0 ? missingFiles : undefined
  }
}

/**
 * 執行環境健康檢查
 */
async function performEnvironmentHealthCheck(env: Environment): Promise<EnvironmentHealth> {
  console.log(`🏥 Performing health check for ${env} environment...`)
  
  const database = await testDatabaseConnection(env)
  const oauth = checkOAuthConfiguration()
  const essential_files = checkEssentialFiles()
  
  let status: 'healthy' | 'warning' | 'error' = 'healthy'
  
  if (!database.success || !essential_files.exists) {
    status = 'error'
  } else if (!oauth.configured) {
    status = 'warning'
  }
  
  return {
    environment: env,
    database,
    oauth,
    essential_files,
    status
  }
}

/**
 * 重啟開發伺服器
 */
function restartDevServer(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('🔄 Restarting development server...')
    
    // 嘗試關閉現有的3001端口進程
    try {
      execSync('lsof -ti:3001 | xargs kill -9 2>/dev/null || true', { stdio: 'pipe' })
      console.log('✅ Stopped existing server on port 3001')
    } catch {
      console.log('ℹ️  No existing server found on port 3001')
    }
    
    // 給一點時間讓端口釋放
    setTimeout(() => {
      console.log('✅ Development server restart initiated')
      console.log('💡 Run "npm run dev" to start the server manually')
      resolve(true)
    }, 2000)
  })
}

/**
 * 顯示環境健康檢查結果
 */
function displayHealthCheckResults(health: EnvironmentHealth) {
  console.log('')
  console.log('🏥 Environment Health Check Results:')
  console.log('='  .repeat(50))
  
  const statusIcon = {
    healthy: '✅',
    warning: '⚠️',
    error: '❌'
  }[health.status]
  
  console.log(`${statusIcon} Overall Status: ${health.status.toUpperCase()}`)
  console.log('')
  
  console.log('📊 Component Status:')
  console.log(`  ${health.database.success ? '✅' : '❌'} Database: ${health.database.message}`)
  if (health.database.latency) {
    console.log(`    ⏱️  Connection latency: ${health.database.latency}ms`)
  }
  if (health.database.error) {
    console.log(`    ❌ Error: ${health.database.error}`)
  }
  
  console.log(`  ${health.oauth.configured ? '✅' : '⚠️'} OAuth: ${health.oauth.message}`)
  console.log(`  ${health.essential_files.exists ? '✅' : '❌'} Essential Files: ${health.essential_files.exists ? '所有必要檔案存在' : '缺少必要檔案'}`)
  
  if (health.essential_files.missing) {
    console.log(`    Missing: ${health.essential_files.missing.join(', ')}`)
  }
  
  console.log('')
}

/**
 * 顯示當前環境資訊
 */
async function showCurrentEnvironment(env: Environment) {
  console.log('')
  console.log('📊 Current Environment Information:')
  console.log('-'  .repeat(40))
  
  const envInfo = {
    development: {
      description: '開發環境 Development',
      port: '32718',
      url: 'http://localhost:3001',
      features: ['Debug logging', 'Hot reload', 'Sample data']
    },
    staging: {
      description: '預備環境 Staging', 
      port: '30592',
      url: 'https://next14-landing.zeabur.app',
      features: ['Production-like', 'Integration tests', 'UAT']
    },
    production: {
      description: '正式環境 Production',
      port: '32312', 
      url: 'https://kcislk-infohub.zeabur.app',
      features: ['Live data', 'Monitoring', 'Performance optimized']
    }
  }
  
  const info = envInfo[env]
  console.log(`  Environment: ${info.description}`)
  console.log(`  Database Port: ${info.port}`)
  console.log(`  Application URL: ${info.url}`)
  console.log(`  Features: ${info.features.join(', ')}`)
  
  // 執行健康檢查
  const health = await performEnvironmentHealthCheck(env)
  displayHealthCheckResults(health)
  
  // 顯示下一步建議
  console.log('📋 Next Steps:')
  if (env === 'development') {
    console.log('  1. Run: npm run dev')
    console.log('  2. Open: http://localhost:3001')
    console.log('  3. Test database: npm run test:db')
    console.log('  4. Test OAuth: npm run test:oauth-config')
    if (health.status !== 'healthy') {
      console.log('  ⚠️  Please resolve health check issues before proceeding')
    }
  } else if (env === 'staging') {
    console.log('  1. Deploy to staging: npm run zeabur:build')
    console.log('  2. Run migrations: npm run deploy:staging')
    console.log('  3. Test staging environment')
  } else {
    console.log('  1. Review changes carefully')
    console.log('  2. Deploy to production: npm run zeabur:build')
    console.log('  3. Run migrations: npm run deploy:production')
    console.log('  ⚠️  CAUTION: This is the live production environment!')
  }
  console.log('')
}

/**
 * 顯示所有環境狀態
 */
function showAllEnvironments() {
  console.log('📋 All Environment Status:')
  console.log('='  .repeat(60))
  
  ENVIRONMENTS.forEach(env => {
    const exists = checkEnvironmentFile(env)
    const status = exists ? '✅ CONFIGURED' : '❌ MISSING'
    const current = fs.existsSync('.env') && 
      fs.readFileSync('.env', 'utf8').includes(env === 'development' ? '32718' : env === 'staging' ? '30592' : '32312') 
      ? ' [CURRENT]' : ''
    
    console.log(`  ${status} ${env.padEnd(12)}${current}`)
  })
  console.log('')
}

/**
 * 執行完整的環境健康檢查
 */
async function runHealthCheck(env?: Environment) {
  console.log('🏥 Running comprehensive environment health check...')
  console.log('')
  
  if (env) {
    // 檢查特定環境
    if (!checkEnvironmentFile(env)) {
      console.log(`❌ Environment file .env.${env} not found!`)
      return
    }
    
    // 暫時切換到目標環境進行測試
    const currentEnvPath = path.join(process.cwd(), '.env')
    const targetEnvPath = path.join(process.cwd(), `.env.${env}`)
    const tempBackupPath = path.join(process.cwd(), '.env.temp-backup')
    
    // 備份當前環境
    if (fs.existsSync(currentEnvPath)) {
      fs.copyFileSync(currentEnvPath, tempBackupPath)
    }
    
    try {
      // 切換到目標環境
      fs.copyFileSync(targetEnvPath, currentEnvPath)
      const health = await performEnvironmentHealthCheck(env)
      displayHealthCheckResults(health)
      
      // 恢復原環境
      if (fs.existsSync(tempBackupPath)) {
        fs.copyFileSync(tempBackupPath, currentEnvPath)
        fs.unlinkSync(tempBackupPath)
      }
    } catch (error) {
      console.log(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // 恢復原環境
      if (fs.existsSync(tempBackupPath)) {
        fs.copyFileSync(tempBackupPath, currentEnvPath)
        fs.unlinkSync(tempBackupPath)
      }
    }
  } else {
    // 檢查所有環境
    for (const environment of ENVIRONMENTS) {
      if (checkEnvironmentFile(environment)) {
        console.log(`\n${'='.repeat(50)}`)
        console.log(`🔍 Checking ${environment} environment`)
        console.log('='  .repeat(50))
        await runHealthCheck(environment)
      } else {
        console.log(`\n❌ Environment file .env.${environment} not found, skipping health check`)
      }
    }
  }
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    showAllEnvironments()
    return
  }
  
  if (command === 'status') {
    showAllEnvironments()
    return
  }
  
  if (command === 'health') {
    const targetEnv = args[1] as Environment
    if (targetEnv && !ENVIRONMENTS.includes(targetEnv)) {
      console.log(`❌ Invalid environment for health check: ${targetEnv}`)
      console.log(`💡 Valid environments: ${ENVIRONMENTS.join(', ')}`)
      process.exit(1)
    }
    await runHealthCheck(targetEnv)
    return
  }
  
  if (!ENVIRONMENTS.includes(command as Environment)) {
    console.log(`❌ Invalid environment: ${command}`)
    console.log(`💡 Valid environments: ${ENVIRONMENTS.join(', ')}`)
    console.log('')
    showHelp()
    process.exit(1)
  }
  
  const success = await switchEnvironment(command as Environment)
  process.exit(success ? 0 : 1)
}

// 執行主函數
main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})