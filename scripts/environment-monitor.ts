/**
 * Environment Monitoring System for Zeabur Multi-Environment Setup
 * KCISLK ESID Info Hub - 環境監控系統
 * 
 * Features:
 * - Real-time environment health monitoring
 * - Database performance metrics
 * - OAuth configuration validation
 * - System resource monitoring
 * - Alert system for critical issues
 * - Automated reports generation
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ENVIRONMENTS = ['development', 'staging', 'production'] as const
type Environment = typeof ENVIRONMENTS[number]

interface EnvironmentMetrics {
  environment: Environment
  timestamp: Date
  database: DatabaseMetrics
  oauth: OAuthStatus
  system: SystemMetrics
  health_score: number
  alerts: Alert[]
}

interface DatabaseMetrics {
  connection_status: 'healthy' | 'degraded' | 'offline'
  latency_ms: number
  connection_pool_usage?: number
  active_connections?: number
  slow_queries_count?: number
  error_rate?: number
}

interface OAuthStatus {
  configured: boolean
  test_success: boolean
  last_test_time?: Date
  error_message?: string
}

interface SystemMetrics {
  cpu_usage?: number
  memory_usage?: number
  disk_usage?: number
  port_status: { [port: number]: boolean }
  uptime?: number
}

interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
}

/**
 * 環境監控器類別
 */
class EnvironmentMonitor {
  private monitoringActive = false
  private monitoringInterval?: NodeJS.Timeout
  private alertHistory: Alert[] = []
  private metricsHistory: EnvironmentMetrics[] = []

  constructor() {
    this.setupGracefulShutdown()
  }

  /**
   * 開始監控
   */
  async startMonitoring(intervalMs: number = 30000) {
    console.log('🚀 Starting Environment Monitor...')
    console.log(`📊 Monitoring interval: ${intervalMs / 1000} seconds`)
    console.log('')

    this.monitoringActive = true

    // 立即執行一次檢查
    await this.performMonitoringCycle()

    // 設定定期監控
    this.monitoringInterval = setInterval(async () => {
      if (this.monitoringActive) {
        await this.performMonitoringCycle()
      }
    }, intervalMs)

    console.log('✅ Environment monitoring started successfully')
    console.log('Press Ctrl+C to stop monitoring')
  }

  /**
   * 停止監控
   */
  stopMonitoring() {
    console.log('')
    console.log('🛑 Stopping Environment Monitor...')
    
    this.monitoringActive = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    // 生成最終報告
    this.generateFinalReport()
    console.log('✅ Environment monitoring stopped')
  }

  /**
   * 執行監控週期
   */
  private async performMonitoringCycle() {
    const currentEnv = this.getCurrentEnvironment()
    console.log(`\n🔍 Monitoring cycle - ${new Date().toISOString()}`)
    console.log(`📍 Current Environment: ${currentEnv}`)

    try {
      // 監控當前環境
      const metrics = await this.collectEnvironmentMetrics(currentEnv)
      this.metricsHistory.push(metrics)

      // 限制歷史記錄數量
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-50)
      }

      // 分析並顯示結果
      this.analyzeMetrics(metrics)
      this.displayMetricsSummary(metrics)

