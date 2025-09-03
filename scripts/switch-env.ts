/**
 * Environment Switcher for Zeabur Multi-Environment Setup
 * KCISLK ESID Info Hub - 環境切換工具
 */

import fs from 'fs'
import path from 'path'

const ENVIRONMENTS = ['development', 'staging', 'production'] as const
type Environment = typeof ENVIRONMENTS[number]

/**
 * 顯示使用說明
 */
function showHelp() {
  console.log('🔄 KCISLK ESID Info Hub - Environment Switcher')
  console.log('='  .repeat(60))
  console.log('')
  console.log('Usage: npm run env:switch <environment>')
  console.log('')
  console.log('Available environments:')
  console.log('  development  - 開發環境 (Zeabur Port 32718)')
  console.log('  staging      - 預備環境 (Zeabur Port 30592)')
  console.log('  production   - 正式環境 (Zeabur Port 32312)')
  console.log('')
  console.log('Examples:')
  console.log('  npm run env:switch development')
  console.log('  npm run env:switch staging')
  console.log('  npm run env:switch production')
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
function switchEnvironment(targetEnv: Environment) {
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
    
    // 顯示當前環境資訊
    showCurrentEnvironment(targetEnv)
    
    return true
  } catch (error) {
    console.log(`❌ Failed to switch environment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

/**
 * 顯示當前環境資訊
 */
function showCurrentEnvironment(env: Environment) {
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
      url: 'https://staging.es-international.zeabur.app',
      features: ['Production-like', 'Integration tests', 'UAT']
    },
    production: {
      description: '正式環境 Production',
      port: '32312', 
      url: 'https://es-international.zeabur.app',
      features: ['Live data', 'Monitoring', 'Performance optimized']
    }
  }
  
  const info = envInfo[env]
  console.log(`  Environment: ${info.description}`)
  console.log(`  Database Port: ${info.port}`)
  console.log(`  Application URL: ${info.url}`)
  console.log(`  Features: ${info.features.join(', ')}`)
  console.log('')
  
  // 顯示下一步建議
  console.log('📋 Next Steps:')
  if (env === 'development') {
    console.log('  1. Run: npm run dev')
    console.log('  2. Open: http://localhost:3001')
    console.log('  3. Test database: npm run test:db')
    console.log('  4. Test OAuth: npm run test:oauth-config')
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
 * 主函數
 */
function main() {
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
  
  if (!ENVIRONMENTS.includes(command as Environment)) {
    console.log(`❌ Invalid environment: ${command}`)
    console.log(`💡 Valid environments: ${ENVIRONMENTS.join(', ')}`)
    console.log('')
    showHelp()
    process.exit(1)
  }
  
  const success = switchEnvironment(command as Environment)
  process.exit(success ? 0 : 1)
}

// 執行主函數
main()