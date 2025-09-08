/**
 * Production Database Health Monitor
 * 生產環境資料庫健康監控
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// 載入生產環境配置
dotenv.config({ path: '.env.production' })

const prisma = new PrismaClient()

interface HealthCheck {
  service: string
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  message: string
  details?: any
  responseTime?: number
}

class ProductionHealthMonitor {
  private checks: HealthCheck[] = []

  private addCheck(service: string, status: 'HEALTHY' | 'WARNING' | 'CRITICAL', message: string, details?: any, responseTime?: number) {
    this.checks.push({ service, status, message, details, responseTime })
  }

  /**
   * 檢查資料庫連線
   */
  async checkDatabaseConnection() {
    const startTime = Date.now()
    
    try {
      await prisma.$connect()
      const responseTime = Date.now() - startTime
      
      if (responseTime > 5000) {
        this.addCheck('Database Connection', 'WARNING', 'Connection slow', { responseTime }, responseTime)
      } else {
        this.addCheck('Database Connection', 'HEALTHY', 'Connection successful', { responseTime }, responseTime)
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.addCheck('Database Connection', 'CRITICAL', 'Connection failed', { error: error instanceof Error ? error.message : String(error) }, responseTime)
    }
  }

  /**
   * 檢查關鍵表格
   */
  async checkCriticalTables() {
    const criticalTables = ['users', 'roles', 'user_roles', 'accounts']
    
    try {
      const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ANY(${criticalTables});
      `
      
      const existingTables = tables.map(t => t.table_name)
      const missingTables = criticalTables.filter(table => !existingTables.includes(table))
      
      if (missingTables.length === 0) {
        this.addCheck('Critical Tables', 'HEALTHY', 'All critical tables exist', { existing: existingTables })
      } else {
        this.addCheck('Critical Tables', 'CRITICAL', 'Missing critical tables', { missing: missingTables, existing: existingTables })
      }
    } catch (error) {
      this.addCheck('Critical Tables', 'CRITICAL', 'Failed to check tables', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 檢查基礎角色
   */
  async checkBasicRoles() {
    const requiredRoles = ['admin', 'office_member', 'viewer']
    
    try {
      const roles = await prisma.role.findMany({
        select: { name: true }
      })
      
      const existingRoles = roles.map(r => r.name)
      const missingRoles = requiredRoles.filter(role => !existingRoles.includes(role))
      
      if (missingRoles.length === 0) {
        this.addCheck('Basic Roles', 'HEALTHY', 'All required roles exist', { existing: existingRoles })
      } else {
        this.addCheck('Basic Roles', 'WARNING', 'Missing required roles', { missing: missingRoles, existing: existingRoles })
      }
    } catch (error) {
      this.addCheck('Basic Roles', 'CRITICAL', 'Failed to check roles', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 檢查用戶數量和活動
   */
  async checkUserActivity() {
    try {
      const userCount = await prisma.user.count()
      const activeUsersCount = await prisma.user.count({
        where: { isActive: true }
      })
      const recentLogins = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
          }
        }
      })
      
      this.addCheck('User Activity', 'HEALTHY', 'User metrics collected', {
        totalUsers: userCount,
        activeUsers: activeUsersCount,
        recentLogins: recentLogins
      })
    } catch (error) {
      this.addCheck('User Activity', 'WARNING', 'Failed to get user metrics', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 檢查環境變數
   */
  checkEnvironmentVariables() {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ]
    
    const missingVars = requiredVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      this.addCheck('Environment Variables', 'HEALTHY', 'All required variables present')
    } else {
      this.addCheck('Environment Variables', 'CRITICAL', 'Missing environment variables', { missing: missingVars })
    }
  }

  /**
   * 執行完整健康檢查
   */
  async runHealthCheck() {
    console.log('🏥 Production Health Check Starting...\n')
    
    const startTime = Date.now()
    
    try {
      // 執行所有檢查
      this.checkEnvironmentVariables()
      await this.checkDatabaseConnection()
      await this.checkCriticalTables()
      await this.checkBasicRoles()
      await this.checkUserActivity()
      
      const totalTime = Date.now() - startTime
      
      // 顯示結果
      this.printResults()
      
      // 總結
      const healthy = this.checks.filter(c => c.status === 'HEALTHY').length
      const warnings = this.checks.filter(c => c.status === 'WARNING').length
      const critical = this.checks.filter(c => c.status === 'CRITICAL').length
      
      console.log('\n📊 Health Check Summary')
      console.log('=' .repeat(50))
      console.log(`✅ HEALTHY: ${healthy}/${this.checks.length}`)
      console.log(`⚠️ WARNINGS: ${warnings}/${this.checks.length}`)
      console.log(`🚨 CRITICAL: ${critical}/${this.checks.length}`)
      console.log(`⏱️ Total time: ${totalTime}ms\n`)
      
      if (critical > 0) {
        console.log('🚨 CRITICAL ISSUES DETECTED - Immediate attention required!')
        return false
      } else if (warnings > 0) {
        console.log('⚠️ Some warnings detected - Please review')
        return true
      } else {
        console.log('🎉 All systems healthy!')
        return true
      }
      
    } finally {
      await prisma.$disconnect()
    }
  }

  /**
   * 打印檢查結果
   */
  private printResults() {
    for (const check of this.checks) {
      const statusIcon = check.status === 'HEALTHY' ? '✅' : check.status === 'WARNING' ? '⚠️' : '🚨'
      const timing = check.responseTime ? ` (${check.responseTime}ms)` : ''
      
      console.log(`${statusIcon} ${check.service}: ${check.message}${timing}`)
      
      if (check.details) {
        console.log(`   Details:`, JSON.stringify(check.details, null, 2))
      }
    }
  }
}

// 執行健康檢查
async function main() {
  const monitor = new ProductionHealthMonitor()
  
  try {
    const isHealthy = await monitor.runHealthCheck()
    process.exit(isHealthy ? 0 : 1)
  } catch (error) {
    console.error('❌ Health check failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { ProductionHealthMonitor }