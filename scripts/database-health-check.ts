#!/usr/bin/env tsx

/**
 * Database Health Check Script
 * 資料庫健康檢查腳本
 * 
 * Comprehensive health check for database connectivity, schema, and data integrity
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

interface HealthIssue {
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: string
  component: string
  description: string
  recommendation: string
  details?: any
}

class DatabaseHealthChecker {
  private prisma: PrismaClient
  private issues: HealthIssue[] = []
  private stats: any = {}
  
  constructor() {
    this.prisma = new PrismaClient()
  }
  
  async runHealthCheck(): Promise<void> {
    console.log('🏥 Starting comprehensive database health check...\n')
    
    try {
      // Basic connectivity
      await this.checkDatabaseConnection()
      
      // Schema validation
      await this.checkDatabaseSchema()
      
      // Performance checks
      await this.checkDatabasePerformance()
      
      // Data integrity basics
      await this.checkBasicDataIntegrity()
      
      // Database statistics
      await this.collectDatabaseStats()
      
      // Generate health report
      this.generateHealthReport()
      
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      this.issues.push({
        severity: 'critical',
        category: 'Connection',
        component: 'Database',
        description: `Health check failed: ${error}`,
        recommendation: 'Check database connection and permissions'
      })
    } finally {
      await this.prisma.$disconnect()
    }
  }
  
  private async checkDatabaseConnection(): Promise<void> {
    console.log('📡 Checking database connection...')
    
    try {
      const startTime = Date.now()
      await this.prisma.$queryRaw`SELECT 1 as health_check`
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      console.log(`✅ Database connection successful (${responseTime}ms)`)
      
      if (responseTime > 1000) {
        this.issues.push({
          severity: 'warning',
          category: 'Performance',
          component: 'Connection',
          description: `Slow database connection: ${responseTime}ms`,
          recommendation: 'Check database server performance and network latency'
        })
      }
      
      this.stats.connectionTime = responseTime
      
    } catch (error) {
      this.issues.push({
        severity: 'critical',
        category: 'Connection',
        component: 'Database',
        description: `Cannot connect to database: ${error}`,
        recommendation: 'Check DATABASE_URL and database availability'
      })
      throw error
    }
  }
  
  private async checkDatabaseSchema(): Promise<void> {
    console.log('📋 Checking database schema...')
    
    try {
      // Check if main tables exist
      const tableCheck = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
      
      const tables = Array.isArray(tableCheck) ? tableCheck.map((t: any) => t.table_name) : []
      const expectedTables = [
        'users', 'roles', 'user_roles', 'accounts', 'user_sessions',
        'announcements', 'newsletters', 'events', 'event_registrations', 'event_notifications',
        'resources', 'resource_categories', 'resource_tags', 'resource_tag_relations',
        'resource_versions', 'resource_edit_history', 'grade_levels',
        'notifications', 'notification_preferences', 'message_board', 'message_replies',
        'feedback_forms', 'system_settings', 'file_uploads', 'user_grade_assignments',
        'teacher_reminders', 'communications', 'communication_replies',
        'coffee_with_principal', 'permission_upgrade_requests'
      ]
      
      const missingTables = expectedTables.filter(table => !tables.includes(table))
      const extraTables = tables.filter((table: string) => !expectedTables.includes(table))
      
      console.log(`📊 Found ${tables.length} tables in database`)
      
      if (missingTables.length > 0) {
        this.issues.push({
          severity: 'error',
          category: 'Schema',
          component: 'Tables',
          description: `Missing tables: ${missingTables.join(', ')}`,
          recommendation: 'Run database migrations: npm run db:migrate',
          details: { missingTables }
        })
      }
      
      if (extraTables.length > 0) {
        this.issues.push({
          severity: 'info',
          category: 'Schema',
          component: 'Tables',
          description: `Extra tables found: ${extraTables.join(', ')}`,
          recommendation: 'Review if these tables are needed',
          details: { extraTables }
        })
      }
      
      this.stats.totalTables = tables.length
      this.stats.expectedTables = expectedTables.length
      this.stats.missingTables = missingTables.length
      
    } catch (error) {
      this.issues.push({
        severity: 'error',
        category: 'Schema',
        component: 'Database',
        description: `Schema check failed: ${error}`,
        recommendation: 'Check database permissions and schema access'
      })
    }
  }
  
  private async checkDatabasePerformance(): Promise<void> {
    console.log('⚡ Checking database performance...')
    
    try {
      // Check database version
      const versionResult = await this.prisma.$queryRaw`SELECT version() as version`
      const version = Array.isArray(versionResult) && versionResult.length > 0 
        ? (versionResult[0] as any).version 
        : 'Unknown'
      
      console.log(`📊 Database version: ${version}`)
      
      // Check database size (if accessible)
      try {
        const sizeResult = await this.prisma.$queryRaw`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `
        const size = Array.isArray(sizeResult) && sizeResult.length > 0 
          ? (sizeResult[0] as any).size 
          : 'Unknown'
        
        console.log(`💾 Database size: ${size}`)
        this.stats.databaseSize = size
        
      } catch (error) {
        console.log('ℹ️  Database size check skipped (insufficient permissions)')
      }
      
      // Check table sizes for existing tables
      try {
        const tableSizes = await this.prisma.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
          FROM pg_tables 
          WHERE schemaname = 'public'
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 10
        `
        
        if (Array.isArray(tableSizes) && tableSizes.length > 0) {
          console.log('📊 Top 10 largest tables:')
          tableSizes.forEach((table: any) => {
            console.log(`   ${table.tablename}: ${table.size}`)
          })
          this.stats.tableSizes = tableSizes
        }
        
      } catch (error) {
        console.log('ℹ️  Table size check skipped')
      }
      
      // Simple performance test
      const perfStartTime = Date.now()
      await this.prisma.$queryRaw`SELECT COUNT(*) FROM information_schema.tables`
      const perfEndTime = Date.now()
      const queryTime = perfEndTime - perfStartTime
      
      if (queryTime > 500) {
        this.issues.push({
          severity: 'warning',
          category: 'Performance',
          component: 'Query',
          description: `Slow query performance: ${queryTime}ms for simple query`,
          recommendation: 'Check database server resources and optimization'
        })
      }
      
      this.stats.version = version
      this.stats.simpleQueryTime = queryTime
      
    } catch (error) {
      this.issues.push({
        severity: 'warning',
        category: 'Performance',
        component: 'Database',
        description: `Performance check failed: ${error}`,
        recommendation: 'Manual performance investigation required'
      })
    }
  }
  
  private async checkBasicDataIntegrity(): Promise<void> {
    console.log('🔍 Checking basic data integrity...')
    
    try {
      // Only run integrity checks if we can access the main tables
      const tableExists = async (tableName: string): Promise<boolean> => {
        try {
          await this.prisma.$queryRawUnsafe(`SELECT 1 FROM ${tableName} LIMIT 1`)
          return true
        } catch {
          return false
        }
      }
      
      // Check main tables if they exist
      if (await tableExists('users')) {
        const userCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
        const userCountValue = Array.isArray(userCount) ? parseInt((userCount[0] as any)?.count || '0') : 0
        console.log(`👥 Users: ${userCountValue}`)
        this.stats.userCount = userCountValue
        
        if (userCountValue === 0) {
          this.issues.push({
            severity: 'warning',
            category: 'Data',
            component: 'Users',
            description: 'No users found in database',
            recommendation: 'Create initial user accounts or run database seeding'
          })
        }
      }
      
      if (await tableExists('events')) {
        const eventCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM events`
        const eventCountValue = Array.isArray(eventCount) ? parseInt((eventCount[0] as any)?.count || '0') : 0
        console.log(`📅 Events: ${eventCountValue}`)
        this.stats.eventCount = eventCountValue
      }
      
      if (await tableExists('resources')) {
        const resourceCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM resources`
        const resourceCountValue = Array.isArray(resourceCount) ? parseInt((resourceCount[0] as any)?.count || '0') : 0
        console.log(`📚 Resources: ${resourceCountValue}`)
        this.stats.resourceCount = resourceCountValue
      }
      
      if (await tableExists('announcements')) {
        const announcementCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM announcements`
        const announcementCountValue = Array.isArray(announcementCount) ? parseInt((announcementCount[0] as any)?.count || '0') : 0
        console.log(`📢 Announcements: ${announcementCountValue}`)
        this.stats.announcementCount = announcementCountValue
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'info',
        category: 'Data',
        component: 'Integrity',
        description: `Data integrity check skipped: ${error}`,
        recommendation: 'Run database migrations and seeding first'
      })
    }
  }
  
  private async collectDatabaseStats(): Promise<void> {
    console.log('📊 Collecting database statistics...')
    
    try {
      // Connection statistics
      const connectionStats = await this.prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `
      
      if (Array.isArray(connectionStats) && connectionStats.length > 0) {
        const stats = connectionStats[0] as any
        console.log(`🔌 Database connections - Total: ${stats.total_connections}, Active: ${stats.active_connections}, Idle: ${stats.idle_connections}`)
        this.stats.connections = stats
        
        if (parseInt(stats.active_connections) > 50) {
          this.issues.push({
            severity: 'warning',
            category: 'Performance',
            component: 'Connections',
            description: `High number of active connections: ${stats.active_connections}`,
            recommendation: 'Monitor connection usage and implement connection pooling'
          })
        }
      }
      
    } catch (error) {
      console.log('ℹ️  Database statistics collection skipped (insufficient permissions)')
      this.issues.push({
        severity: 'info',
        category: 'Monitoring',
        component: 'Statistics',
        description: 'Cannot collect detailed database statistics',
        recommendation: 'Grant necessary permissions for monitoring'
      })
    }
  }
  
  private generateHealthReport(): void {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const errorIssues = this.issues.filter(i => i.severity === 'error')
    const warningIssues = this.issues.filter(i => i.severity === 'warning')
    const infoIssues = this.issues.filter(i => i.severity === 'info')
    
    console.log('\n🏥 Database Health Report')
    console.log('='.repeat(50))
    console.log(`Total Issues Found: ${this.issues.length}`)
    console.log(`🔴 Critical: ${criticalIssues.length}`)
    console.log(`🟠 Error: ${errorIssues.length}`)
    console.log(`🟡 Warning: ${warningIssues.length}`)
    console.log(`ℹ️  Info: ${infoIssues.length}`)
    console.log()
    
    // Database Statistics
    if (Object.keys(this.stats).length > 0) {
      console.log('📊 Database Statistics:')
      if (this.stats.connectionTime) console.log(`   Connection Time: ${this.stats.connectionTime}ms`)
      if (this.stats.totalTables) console.log(`   Total Tables: ${this.stats.totalTables}`)
      if (this.stats.userCount !== undefined) console.log(`   Users: ${this.stats.userCount}`)
      if (this.stats.eventCount !== undefined) console.log(`   Events: ${this.stats.eventCount}`)
      if (this.stats.resourceCount !== undefined) console.log(`   Resources: ${this.stats.resourceCount}`)
      if (this.stats.announcementCount !== undefined) console.log(`   Announcements: ${this.stats.announcementCount}`)
      if (this.stats.databaseSize) console.log(`   Database Size: ${this.stats.databaseSize}`)
      console.log()
    }
    
    // Group issues by severity and category
    const severityGroups = [
      { level: 'critical', issues: criticalIssues, emoji: '🔴' },
      { level: 'error', issues: errorIssues, emoji: '🟠' },
      { level: 'warning', issues: warningIssues, emoji: '🟡' },
      { level: 'info', issues: infoIssues, emoji: 'ℹ️' }
    ]
    
    for (const group of severityGroups) {
      if (group.issues.length > 0) {
        console.log(`${group.emoji} ${group.level.toUpperCase()} ISSUES:`)
        
        group.issues.forEach((issue, index) => {
          console.log(`\n${index + 1}. ${issue.component}: ${issue.description}`)
          console.log(`   Category: ${issue.category}`)
          console.log(`   Recommendation: ${issue.recommendation}`)
        })
        
        console.log()
      }
    }
    
    // Save detailed JSON report
    const report = {
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL',
      summary: {
        total: this.issues.length,
        critical: criticalIssues.length,
        error: errorIssues.length,
        warning: warningIssues.length,
        info: infoIssues.length
      },
      statistics: this.stats,
      issues: this.issues,
      healthScore: this.calculateHealthScore()
    }
    
    const outputPath = path.join(process.cwd(), 'output', 'database-health-report.json')
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2))
    console.log(`📄 Detailed health report saved to: ${outputPath}`)
    
    // Final assessment
    const healthScore = this.calculateHealthScore()
    console.log(`\n🏥 Overall Health Score: ${healthScore}/100`)
    
    if (criticalIssues.length > 0) {
      console.log('\n❌ Critical database issues found!')
      console.log('Immediate action required.')
      process.exit(1)
    } else if (errorIssues.length > 0) {
      console.log('\n⚠️  Database errors found.')
      console.log('Please address these issues.')
    } else if (warningIssues.length > 0) {
      console.log('\n👍 Database is functional with some warnings.')
      console.log('Consider addressing warnings for optimal performance.')
    } else {
      console.log('\n✅ Database health is excellent!')
    }
  }
  
  private calculateHealthScore(): number {
    let score = 100
    
    // Deduct points for issues
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30
          break
        case 'error':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 2
          break
      }
    })
    
    // Bonus points for good performance
    if (this.stats.connectionTime && this.stats.connectionTime < 100) {
      score += 5
    }
    
    return Math.max(0, Math.min(100, score))
  }
}

async function main() {
  const checker = new DatabaseHealthChecker()
  await checker.runHealthCheck()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Database health check failed:', error)
    process.exit(1)
  })
}