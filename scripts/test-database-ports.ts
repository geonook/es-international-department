/**
 * Database Port Connection Tester
 * 資料庫端口連線測試工具 - 直接測試端口連通性
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface PortTestResult {
  environment: string
  port: number
  host: string
  status: 'OPEN' | 'CLOSED' | 'TIMEOUT'
  responseTime?: number
  message: string
}

class DatabasePortTester {
  private results: PortTestResult[] = []

  /**
   * 測試特定端口的連通性
   */
  async testPort(host: string, port: number, environment: string): Promise<PortTestResult> {
    const startTime = Date.now()
    
    try {
      // 使用 nc (netcat) 測試端口連通性
      const { stdout, stderr } = await execAsync(`nc -z -v -w5 ${host} ${port}`, {
        timeout: 10000
      })
      
      const responseTime = Date.now() - startTime
      
      return {
        environment,
        port,
        host,
        status: 'OPEN',
        responseTime,
        message: `Port ${port} is open and accessible`
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      if (responseTime >= 5000) {
        return {
          environment,
          port,
          host,
          status: 'TIMEOUT',
          responseTime,
          message: `Port ${port} connection timed out`
        }
      } else {
        return {
          environment,
          port,
          host,
          status: 'CLOSED',
          responseTime,
          message: `Port ${port} is closed or unreachable`
        }
      }
    }
  }

  /**
   * 測試所有環境的資料庫端口
   */
  async testAllEnvironmentPorts() {
    console.log('🔌 Testing Database Port Connectivity')
    console.log('=' .repeat(60))

    const host = 'tpe1.clusters.zeabur.com'
    const environments = [
      { name: 'development', port: 32718, instance: 'postgresql-noce' },
      { name: 'staging', port: 30592, instance: 'postgresql-prouse' },
      { name: 'production', port: 32312, instance: 'postgresql' }
    ]

    for (const env of environments) {
      console.log(`\n🔍 Testing ${env.name} (${env.instance})...`)
      const result = await this.testPort(host, env.port, env.name)
      this.results.push(result)
      
      const statusIcon = result.status === 'OPEN' ? '✅' : result.status === 'CLOSED' ? '❌' : '⏳'
      const timing = result.responseTime ? ` (${result.responseTime}ms)` : ''
      console.log(`${statusIcon} ${result.message}${timing}`)
    }

    return this.generateReport()
  }

  /**
   * 生成測試報告
   */
  generateReport() {
    console.log('\n📊 Port Connectivity Report')
    console.log('=' .repeat(50))

    const openPorts = this.results.filter(r => r.status === 'OPEN')
    const closedPorts = this.results.filter(r => r.status === 'CLOSED')
    const timeoutPorts = this.results.filter(r => r.status === 'TIMEOUT')

    console.log(`✅ OPEN PORTS: ${openPorts.length}/${this.results.length}`)
    console.log(`❌ CLOSED PORTS: ${closedPorts.length}/${this.results.length}`)
    console.log(`⏳ TIMEOUT PORTS: ${timeoutPorts.length}/${this.results.length}`)

    if (openPorts.length === this.results.length) {
      console.log('\n🎉 EXCELLENT: All database ports are accessible')
      console.log('   This confirms that you have three separate database instances')
      return true
    } else if (openPorts.length > 0) {
      console.log('\n⚠️ PARTIAL: Some database ports are not accessible')
      console.log('   This may indicate configuration or network issues')
      return false
    } else {
      console.log('\n❌ CRITICAL: No database ports are accessible')
      console.log('   Please check your network connection and database configuration')
      return false
    }
  }
}

// 執行測試
async function main() {
  const tester = new DatabasePortTester()
  
  try {
    const allPortsOpen = await tester.testAllEnvironmentPorts()
    process.exit(allPortsOpen ? 0 : 1)
  } catch (error) {
    console.error('❌ Port testing failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { DatabasePortTester }