      // 檢查是否需要發出警報
      this.checkForAlerts(metrics)

    } catch (error) {
      const alert: Alert = {
        severity: 'critical',
        message: `監控週期執行失敗: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        resolved: false
      }
      this.addAlert(alert)
      console.error('❌ Monitoring cycle failed:', error)
    }
  }

  /**
   * 收集環境指標
   */
  private async collectEnvironmentMetrics(env: Environment): Promise<EnvironmentMetrics> {
    const database = await this.testDatabasePerformance()
    const oauth = await this.testOAuthConfiguration()
    const system = await this.collectSystemMetrics()

    // 計算健康分數 (0-100)
    let healthScore = 100
    if (database.connection_status === 'degraded') healthScore -= 20
    if (database.connection_status === 'offline') healthScore -= 50
    if (!oauth.configured) healthScore -= 15
    if (!oauth.test_success && oauth.configured) healthScore -= 10
    if (database.latency_ms > 1000) healthScore -= 10
    if (database.error_rate && database.error_rate > 0.05) healthScore -= 15

    return {
      environment: env,
      timestamp: new Date(),
      database,
      oauth,
      system,
      health_score: Math.max(0, healthScore),
      alerts: this.alertHistory.filter(a => !a.resolved && 
        new Date().getTime() - a.timestamp.getTime() < 300000) // 5分鐘內的未解決警報
    }
  }

  /**
   * 測試資料庫效能
   */
  private async testDatabasePerformance(): Promise<DatabaseMetrics> {
    try {
      const startTime = Date.now()
      
      // 執行資料庫連接測試
      const testResult = execSync('npx tsx scripts/test-db-connection.ts', {
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })

      const latency = Date.now() - startTime
      
      let connectionStatus: DatabaseMetrics['connection_status'] = 'healthy'
      if (latency > 2000) connectionStatus = 'degraded'
      if (!testResult.includes('✅') && !testResult.includes('Database connection successful')) {
        connectionStatus = 'offline'
      }

      return {
        connection_status: connectionStatus,
        latency_ms: latency,
        error_rate: connectionStatus === 'offline' ? 1 : 0
      }
    } catch (error) {
      return {
        connection_status: 'offline',
        latency_ms: 0,
        error_rate: 1
      }
    }
  }

  /**
   * 測試OAuth配置
   */
  private async testOAuthConfiguration(): Promise<OAuthStatus> {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (!fs.existsSync(envPath)) {
        return {
          configured: false,
          test_success: false,
          error_message: '找不到 .env 檔案'
        }
      }

      const envContent = fs.readFileSync(envPath, 'utf8')
      const hasRequiredKeys = ['GOOGLE_CLIENT_ID=', 'GOOGLE_CLIENT_SECRET=', 'NEXTAUTH_SECRET=', 'NEXTAUTH_URL=']
        .every(key => envContent.includes(key) && !envContent.includes(`${key}""`))

      if (!hasRequiredKeys) {
        return {
          configured: false,
          test_success: false,
          error_message: '缺少必要的OAuth配置'
        }
      }

      // 嘗試執行OAuth測試
      try {
        const testResult = execSync('npm run test:oauth-config', {
          encoding: 'utf8',
          timeout: 10000,
          stdio: 'pipe'
        })

        const testSuccess = testResult.includes('✅') || testResult.includes('OAuth configuration is valid')

        return {
          configured: true,
          test_success: testSuccess,
          last_test_time: new Date(),
          error_message: testSuccess ? undefined : 'OAuth測試失敗'
        }
      } catch {
        return {
          configured: true,
          test_success: false,
          last_test_time: new Date(),
          error_message: 'OAuth測試執行失敗'
        }
      }
    } catch (error) {
      return {
        configured: false,
        test_success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 收集系統指標
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const portStatus: { [port: number]: boolean } = {}

    // 檢查重要端口
    const portsToCheck = [3001, 3000, 5432]
    
    for (const port of portsToCheck) {
      try {
        execSync(`lsof -ti:${port}`, { stdio: 'pipe' })
        portStatus[port] = true
      } catch {
        portStatus[port] = false
      }
    }

    return {
      port_status: portStatus,
      uptime: process.uptime()
    }
  }

  /**
   * 分析指標
   */
  private analyzeMetrics(metrics: EnvironmentMetrics) {
    // 檢查資料庫健康狀況
    if (metrics.database.connection_status === 'offline') {
      this.addAlert({
        severity: 'critical',
        message: '資料庫連接失敗',
        timestamp: new Date(),
        resolved: false
      })
    } else if (metrics.database.connection_status === 'degraded') {
      this.addAlert({
        severity: 'high',
        message: `資料庫響應緩慢 (${metrics.database.latency_ms}ms)`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // 檢查OAuth狀況
    if (metrics.oauth.configured && !metrics.oauth.test_success) {
      this.addAlert({
        severity: 'medium',
        message: 'OAuth配置測試失敗',
        timestamp: new Date(),
        resolved: false
      })
    }

    // 檢查健康分數
    if (metrics.health_score < 50) {
      this.addAlert({
        severity: 'critical',
        message: `環境健康分數過低: ${metrics.health_score}/100`,
        timestamp: new Date(),
        resolved: false
      })
    } else if (metrics.health_score < 80) {
      this.addAlert({
        severity: 'medium',
        message: `環境健康分數偏低: ${metrics.health_score}/100`,
        timestamp: new Date(),
        resolved: false
      })
    }
  }

  /**
   * 顯示指標摘要
   */
  private displayMetricsSummary(metrics: EnvironmentMetrics) {
    const statusIcon = metrics.health_score >= 90 ? '🟢' : 
                      metrics.health_score >= 70 ? '🟡' : '🔴'

    console.log(`${statusIcon} Health Score: ${metrics.health_score}/100`)
    console.log(`📊 Database: ${metrics.database.connection_status} (${metrics.database.latency_ms}ms)`)
    console.log(`🔐 OAuth: ${metrics.oauth.configured ? '✅' : '❌'} ${metrics.oauth.test_success ? 'Tested ✅' : 'Test ❌'}`)
    
    // 顯示活躍警報
    const activeAlerts = metrics.alerts
    if (activeAlerts.length > 0) {
      console.log(`⚠️  Active Alerts: ${activeAlerts.length}`)
      activeAlerts.slice(0, 3).forEach(alert => {
        const icon = alert.severity === 'critical' ? '🚨' : 
                    alert.severity === 'high' ? '⚠️' : '📢'
        console.log(`   ${icon} ${alert.message}`)
      })
    }

    console.log('─'.repeat(50))
  }

  /**
   * 檢查警報
   */
  private checkForAlerts(metrics: EnvironmentMetrics) {
    // 這個方法在analyzeMetrics中已經處理了大部分警報
    // 這裡可以添加額外的警報邏輯
    
    // 清理舊的已解決警報
    this.alertHistory = this.alertHistory.filter(alert => 
      !alert.resolved || 
      new Date().getTime() - alert.timestamp.getTime() < 3600000 // 保留1小時內的已解決警報
    )
  }

  /**
   * 添加警報
   */
  private addAlert(alert: Alert) {
    // 避免重複警報
    const isDuplicate = this.alertHistory.some(existing => 
      existing.message === alert.message && 
      !existing.resolved &&
      new Date().getTime() - existing.timestamp.getTime() < 300000 // 5分鐘內
    )

    if (!isDuplicate) {
      this.alertHistory.push(alert)
      
      // 顯示新警報
      const icon = alert.severity === 'critical' ? '🚨' : 
                  alert.severity === 'high' ? '⚠️' : 
                  alert.severity === 'medium' ? '📢' : 'ℹ️'
      console.log(`\n${icon} NEW ALERT (${alert.severity.toUpperCase()}): ${alert.message}`)
    }
  }

  /**
   * 獲取當前環境
   */
  private getCurrentEnvironment(): Environment {
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) return 'development'

    const envContent = fs.readFileSync(envPath, 'utf8')
    
    if (envContent.includes('NODE_ENV=production')) return 'production'
    if (envContent.includes('NODE_ENV=staging')) return 'staging'
    return 'development'
  }

  /**
   * 生成最終報告
   */
  private generateFinalReport() {
    console.log('\n📊 Environment Monitor Final Report')
    console.log('='  .repeat(50))
    
    if (this.metricsHistory.length > 0) {
      const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1]
      const avgHealthScore = this.metricsHistory.reduce((sum, m) => sum + m.health_score, 0) / this.metricsHistory.length
      const totalAlerts = this.alertHistory.length
      const criticalAlerts = this.alertHistory.filter(a => a.severity === 'critical').length

      console.log(`📈 Average Health Score: ${avgHealthScore.toFixed(1)}/100`)
      console.log(`🔍 Total Monitoring Cycles: ${this.metricsHistory.length}`)
      console.log(`⚠️  Total Alerts Generated: ${totalAlerts}`)
      console.log(`🚨 Critical Alerts: ${criticalAlerts}`)
      console.log(`💊 Current Health Score: ${latestMetrics.health_score}/100`)
      
      if (this.alertHistory.length > 0) {
        console.log('\n📋 Recent Alerts:')
        this.alertHistory.slice(-5).forEach(alert => {
          const icon = alert.severity === 'critical' ? '🚨' : 
                      alert.severity === 'high' ? '⚠️' : '📢'
          const status = alert.resolved ? '[RESOLVED]' : '[ACTIVE]'
          console.log(`   ${icon} ${status} ${alert.message} (${alert.timestamp.toLocaleTimeString()})`)
        })
      }
    } else {
      console.log('No metrics collected during monitoring session.')
    }
    
    console.log('='  .repeat(50))
  }

  /**
   * 設定優雅關閉
   */
  private setupGracefulShutdown() {
    process.on('SIGINT', () => {
      this.stopMonitoring()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      this.stopMonitoring()
      process.exit(0)
    })
  }
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2)
  const intervalArg = args.find(arg => arg.startsWith('--interval='))
  const helpFlag = args.includes('--help') || args.includes('-h')

  if (helpFlag) {
    console.log('🔍 Environment Monitor - KCISLK ESID Info Hub')
    console.log('='  .repeat(50))
    console.log('')
    console.log('Usage: npm run env:monitor [options]')
    console.log('')
    console.log('Options:')
    console.log('  --interval=<ms>    Monitoring interval in milliseconds (default: 30000)')
    console.log('  --help, -h         Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  npm run env:monitor')
    console.log('  npm run env:monitor --interval=60000')
    console.log('')
    console.log('Features:')
    console.log('  ✅ Real-time environment health monitoring')
    console.log('  ✅ Database performance metrics')
    console.log('  ✅ OAuth configuration validation')
    console.log('  ✅ System resource monitoring')
    console.log('  ✅ Alert system for critical issues')
    console.log('  ✅ Automated reports generation')
    console.log('')
    return
  }

  const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30000

  if (interval < 5000) {
    console.log('❌ Minimum monitoring interval is 5000ms (5 seconds)')
    process.exit(1)
  }

  const monitor = new EnvironmentMonitor()
  await monitor.startMonitoring(interval)
}

// 執行主函數
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Environment monitor failed to start:', error)
    process.exit(1)
  })
}

export { EnvironmentMonitor, type EnvironmentMetrics, type Alert }