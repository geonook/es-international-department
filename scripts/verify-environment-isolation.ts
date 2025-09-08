/**
 * Multi-Environment Database Isolation Verifier
 * 多環境資料庫隔離驗證工具
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// 環境類型定義
type Environment = 'development' | 'staging' | 'production'

interface DatabaseInfo {
  environment: Environment
  port: number
  instance: string
  expectedPort: number
  status: 'CONNECTED' | 'FAILED' | 'WRONG_DATABASE'
  message: string
  responseTime?: number
  tableCount?: number
  hasUserTable?: boolean
}

class EnvironmentIsolationVerifier {
  private results: DatabaseInfo[] = []

  /**
   * 預期的資料庫配置
   */
  private expectedConfig = {
    development: { port: 32718, instance: 'postgresql-noce' },
    staging: { port: 30592, instance: 'postgresql-prouse' },
    production: { port: 32312, instance: 'postgresql' }
  }

  /**
   * 測試特定環境的資料庫連線
   */
  async testEnvironmentDatabase(env: Environment) {
    console.log(`🔍 Testing ${env} environment database...`)
    
    const startTime = Date.now()
    
    try {
      // 載入環境變數
      const envPath = path.join(process.cwd(), `.env.${env}`)
      
      if (!fs.existsSync(envPath)) {
        this.results.push({
          environment: env,
          port: 0,
          instance: 'unknown',
          expectedPort: this.expectedConfig[env].port,
          status: 'FAILED',
          message: `.env.${env} file not found`
        })
        return
      }

      // 載入環境配置
      dotenv.config({ path: envPath })
      
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        this.results.push({
          environment: env,
          port: 0,
          instance: 'unknown',
          expectedPort: this.expectedConfig[env].port,
          status: 'FAILED',
          message: 'DATABASE_URL not found in environment file'
        })
        return
      }

      // 解析資料庫 URL 取得端口
      const urlMatch = databaseUrl.match(/:(\d+)\//)
      const actualPort = urlMatch ? parseInt(urlMatch[1]) : 0
      const expectedPort = this.expectedConfig[env].port

      // 創建 Prisma 客戶端
      const prisma = new PrismaClient({
        datasources: {
          db: { url: databaseUrl }
        }
      })

      try {
        // 測試連線
        await prisma.$connect()
        const responseTime = Date.now() - startTime

        // 檢查資料庫內容
        const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `
        
        const tableCount = tables.length
        const hasUserTable = tables.some(t => t.table_name === 'users')

        // 判斷狀態
        let status: DatabaseInfo['status'] = 'CONNECTED'
        let message = `Connected successfully (${responseTime}ms)`

        if (actualPort !== expectedPort) {
          status = 'WRONG_DATABASE'
          message = `Connected but using wrong port! Expected: ${expectedPort}, Actual: ${actualPort}`
        }

        this.results.push({
          environment: env,
          port: actualPort,
          instance: this.expectedConfig[env].instance,
          expectedPort,
          status,
          message,
          responseTime,
          tableCount,
          hasUserTable
        })

        await prisma.$disconnect()

      } catch (dbError) {
        await prisma.$disconnect()
        
        this.results.push({
          environment: env,
          port: actualPort,
          instance: this.expectedConfig[env].instance,
          expectedPort,
          status: 'FAILED',
          message: `Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
          responseTime: Date.now() - startTime
        })
      }

    } catch (error) {
      this.results.push({
        environment: env,
        port: 0,
        instance: this.expectedConfig[env].instance,
        expectedPort: this.expectedConfig[env].port,
        status: 'FAILED',
        message: `Environment test failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  /**
   * 檢查環境隔離狀況
   */
  checkIsolation() {
    console.log('\n🔒 Environment Isolation Analysis')
    console.log('=' .repeat(70))

    const connectedEnvs = this.results.filter(r => r.status === 'CONNECTED')
    const wrongDbEnvs = this.results.filter(r => r.status === 'WRONG_DATABASE')
    
    if (wrongDbEnvs.length > 0) {
      console.log('❌ ISOLATION BREACH DETECTED!')
      wrongDbEnvs.forEach(env => {
        console.log(`   ${env.environment}: Using port ${env.port} instead of ${env.expectedPort}`)
      })
    }

    // 檢查端口重複使用
    const portCounts = new Map<number, Environment[]>()
    this.results.forEach(result => {
      if (!portCounts.has(result.port)) {
        portCounts.set(result.port, [])
      }
      portCounts.get(result.port)!.push(result.environment)
    })

    const sharedPorts = Array.from(portCounts.entries()).filter(([port, envs]) => 
      envs.length > 1 && port > 0
    )

    if (sharedPorts.length > 0) {
      console.log('🚨 SHARED DATABASE PORTS DETECTED!')
      sharedPorts.forEach(([port, envs]) => {
        console.log(`   Port ${port} shared by: ${envs.join(', ')}`)
      })
    } else if (connectedEnvs.length === 3) {
      console.log('✅ PERFECT ISOLATION: Each environment uses a different database instance')
    }
  }

  /**
   * 執行完整驗證
   */
  async runFullVerification() {
    console.log('🏥 Multi-Environment Database Isolation Verification')
    console.log('=' .repeat(70))
    console.log('Expected Configuration:')
    Object.entries(this.expectedConfig).forEach(([env, config]) => {
      console.log(`  ${env}: ${config.instance} (port ${config.port})`)
    })
    console.log('')

    // 測試所有環境
    for (const env of ['development', 'staging', 'production'] as Environment[]) {
      await this.testEnvironmentDatabase(env)
    }

    // 顯示結果
    this.printResults()
    
    // 檢查隔離狀況
    this.checkIsolation()
    
    // 總結
    return this.getSummary()
  }

  /**
   * 打印結果
   */
  private printResults() {
    console.log('\n📊 Database Connection Results')
    console.log('=' .repeat(70))

    for (const result of this.results) {
      const statusIcon = result.status === 'CONNECTED' ? '✅' : 
                        result.status === 'WRONG_DATABASE' ? '⚠️' : '❌'
      
      const timing = result.responseTime ? ` (${result.responseTime}ms)` : ''
      
      console.log(`${statusIcon} ${result.environment.toUpperCase()}:`)
      console.log(`   Instance: ${result.instance}`)
      console.log(`   Port: ${result.port} (expected: ${result.expectedPort})`)
      console.log(`   Status: ${result.message}${timing}`)
      
      if (result.tableCount !== undefined) {
        console.log(`   Tables: ${result.tableCount}, Users table: ${result.hasUserTable ? 'YES' : 'NO'}`)
      }
      console.log('')
    }
  }

  /**
   * 取得總結
   */
  private getSummary() {
    const connected = this.results.filter(r => r.status === 'CONNECTED').length
    const wrongDb = this.results.filter(r => r.status === 'WRONG_DATABASE').length
    const failed = this.results.filter(r => r.status === 'FAILED').length
    const total = this.results.length

    console.log('\n📋 Verification Summary')
    console.log('=' .repeat(50))
    console.log(`✅ PROPERLY CONNECTED: ${connected}/${total}`)
    console.log(`⚠️ WRONG DATABASE: ${wrongDb}/${total}`)
    console.log(`❌ FAILED: ${failed}/${total}`)

    const allPortsCorrect = this.results.every(r => r.port === r.expectedPort || r.status === 'FAILED')
    const allConnected = connected + wrongDb === total

    if (allPortsCorrect && allConnected) {
      console.log('\n🎉 PERFECT: All environments are properly isolated!')
      return true
    } else if (wrongDb > 0) {
      console.log('\n⚠️ WARNING: Some environments use wrong database ports')
      return false
    } else {
      console.log('\n❌ CRITICAL: Some environments failed to connect')
      return false
    }
  }
}

// 執行驗證
async function main() {
  const verifier = new EnvironmentIsolationVerifier()
  
  try {
    const isValid = await verifier.runFullVerification()
    process.exit(isValid ? 0 : 1)
  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { EnvironmentIsolationVerifier }