/**
 * Individual Environment Database Connection Tester
 * 個別環境資料庫連線測試工具
 */

import { execSync } from 'child_process'

const environments = ['development', 'staging', 'production'] as const

async function testEnvironmentIndividually(env: typeof environments[number]) {
  console.log(`\n🔍 Testing ${env} environment individually...`)
  
  try {
    const result = execSync(
      `cd "${process.cwd()}" && NODE_ENV=${env} npx dotenv -e .env.${env} -- npx prisma db execute --stdin <<< "SELECT 'Connected to ${env}' as message, current_database() as database;"`,
      { 
        encoding: 'utf8',
        stdio: 'pipe'
      }
    )
    
    console.log(`✅ ${env} result:`)
    console.log(result)
    
  } catch (error) {
    console.log(`❌ ${env} failed:`)
    console.log(error instanceof Error ? error.message : String(error))
  }
}

async function main() {
  console.log('🧪 Testing Each Environment Database Connection Individually')
  console.log('=' .repeat(70))
  
  for (const env of environments) {
    await testEnvironmentIndividually(env)
  }
}

main().catch(console.error)