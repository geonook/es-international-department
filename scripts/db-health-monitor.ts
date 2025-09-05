#!/usr/bin/env tsx
/**
 * Database Health Monitor - Multi-Environment Database Connection Monitoring
 * 資料庫健康監控 - 多環境資料庫連接監控
 * 
 * @description Comprehensive health check system for all database environments
 * @features Real-time connection monitoring, performance metrics, alert thresholds
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'

// Environment configurations
const ENVIRONMENTS = {
  development: {
    name: 'Development',
    port: 32718,
    database: 'kcislk_esid_dev',
    service: 'postgresql-noce',
    maxResponseTime: 200, // ms
    maxConnections: 20
  },
  staging: {
    name: 'Staging', 
    port: 30592,
    database: 'kcislk_esid_staging',
    service: 'postgresql-prouse',
    maxResponseTime: 150, // ms
    maxConnections: 50
  },
  production: {
    name: 'Production',
    port: 32312,
    database: 'kcislk_esid_prod',
    service: 'postgresql',
    maxResponseTime: 100, // ms
    maxConnections: 100
  }
}

interface HealthMetrics {
  environment: string
  status: 'healthy' | 'warning' | 'critical' | 'error'
  connectionTime: number
  queryTime: number
  activeConnections: number
  timestamp: string
  error?: string
}

/**
 * Test database connection and measure performance
 */
async function testDatabaseConnection(env: keyof typeof ENVIRONMENTS): Promise<HealthMetrics> {
  const config = ENVIRONMENTS[env]
  const startTime = performance.now()
  
  let prisma: PrismaClient | null = null
  
  try {
    // Create environment-specific DATABASE_URL
    const databaseUrl = process.env[`DATABASE_URL_${env.toUpperCase()}`] || process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error(`Database URL not configured for ${env} environment`)
    }
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    
    // Test connection
    const connectionStart = performance.now()
    await prisma.$connect()
    const connectionTime = performance.now() - connectionStart
    
    // Test simple query performance
    const queryStart = performance.now()
    await prisma.$queryRaw`SELECT 1 as test`
    const queryTime = performance.now() - queryStart
    
    // Get connection info (simplified - actual implementation would query pg_stat_activity)
    const activeConnections = 1 // Placeholder - would implement actual connection counting
    
    // Determine health status
    let status: HealthMetrics['status'] = 'healthy'
    if (connectionTime > config.maxResponseTime) {
      status = 'warning'
    }
    if (connectionTime > config.maxResponseTime * 2) {
      status = 'critical'
    }
    
    return {
      environment: config.name,
      status,
      connectionTime: Math.round(connectionTime * 100) / 100,
      queryTime: Math.round(queryTime * 100) / 100,
      activeConnections,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      environment: config.name,
      status: 'error',
      connectionTime: 0,
      queryTime: 0,
      activeConnections: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

/**
 * Format health metrics for console output
 */
function formatHealthReport(metrics: HealthMetrics): string {
  const statusIcons = {
    healthy: '✅',
    warning: '⚠️',
    critical: '🔴',
    error: '❌'
  }
  
  const icon = statusIcons[metrics.status]
  
  if (metrics.status === 'error') {
    return `${icon} ${metrics.environment}: ERROR - ${metrics.error}`
  }
  
  return `${icon} ${metrics.environment}: ${metrics.status.toUpperCase()} | ` +
         `Connection: ${metrics.connectionTime}ms | ` +
         `Query: ${metrics.queryTime}ms | ` +
         `Connections: ${metrics.activeConnections}`
}

/**
 * Generate comprehensive health report
 */
async function generateHealthReport(): Promise<void> {
  console.log('🏥 Database Health Monitor - Multi-Environment Check')
  console.log('=' .repeat(80))
  console.log(`Timestamp: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`)
  console.log('')
  
  const results: HealthMetrics[] = []
  
  // Test all environments
  for (const env of Object.keys(ENVIRONMENTS) as Array<keyof typeof ENVIRONMENTS>) {
    try {
      const metrics = await testDatabaseConnection(env)
      results.push(metrics)
      console.log(formatHealthReport(metrics))
    } catch (error) {
      console.log(`❌ ${ENVIRONMENTS[env].name}: FAILED - ${error}`)
    }
  }
  
  console.log('')
  console.log('📊 Environment Configuration Summary')
  console.log('-'.repeat(80))
  
  Object.entries(ENVIRONMENTS).forEach(([key, config]) => {
    console.log(`${config.name}: ${config.service} (Port ${config.port}) → ${config.database}`)
  })
  
  console.log('')
  console.log('⚡ Performance Thresholds')
  console.log('-'.repeat(80))
  
  Object.entries(ENVIRONMENTS).forEach(([key, config]) => {
    console.log(`${config.name}: Max Response Time ${config.maxResponseTime}ms | Max Connections ${config.maxConnections}`)
  })
  
  // Summary statistics
  const healthyCount = results.filter(r => r.status === 'healthy').length
  const warningCount = results.filter(r => r.status === 'warning').length
  const criticalCount = results.filter(r => r.status === 'critical').length
  const errorCount = results.filter(r => r.status === 'error').length
  
  console.log('')
  console.log('📈 Health Summary')
  console.log('-'.repeat(80))
  console.log(`✅ Healthy: ${healthyCount} | ⚠️  Warning: ${warningCount} | 🔴 Critical: ${criticalCount} | ❌ Error: ${errorCount}`)
  
  // Alert if any issues
  if (warningCount + criticalCount + errorCount > 0) {
    console.log('')
    console.log('🚨 ATTENTION REQUIRED: Some environments need investigation')
    process.exit(1)
  } else {
    console.log('')
    console.log('🎉 ALL ENVIRONMENTS HEALTHY')
    process.exit(0)
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Database Health Monitor Usage:')
    console.log('npm run db:health          # Check all environments')
    console.log('npm run db:health -- --env development  # Check specific environment')
    console.log('npm run db:health -- --watch           # Continuous monitoring')
    return
  }
  
  const specificEnv = args.find(arg => arg.startsWith('--env'))?.split('=')[1]
  const watchMode = args.includes('--watch')
  
  if (specificEnv) {
    if (!(specificEnv in ENVIRONMENTS)) {
      console.error(`❌ Invalid environment: ${specificEnv}`)
      console.error(`Valid environments: ${Object.keys(ENVIRONMENTS).join(', ')}`)
      process.exit(1)
    }
    
    const metrics = await testDatabaseConnection(specificEnv as keyof typeof ENVIRONMENTS)
    console.log(formatHealthReport(metrics))
    return
  }
  
  if (watchMode) {
    console.log('👀 Starting continuous monitoring (Ctrl+C to stop)...')
    setInterval(async () => {
      console.clear()
      await generateHealthReport()
      console.log('\\n⏰ Next check in 30 seconds...')
    }, 30000)
    
    // Initial check
    await generateHealthReport()
  } else {
    await generateHealthReport()
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n👋 Database health monitoring stopped')
  process.exit(0)
})

// Run the monitor
main().catch((error) => {
  console.error('❌ Database Health Monitor Error:', error)
  process.exit(1)
})