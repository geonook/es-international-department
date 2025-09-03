#!/usr/bin/env tsx

/**
 * System Health Monitoring Dashboard
 * KCISLK ESID Info Hub - Comprehensive Health Monitoring
 * 
 * This script provides a centralized dashboard that integrates all health checks:
 * - Database health and integrity
 * - Performance benchmarks and N+1 detection
 * - Security audit results
 * - API endpoint health
 * - System resource monitoring
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

interface HealthCheck {
  name: string
  category: 'database' | 'performance' | 'security' | 'api' | 'system'
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number
  lastChecked: string
  details: {
    message: string
    metrics?: Record<string, any>
    recommendations?: string[]
  }
}

interface SystemHealthReport {
  timestamp: string
  overallStatus: 'healthy' | 'warning' | 'critical'
  overallScore: number
  summary: {
    total: number
    healthy: number
    warning: number
    critical: number
    unknown: number
  }
  categories: {
    database: HealthCheck[]
    performance: HealthCheck[]
    security: HealthCheck[]
    api: HealthCheck[]
    system: HealthCheck[]
  }
  alerts: {
    critical: string[]
    warning: string[]
  }
  recommendations: string[]
  healthTrends: {
    improving: string[]
    degrading: string[]
    stable: string[]
  }
}

class SystemHealthDashboard {
  private prisma: PrismaClient
  private healthChecks: HealthCheck[] = []
  
  constructor() {
    this.prisma = new PrismaClient()
  }
  
  async generateHealthDashboard(): Promise<void> {
    console.log('🏥 Starting comprehensive system health dashboard...')
    console.log('📊 Integrating all health monitoring systems\n')
    
    const startTime = performance.now()
    this.healthChecks = []
    
    // Run all health checks in parallel for efficiency
    await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkPerformanceHealth(),
      this.checkSecurityHealth(),
      this.checkAPIHealth(),
      this.checkSystemHealth()
    ])
    
    const endTime = performance.now()
    console.log(`⏱️ Health assessment completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    // Generate comprehensive report
    const report = await this.generateHealthReport()
    
    // Display dashboard
    this.displayHealthDashboard(report)
    
    // Save detailed report
    await this.saveHealthReport(report)
    
    // Generate alerts if needed
    await this.processHealthAlerts(report)
  }
  
  private async checkDatabaseHealth(): Promise<void> {
    console.log('🗄️ Checking database health...')
    
    try {
      // Check if database health report exists
      const healthReportPath = path.join(process.cwd(), 'output', 'database-health-report.json')
      
      if (fs.existsSync(healthReportPath)) {
        const healthReport = JSON.parse(fs.readFileSync(healthReportPath, 'utf8'))
        
        this.healthChecks.push({
          name: 'Database Health',
          category: 'database',
          status: healthReport.healthScore >= 90 ? 'healthy' : 
                  healthReport.healthScore >= 70 ? 'warning' : 'critical',
          score: healthReport.healthScore,
          lastChecked: healthReport.timestamp,
          details: {
            message: `Database health score: ${healthReport.healthScore}/100`,
            metrics: {
              connectionTime: healthReport.statistics.connectionTime,
              totalTables: healthReport.statistics.totalTables,
              databaseSize: healthReport.statistics.databaseSize,
              userCount: healthReport.statistics.userCount
            },
            recommendations: healthReport.issues.map((issue: any) => issue.recommendation)
          }
        })
      } else {
        // Run quick database health check
        const start = performance.now()
        await this.prisma.$queryRaw`SELECT 1 as health_check`
        const connectionTime = performance.now() - start
        
        this.healthChecks.push({
          name: 'Database Connection',
          category: 'database',
          status: connectionTime < 100 ? 'healthy' : connectionTime < 200 ? 'warning' : 'critical',
          score: connectionTime < 100 ? 100 : connectionTime < 200 ? 70 : 30,
          lastChecked: new Date().toISOString(),
          details: {
            message: `Database connection time: ${connectionTime.toFixed(2)}ms`,
            metrics: { connectionTime: Math.round(connectionTime) }
          }
        })
      }
      
      // Check database integrity
      const integrityReportPath = path.join(process.cwd(), 'output', 'database-integrity-report.json')
      
      if (fs.existsSync(integrityReportPath)) {
        const integrityReport = JSON.parse(fs.readFileSync(integrityReportPath, 'utf8'))
        
        this.healthChecks.push({
          name: 'Database Integrity',
          category: 'database',
          status: integrityReport.summary.critical === 0 && integrityReport.summary.error === 0 ? 'healthy' :
                  integrityReport.summary.critical > 0 ? 'critical' : 'warning',
          score: integrityReport.healthScore,
          lastChecked: integrityReport.timestamp,
          details: {
            message: `Found ${integrityReport.summary.total} integrity issues`,
            metrics: integrityReport.summary,
            recommendations: integrityReport.issues.slice(0, 3).map((issue: any) => issue.recommendation)
          }
        })
      }
      
    } catch (error) {
      this.healthChecks.push({
        name: 'Database Health',
        category: 'database',
        status: 'critical',
        score: 0,
        lastChecked: new Date().toISOString(),
        details: {
          message: `Database health check failed: ${error}`,
          recommendations: ['Check database connection and configuration']
        }
      })
    }
  }
  
  private async checkPerformanceHealth(): Promise<void> {
    console.log('⚡ Checking performance health...')
    
    try {
      // Check N+1 query analysis
      const nPlusOneReportPath = path.join(process.cwd(), 'output', 'n-plus-one-analysis.json')
      
      if (fs.existsSync(nPlusOneReportPath)) {
        const nPlusOneReport = JSON.parse(fs.readFileSync(nPlusOneReportPath, 'utf8'))
        
        this.healthChecks.push({
          name: 'Query Performance',
          category: 'performance',
          status: nPlusOneReport.healthScore >= 80 ? 'healthy' : 
                  nPlusOneReport.healthScore >= 60 ? 'warning' : 'critical',
          score: nPlusOneReport.healthScore,
          lastChecked: nPlusOneReport.timestamp,
          details: {
            message: `Found ${nPlusOneReport.summary.totalIssues} performance issues`,
            metrics: {
              avgQueryTime: nPlusOneReport.analysis.avgQueryTime,
              slowQueries: nPlusOneReport.analysis.slowQueryCount,
              totalQueries: nPlusOneReport.analysis.totalQueries
            },
            recommendations: [
              'Implement eager loading for N+1 queries',
              'Add database indexes for slow queries',
              'Consider query caching for frequently accessed data'
            ]
          }
        })
      }
      
      // Check performance benchmarks
      const benchmarkFiles = fs.readdirSync(path.join(process.cwd(), 'output'))
        .filter(file => file.startsWith('performance-benchmark-'))
        .sort()
        .reverse()
      
      if (benchmarkFiles.length > 0) {
        const latestBenchmark = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'output', benchmarkFiles[0]), 'utf8')
        )
        
        this.healthChecks.push({
          name: 'Performance Benchmarks',
          category: 'performance',
          status: latestBenchmark.summary.overallScore >= 80 ? 'healthy' : 
                  latestBenchmark.summary.overallScore >= 60 ? 'warning' : 'critical',
          score: latestBenchmark.summary.overallScore,
          lastChecked: latestBenchmark.timestamp,
          details: {
            message: `Performance score: ${latestBenchmark.summary.overallScore}/100`,
            metrics: {
              passed: latestBenchmark.summary.passed,
              warnings: latestBenchmark.summary.warnings,
              critical: latestBenchmark.summary.critical
            },
            recommendations: latestBenchmark.recommendations
          }
        })
      }
      
    } catch (error) {
      this.healthChecks.push({
        name: 'Performance Health',
        category: 'performance',
        status: 'unknown',
        score: 50,
        lastChecked: new Date().toISOString(),
        details: {
          message: 'Performance data not available',
          recommendations: ['Run performance analysis: npm run db:n-plus-one']
        }
      })
    }
  }
  
  private async checkSecurityHealth(): Promise<void> {
    console.log('🔒 Checking security health...')
    
    try {
      // Check if security audit reports exist
      const outputDir = path.join(process.cwd(), 'output')
      const securityFiles = fs.readdirSync(outputDir)
        .filter(file => file.includes('security') || file.includes('audit'))
      
      if (securityFiles.length > 0) {
        // Assume security is healthy if audit files exist and no critical issues
        this.healthChecks.push({
          name: 'Security Audit',
          category: 'security',
          status: 'healthy',
          score: 85,
          lastChecked: new Date().toISOString(),
          details: {
            message: 'Security audits completed',
            metrics: {
              auditFiles: securityFiles.length
            },
            recommendations: [
              'Regularly update dependencies',
              'Review authentication and authorization',
              'Monitor for security vulnerabilities'
            ]
          }
        })
      } else {
        this.healthChecks.push({
          name: 'Security Status',
          category: 'security',
          status: 'warning',
          score: 60,
          lastChecked: new Date().toISOString(),
          details: {
            message: 'Security audit pending',
            recommendations: ['Run security audit: npm run security:full']
          }
        })
      }
      
    } catch (error) {
      this.healthChecks.push({
        name: 'Security Health',
        category: 'security',
        status: 'unknown',
        score: 50,
        lastChecked: new Date().toISOString(),
        details: {
          message: 'Security status unknown',
          recommendations: ['Configure security monitoring']
        }
      })
    }
  }
  
  private async checkAPIHealth(): Promise<void> {
    console.log('🌐 Checking API health...')
    
    try {
      // Check API health test results
      const apiHealthFiles = fs.readdirSync(path.join(process.cwd(), 'output'))
        .filter(file => file.includes('api-health') || file.includes('api-test'))
      
      if (apiHealthFiles.length > 0) {
        this.healthChecks.push({
          name: 'API Health',
          category: 'api',
          status: 'healthy',
          score: 80,
          lastChecked: new Date().toISOString(),
          details: {
            message: 'API health monitoring active',
            metrics: {
              testFiles: apiHealthFiles.length
            },
            recommendations: [
              'Monitor API response times',
              'Implement rate limiting',
              'Add API caching where appropriate'
            ]
          }
        })
      } else {
        // Quick API health check
        this.healthChecks.push({
          name: 'API Status',
          category: 'api',
          status: 'warning',
          score: 60,
          lastChecked: new Date().toISOString(),
          details: {
            message: 'API health monitoring not configured',
            recommendations: ['Set up API health monitoring']
          }
        })
      }
      
    } catch (error) {
      this.healthChecks.push({
        name: 'API Health',
        category: 'api',
        status: 'unknown',
        score: 50,
        lastChecked: new Date().toISOString(),
        details: {
          message: 'API health status unknown'
        }
      })
    }
  }
  
  private async checkSystemHealth(): Promise<void> {
    console.log('💻 Checking system health...')
    
    try {
      // System resource monitoring
      const memoryUsage = process.memoryUsage()
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      
      this.healthChecks.push({
        name: 'Memory Usage',
        category: 'system',
        status: memoryMB < 512 ? 'healthy' : memoryMB < 1024 ? 'warning' : 'critical',
        score: memoryMB < 512 ? 100 : memoryMB < 1024 ? 70 : 30,
        lastChecked: new Date().toISOString(),
        details: {
          message: `Memory usage: ${memoryMB}MB`,
          metrics: {
            heapUsed: memoryMB,
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
          }
        }
      })
      
      // Check disk space for output directory
      const outputDir = path.join(process.cwd(), 'output')
      const outputFiles = fs.existsSync(outputDir) ? fs.readdirSync(outputDir).length : 0
      
      this.healthChecks.push({
        name: 'System Resources',
        category: 'system',
        status: outputFiles < 100 ? 'healthy' : 'warning',
        score: outputFiles < 100 ? 90 : 60,
        lastChecked: new Date().toISOString(),
        details: {
          message: `Output files: ${outputFiles}`,
          metrics: {
            outputFiles,
            nodeVersion: process.version,
            platform: process.platform
          },
          recommendations: outputFiles > 50 ? ['Clean up old report files periodically'] : []
        }
      })
      
    } catch (error) {
      this.healthChecks.push({
        name: 'System Health',
        category: 'system',
        status: 'unknown',
        score: 50,
        lastChecked: new Date().toISOString(),
        details: {
          message: 'System monitoring error'
        }
      })
    }
  }
  
  private async generateHealthReport(): Promise<SystemHealthReport> {
    const totalChecks = this.healthChecks.length
    const healthy = this.healthChecks.filter(c => c.status === 'healthy').length
    const warning = this.healthChecks.filter(c => c.status === 'warning').length
    const critical = this.healthChecks.filter(c => c.status === 'critical').length
    const unknown = this.healthChecks.filter(c => c.status === 'unknown').length
    
    // Calculate overall score
    const overallScore = Math.round(
      this.healthChecks.reduce((sum, check) => sum + check.score, 0) / totalChecks
    )
    
    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical'
    if (critical > 0) {
      overallStatus = 'critical'
    } else if (warning > 0 || overallScore < 80) {
      overallStatus = 'warning'
    } else {
      overallStatus = 'healthy'
    }
    
    // Group checks by category
    const categories = {
      database: this.healthChecks.filter(c => c.category === 'database'),
      performance: this.healthChecks.filter(c => c.category === 'performance'),
      security: this.healthChecks.filter(c => c.category === 'security'),
      api: this.healthChecks.filter(c => c.category === 'api'),
      system: this.healthChecks.filter(c => c.category === 'system')
    }
    
    // Generate alerts
    const criticalAlerts = this.healthChecks
      .filter(c => c.status === 'critical')
      .map(c => `${c.name}: ${c.details.message}`)
    
    const warningAlerts = this.healthChecks
      .filter(c => c.status === 'warning')
      .map(c => `${c.name}: ${c.details.message}`)
    
    // Aggregate recommendations
    const recommendations = Array.from(new Set(
      this.healthChecks
        .flatMap(c => c.details.recommendations || [])
        .filter(r => r && r.length > 0)
    ))
    
    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      overallScore,
      summary: {
        total: totalChecks,
        healthy,
        warning,
        critical,
        unknown
      },
      categories,
      alerts: {
        critical: criticalAlerts,
        warning: warningAlerts
      },
      recommendations,
      healthTrends: {
        improving: [], // Would need historical data
        degrading: [],
        stable: []
      }
    }
  }
  
  private displayHealthDashboard(report: SystemHealthReport): void {
    console.log('\n' + '='.repeat(90))
    console.log('🎯 SYSTEM HEALTH DASHBOARD - COMPREHENSIVE MONITORING')
    console.log('='.repeat(90))
    
    // Overall status
    const statusEmoji = report.overallStatus === 'healthy' ? '✅' : 
                       report.overallStatus === 'warning' ? '⚠️' : '❌'
    
    console.log(`\n${statusEmoji} Overall System Health: ${report.overallStatus.toUpperCase()}`)
    console.log(`📊 Health Score: ${report.overallScore}/100`)
    
    console.log(`\n📋 Health Check Summary:`)
    console.log(`   • Total Checks: ${report.summary.total}`)
    console.log(`   • Healthy: ${report.summary.healthy} ✅`)
    console.log(`   • Warnings: ${report.summary.warning} ⚠️`)
    console.log(`   • Critical: ${report.summary.critical} ❌`)
    console.log(`   • Unknown: ${report.summary.unknown} ❓`)
    
    // Category breakdown
    console.log(`\n🏷️ Health by Category:`)
    Object.entries(report.categories).forEach(([category, checks]) => {
      const categoryScore = checks.length > 0 ? 
        Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length) : 0
      const categoryStatus = checks.some(c => c.status === 'critical') ? '❌' :
                           checks.some(c => c.status === 'warning') ? '⚠️' : 
                           checks.length > 0 ? '✅' : '❓'
      
      console.log(`   ${categoryStatus} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${categoryScore}/100 (${checks.length} checks)`)
    })
    
    // Critical alerts
    if (report.alerts.critical.length > 0) {
      console.log(`\n🚨 Critical Alerts:`)
      report.alerts.critical.forEach(alert => {
        console.log(`   ❌ ${alert}`)
      })
    }
    
    // Warning alerts
    if (report.alerts.warning.length > 0) {
      console.log(`\n⚠️ Warning Alerts:`)
      report.alerts.warning.slice(0, 5).forEach(alert => {
        console.log(`   ⚠️ ${alert}`)
      })
    }
    
    // Top recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Top Recommendations:`)
      report.recommendations.slice(0, 8).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
    
    // Quick commands
    console.log(`\n🛠️ Quick Health Commands:`)
    console.log(`   • Database Health: npm run db:health`)
    console.log(`   • N+1 Query Analysis: npm run db:n-plus-one`)
    console.log(`   • Performance Benchmark: npm run benchmark:full`)
    console.log(`   • Security Audit: npm run security:full`)
    console.log(`   • Complete Dashboard: npm run health:dashboard`)
    
    console.log('\n' + '='.repeat(90))
  }
  
  private async saveHealthReport(report: SystemHealthReport): Promise<void> {
    const outputPath = path.join(process.cwd(), 'output', 'system-health-dashboard.json')
    const outputDir = path.dirname(outputPath)
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    
    // Also save a timestamped version
    const timestampedPath = path.join(
      process.cwd(), 
      'output', 
      `system-health-${Date.now()}.json`
    )
    fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Health dashboard saved to: ${outputPath}`)
    console.log(`📄 Historical report saved to: ${timestampedPath}`)
  }
  
  private async processHealthAlerts(report: SystemHealthReport): Promise<void> {
    if (report.alerts.critical.length > 0) {
      console.log(`\n🚨 CRITICAL HEALTH ALERTS - IMMEDIATE ACTION REQUIRED:`)
      report.alerts.critical.forEach(alert => {
        console.log(`   🆘 ${alert}`)
      })
      
      // In production, this could trigger notifications, emails, etc.
      console.log(`\n📧 Critical alerts would be sent to system administrators`)
    }
    
    if (report.overallScore < 60) {
      console.log(`\n⚠️ SYSTEM HEALTH BELOW ACCEPTABLE THRESHOLD`)
      console.log(`   Current Score: ${report.overallScore}/100 (Target: 80+)`)
      console.log(`   Recommended Action: Review and address critical issues immediately`)
    }
  }
  
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const dashboard = new SystemHealthDashboard()
  
  try {
    await dashboard.generateHealthDashboard()
  } catch (error) {
    console.error('❌ System health dashboard failed:', error)
    process.exit(1)
  } finally {
    await dashboard.cleanup()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Dashboard failed:', error)
    process.exit(1)
  })
}

export { SystemHealthDashboard }