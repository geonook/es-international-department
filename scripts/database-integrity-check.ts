#!/usr/bin/env tsx

/**
 * Database Integrity Check Script
 * 資料庫完整性檢查腳本
 * 
 * Comprehensive validation of database relationships, constraints, and data consistency
 * for all 31 models in the Prisma schema
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

interface IntegrityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  model: string
  field?: string
  description: string
  affectedRecords?: number
  recommendation: string
  query?: string
}

class DatabaseIntegrityChecker {
  private prisma: PrismaClient
  private issues: IntegrityIssue[] = []
  
  constructor() {
    this.prisma = new PrismaClient()
  }
  
  async runIntegrityCheck(): Promise<void> {
    console.log('🔍 Starting comprehensive database integrity check...\n')
    
    try {
      // Test database connection
      await this.testDatabaseConnection()
      
      // Check referential integrity
      await this.checkReferentialIntegrity()
      
      // Check unique constraints
      await this.checkUniqueConstraints()
      
      // Check required field constraints
      await this.checkRequiredFields()
      
      // Check data consistency
      await this.checkDataConsistency()
      
      // Check orphaned records
      await this.checkOrphanedRecords()
      
      // Check cascade relationships
      await this.checkCascadeRelationships()
      
      // Check enum/status field validation
      await this.checkEnumConstraints()
      
      // Check timestamp consistency
      await this.checkTimestampConsistency()
      
      // Generate integrity report
      this.generateIntegrityReport()
      
    } catch (error) {
      console.error('❌ Database integrity check failed:', error)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }
  
  private async testDatabaseConnection(): Promise<void> {
    console.log('📡 Testing database connection...')
    
    try {
      await this.prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
    } catch (error) {
      this.issues.push({
        severity: 'critical',
        category: 'Connection',
        model: 'Database',
        description: 'Unable to connect to database',
        recommendation: 'Check DATABASE_URL and database availability'
      })
      throw error
    }
  }
  
  private async checkReferentialIntegrity(): Promise<void> {
    console.log('🔗 Checking referential integrity...')
    
    const relationshipChecks = [
      // User relationships
      {
        model: 'UserRole',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'UserRole references non-existent User'
      },
      {
        model: 'UserRole',
        foreignKey: 'roleId', 
        referenceTable: 'roles',
        referenceKey: 'id',
        description: 'UserRole references non-existent Role'
      },
      {
        model: 'Account',
        foreignKey: 'userId',
        referenceTable: 'users', 
        referenceKey: 'id',
        description: 'Account references non-existent User'
      },
      {
        model: 'UserSession',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id', 
        description: 'UserSession references non-existent User'
      },
      {
        model: 'PermissionUpgradeRequest',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'PermissionUpgradeRequest references non-existent User'
      },
      
      // Content relationships
      {
        model: 'Announcement',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Announcement references non-existent Author'
      },
      {
        model: 'Newsletter',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Newsletter references non-existent Author'
      },
      {
        model: 'Event',
        foreignKey: 'createdBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Event references non-existent Creator'
      },
      {
        model: 'EventRegistration',
        foreignKey: 'eventId',
        referenceTable: 'events',
        referenceKey: 'id',
        description: 'EventRegistration references non-existent Event'
      },
      {
        model: 'EventRegistration',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'EventRegistration references non-existent User'
      },
      {
        model: 'EventNotification',
        foreignKey: 'eventId',
        referenceTable: 'events',
        referenceKey: 'id',
        description: 'EventNotification references non-existent Event'
      },
      
      // Resource relationships
      {
        model: 'Resource',
        foreignKey: 'categoryId',
        referenceTable: 'resource_categories',
        referenceKey: 'id',
        description: 'Resource references non-existent Category'
      },
      {
        model: 'Resource',
        foreignKey: 'gradeLevelId', 
        referenceTable: 'grade_levels',
        referenceKey: 'id',
        description: 'Resource references non-existent GradeLevel'
      },
      {
        model: 'Resource',
        foreignKey: 'createdBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Resource references non-existent Creator'
      },
      {
        model: 'ResourceVersion',
        foreignKey: 'resourceId',
        referenceTable: 'resources',
        referenceKey: 'id',
        description: 'ResourceVersion references non-existent Resource'
      },
      {
        model: 'ResourceEditHistory',
        foreignKey: 'resourceId',
        referenceTable: 'resources',
        referenceKey: 'id',
        description: 'ResourceEditHistory references non-existent Resource'
      },
      {
        model: 'ResourceTagRelation',
        foreignKey: 'resourceId',
        referenceTable: 'resources',
        referenceKey: 'id',
        description: 'ResourceTagRelation references non-existent Resource'
      },
      {
        model: 'ResourceTagRelation',
        foreignKey: 'tagId',
        referenceTable: 'resource_tags', 
        referenceKey: 'id',
        description: 'ResourceTagRelation references non-existent Tag'
      },
      
      // Notification relationships
      {
        model: 'Notification',
        foreignKey: 'recipientId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Notification references non-existent Recipient'
      },
      {
        model: 'NotificationPreference',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'NotificationPreference references non-existent User'
      },
      
      // Message and Feedback relationships
      {
        model: 'MessageBoard',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'MessageBoard references non-existent Author'
      },
      {
        model: 'MessageReply',
        foreignKey: 'messageId',
        referenceTable: 'message_board',
        referenceKey: 'id',
        description: 'MessageReply references non-existent Message'
      },
      {
        model: 'FeedbackForm',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'FeedbackForm references non-existent Author'
      },
      {
        model: 'FeedbackForm',
        foreignKey: 'assignedTo',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'FeedbackForm references non-existent Assignee'
      },
      
      // File and System relationships
      {
        model: 'FileUpload',
        foreignKey: 'uploadedBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'FileUpload references non-existent Uploader'
      },
      {
        model: 'SystemSetting',
        foreignKey: 'updatedBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'SystemSetting references non-existent Updater'
      },
      
      // Grade and Teacher relationships
      {
        model: 'UserGradeAssignment',
        foreignKey: 'userId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'UserGradeAssignment references non-existent User'
      },
      {
        model: 'UserGradeAssignment',
        foreignKey: 'gradeLevelId',
        referenceTable: 'grade_levels',
        referenceKey: 'id',
        description: 'UserGradeAssignment references non-existent GradeLevel'
      },
      {
        model: 'TeacherReminder',
        foreignKey: 'createdBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'TeacherReminder references non-existent Creator'
      },
      {
        model: 'TeacherReminder',
        foreignKey: 'completedBy',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'TeacherReminder references non-existent Completer'
      },
      
      // Communication relationships
      {
        model: 'Communication',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'Communication references non-existent Author'
      },
      {
        model: 'CommunicationReply',
        foreignKey: 'communicationId',
        referenceTable: 'communications',
        referenceKey: 'id',
        description: 'CommunicationReply references non-existent Communication'
      },
      {
        model: 'CommunicationReply',
        foreignKey: 'authorId',
        referenceTable: 'users',
        referenceKey: 'id',
        description: 'CommunicationReply references non-existent Author'
      }
    ]
    
    for (const check of relationshipChecks) {
      try {
        const query = `
          SELECT COUNT(*) as count 
          FROM ${check.model.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')} t1 
          WHERE t1.${check.foreignKey} IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM ${check.referenceTable} t2 
            WHERE t2.${check.referenceKey} = t1.${check.foreignKey}
          )
        `
        
        const result: any[] = await this.prisma.$queryRawUnsafe(query)
        const count = parseInt(result[0]?.count || '0')
        
        if (count > 0) {
          this.issues.push({
            severity: 'high',
            category: 'Referential Integrity',
            model: check.model,
            field: check.foreignKey,
            description: check.description,
            affectedRecords: count,
            recommendation: `Fix orphaned ${check.foreignKey} references in ${check.model}`,
            query: query
          })
        }
      } catch (error) {
        this.issues.push({
          severity: 'medium',
          category: 'Referential Integrity',
          model: check.model,
          field: check.foreignKey,
          description: `Error checking ${check.description}: ${error}`,
          recommendation: 'Manual investigation required'
        })
      }
    }
  }
  
  private async checkUniqueConstraints(): Promise<void> {
    console.log('🔑 Checking unique constraints...')
    
    const uniqueConstraintChecks = [
      {
        table: 'users',
        field: 'email',
        description: 'Duplicate email addresses in users'
      },
      {
        table: 'users', 
        field: 'google_id',
        description: 'Duplicate Google IDs in users'
      },
      {
        table: 'roles',
        field: 'name',
        description: 'Duplicate role names'
      },
      {
        table: 'user_sessions',
        field: 'session_token',
        description: 'Duplicate session tokens'
      },
      {
        table: 'accounts',
        field: 'provider, provider_account_id',
        description: 'Duplicate provider account combinations'
      },
      {
        table: 'resource_categories',
        field: 'name',
        description: 'Duplicate resource category names'
      },
      {
        table: 'grade_levels',
        field: 'name',
        description: 'Duplicate grade level names'
      },
      {
        table: 'resource_tags',
        field: 'name',
        description: 'Duplicate resource tag names'
      },
      {
        table: 'system_settings',
        field: 'key',
        description: 'Duplicate system setting keys'
      },
      {
        table: 'notification_preferences',
        field: 'user_id',
        description: 'Duplicate notification preferences for users'
      }
    ]
    
    for (const check of uniqueConstraintChecks) {
      try {
        const query = `
          SELECT ${check.field}, COUNT(*) as count
          FROM ${check.table}
          WHERE ${check.field} IS NOT NULL
          GROUP BY ${check.field}
          HAVING COUNT(*) > 1
        `
        
        const result = await this.prisma.$queryRawUnsafe(query)
        const duplicates = Array.isArray(result) ? result.length : 0
        
        if (duplicates > 0) {
          this.issues.push({
            severity: 'high',
            category: 'Unique Constraints',
            model: check.table,
            field: check.field,
            description: check.description,
            affectedRecords: duplicates,
            recommendation: `Remove duplicate ${check.field} values in ${check.table}`,
            query: query
          })
        }
      } catch (error) {
        this.issues.push({
          severity: 'low',
          category: 'Unique Constraints',
          model: check.table,
          field: check.field,
          description: `Error checking ${check.description}: ${error}`,
          recommendation: 'Manual investigation required'
        })
      }
    }
  }
  
  private async checkRequiredFields(): Promise<void> {
    console.log('📝 Checking required field constraints...')
    
    const requiredFieldChecks = [
      { table: 'users', field: 'email', description: 'Users without email addresses' },
      { table: 'roles', field: 'name', description: 'Roles without names' },
      { table: 'announcements', field: 'title', description: 'Announcements without titles' },
      { table: 'events', field: 'title', description: 'Events without titles' },
      { table: 'resources', field: 'title', description: 'Resources without titles' },
      { table: 'communications', field: 'title', description: 'Communications without titles' },
      { table: 'message_board', field: 'title', description: 'Message board posts without titles' },
      { table: 'feedback_forms', field: 'subject', description: 'Feedback forms without subjects' },
      { table: 'system_settings', field: 'key', description: 'System settings without keys' },
      { table: 'file_uploads', field: 'original_filename', description: 'File uploads without filenames' },
      { table: 'teacher_reminders', field: 'title', description: 'Teacher reminders without titles' }
    ]
    
    for (const check of requiredFieldChecks) {
      try {
        const query = `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.field} IS NULL OR ${check.field} = ''`
        const result: any[] = await this.prisma.$queryRawUnsafe(query)
        const count = parseInt(result[0]?.count || '0')
        
        if (count > 0) {
          this.issues.push({
            severity: 'medium',
            category: 'Required Fields',
            model: check.table,
            field: check.field,
            description: check.description,
            affectedRecords: count,
            recommendation: `Set required values for ${check.field} in ${check.table}`
          })
        }
      } catch (error) {
        this.issues.push({
          severity: 'low',
          category: 'Required Fields',
          model: check.table,
          field: check.field,
          description: `Error checking ${check.description}: ${error}`,
          recommendation: 'Manual investigation required'
        })
      }
    }
  }
  
  private async checkDataConsistency(): Promise<void> {
    console.log('📊 Checking data consistency...')
    
    try {
      // Check event registration consistency
      const eventRegQuery = `
        SELECT COUNT(*) as count 
        FROM event_registrations er 
        JOIN events e ON er.event_id = e.id 
        WHERE er.registered_at > e.start_date 
        AND e.start_date < NOW()
      `
      const eventRegResult: any[] = await this.prisma.$queryRawUnsafe(eventRegQuery)
      const pastEventRegs = parseInt(eventRegResult[0]?.count || '0')
      
      if (pastEventRegs > 0) {
        this.issues.push({
          severity: 'medium',
          category: 'Data Consistency',
          model: 'EventRegistration',
          description: 'Registrations after event start date',
          affectedRecords: pastEventRegs,
          recommendation: 'Review and correct registration timestamps'
        })
      }
      
      // Check user role consistency
      const roleQuery = `
        SELECT COUNT(*) as count 
        FROM user_roles ur 
        LEFT JOIN roles r ON ur.role_id = r.id 
        WHERE r.id IS NULL
      `
      const roleResult: any[] = await this.prisma.$queryRawUnsafe(roleQuery)
      const invalidRoles = parseInt(roleResult[0]?.count || '0')
      
      if (invalidRoles > 0) {
        this.issues.push({
          severity: 'high',
          category: 'Data Consistency',
          model: 'UserRole',
          description: 'User roles referencing non-existent roles',
          affectedRecords: invalidRoles,
          recommendation: 'Remove invalid role assignments'
        })
      }
      
      // Check resource version consistency
      const versionQuery = `
        SELECT r.id, COUNT(rv.id) as version_count
        FROM resources r
        LEFT JOIN resource_versions rv ON r.id = rv.resource_id
        GROUP BY r.id
        HAVING COUNT(rv.id) > 10
      `
      const versionResult = await this.prisma.$queryRawUnsafe(versionQuery)
      const excessiveVersions = Array.isArray(versionResult) ? versionResult.length : 0
      
      if (excessiveVersions > 0) {
        this.issues.push({
          severity: 'low',
          category: 'Data Consistency',
          model: 'ResourceVersion',
          description: 'Resources with excessive version history',
          affectedRecords: excessiveVersions,
          recommendation: 'Consider archiving old resource versions'
        })
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'medium',
        category: 'Data Consistency',
        model: 'General',
        description: `Error during consistency checks: ${error}`,
        recommendation: 'Manual investigation required'
      })
    }
  }
  
  private async checkOrphanedRecords(): Promise<void> {
    console.log('🏚️ Checking for orphaned records...')
    
    try {
      // Check for users without roles
      const noRoleUsers = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM users u 
        WHERE NOT EXISTS (
          SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
        )
        AND u.is_active = true
      `
      
      const noRoleCount = parseInt((noRoleUsers as any[])[0]?.count || '0')
      if (noRoleCount > 0) {
        this.issues.push({
          severity: 'medium',
          category: 'Orphaned Records',
          model: 'User',
          description: 'Active users without assigned roles',
          affectedRecords: noRoleCount,
          recommendation: 'Assign appropriate roles to active users'
        })
      }
      
      // Check for resources without categories
      const noCategoryResources = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM resources r 
        WHERE r.category_id IS NULL 
        AND r.status = 'published'
      `
      
      const noCategoryCount = parseInt((noCategoryResources as any[])[0]?.count || '0')
      if (noCategoryCount > 0) {
        this.issues.push({
          severity: 'low',
          category: 'Orphaned Records',
          model: 'Resource',
          description: 'Published resources without categories',
          affectedRecords: noCategoryCount,
          recommendation: 'Assign categories to published resources'
        })
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'medium',
        category: 'Orphaned Records',
        model: 'General',
        description: `Error checking orphaned records: ${error}`,
        recommendation: 'Manual investigation required'
      })
    }
  }
  
  private async checkCascadeRelationships(): Promise<void> {
    console.log('🔗 Checking cascade relationship integrity...')
    
    // This check ensures that cascade deletes would work correctly
    // by verifying that parent-child relationships are properly maintained
    
    try {
      const cascadeChecks = [
        {
          parent: 'users',
          child: 'user_roles',
          foreignKey: 'user_id',
          description: 'UserRole cascade delete check'
        },
        {
          parent: 'events',
          child: 'event_registrations',
          foreignKey: 'event_id',
          description: 'EventRegistration cascade delete check'
        },
        {
          parent: 'resources',
          child: 'resource_versions',
          foreignKey: 'resource_id',
          description: 'ResourceVersion cascade delete check'
        },
        {
          parent: 'communications',
          child: 'communication_replies',
          foreignKey: 'communication_id',
          description: 'CommunicationReply cascade delete check'
        }
      ]
      
      for (const check of cascadeChecks) {
        const query = `
          SELECT COUNT(*) as count 
          FROM ${check.child} c 
          WHERE NOT EXISTS (
            SELECT 1 FROM ${check.parent} p 
            WHERE p.id = c.${check.foreignKey}
          )
        `
        
        const result: any[] = await this.prisma.$queryRawUnsafe(query)
        const orphanedCount = parseInt(result[0]?.count || '0')
        
        if (orphanedCount > 0) {
          this.issues.push({
            severity: 'high',
            category: 'Cascade Relationships',
            model: check.child,
            description: `${check.description} - orphaned child records`,
            affectedRecords: orphanedCount,
            recommendation: `Clean up orphaned ${check.child} records`
          })
        }
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'medium',
        category: 'Cascade Relationships',
        model: 'General',
        description: `Error checking cascade relationships: ${error}`,
        recommendation: 'Manual investigation required'
      })
    }
  }
  
  private async checkEnumConstraints(): Promise<void> {
    console.log('📋 Checking enum/status field constraints...')
    
    const enumChecks = [
      {
        table: 'users',
        field: 'provider',
        validValues: ['email', 'google', 'oauth'],
        description: 'Invalid provider values in users'
      },
      {
        table: 'announcements',
        field: 'status',
        validValues: ['draft', 'published', 'archived'],
        description: 'Invalid status values in announcements'
      },
      {
        table: 'announcements',
        field: 'priority',
        validValues: ['low', 'medium', 'high', 'critical'],
        description: 'Invalid priority values in announcements'
      },
      {
        table: 'events',
        field: 'status',
        validValues: ['draft', 'published', 'cancelled', 'completed'],
        description: 'Invalid status values in events'
      },
      {
        table: 'resources',
        field: 'status',
        validValues: ['draft', 'published', 'archived'],
        description: 'Invalid status values in resources'
      },
      {
        table: 'communications',
        field: 'type',
        validValues: ['announcement', 'message', 'reminder', 'newsletter'],
        description: 'Invalid type values in communications'
      },
      {
        table: 'communications',
        field: 'status',
        validValues: ['draft', 'published', 'archived', 'closed'],
        description: 'Invalid status values in communications'
      },
      {
        table: 'feedback_forms',
        field: 'status',
        validValues: ['new', 'in_progress', 'resolved', 'closed'],
        description: 'Invalid status values in feedback forms'
      }
    ]
    
    for (const check of enumChecks) {
      try {
        const valuesList = check.validValues.map(v => `'${v}'`).join(', ')
        const query = `
          SELECT COUNT(*) as count 
          FROM ${check.table} 
          WHERE ${check.field} IS NOT NULL 
          AND ${check.field} NOT IN (${valuesList})
        `
        
        const result: any[] = await this.prisma.$queryRawUnsafe(query)
        const invalidCount = parseInt(result[0]?.count || '0')
        
        if (invalidCount > 0) {
          this.issues.push({
            severity: 'medium',
            category: 'Enum Constraints',
            model: check.table,
            field: check.field,
            description: check.description,
            affectedRecords: invalidCount,
            recommendation: `Update ${check.field} values to valid enums: ${check.validValues.join(', ')}`
          })
        }
      } catch (error) {
        this.issues.push({
          severity: 'low',
          category: 'Enum Constraints',
          model: check.table,
          field: check.field,
          description: `Error checking ${check.description}: ${error}`,
          recommendation: 'Manual investigation required'
        })
      }
    }
  }
  
  private async checkTimestampConsistency(): Promise<void> {
    console.log('⏰ Checking timestamp consistency...')
    
    try {
      // Check for records with updatedAt before createdAt
      const timestampTables = [
        'users', 'announcements', 'events', 'resources', 'communications',
        'message_board', 'feedback_forms', 'teacher_reminders', 'newsletters'
      ]
      
      for (const table of timestampTables) {
        const query = `
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE updated_at < created_at
        `
        
        const result: any[] = await this.prisma.$queryRawUnsafe(query)
        const inconsistentCount = parseInt(result[0]?.count || '0')
        
        if (inconsistentCount > 0) {
          this.issues.push({
            severity: 'low',
            category: 'Timestamp Consistency',
            model: table,
            description: 'Records with updatedAt before createdAt',
            affectedRecords: inconsistentCount,
            recommendation: `Fix timestamp inconsistencies in ${table}`
          })
        }
      }
      
      // Check for future timestamps
      const futureTimestampQuery = `
        SELECT 'events' as table_name, COUNT(*) as count 
        FROM events 
        WHERE start_date > NOW() + INTERVAL '5 years'
        UNION ALL
        SELECT 'announcements' as table_name, COUNT(*) as count 
        FROM announcements 
        WHERE published_at > NOW() + INTERVAL '1 year'
        UNION ALL
        SELECT 'teacher_reminders' as table_name, COUNT(*) as count 
        FROM teacher_reminders 
        WHERE due_date > NOW() + INTERVAL '2 years'
      `
      
      const futureResults = await this.prisma.$queryRawUnsafe(futureTimestampQuery)
      if (Array.isArray(futureResults)) {
        for (const result of futureResults) {
          const count = parseInt((result as any).count || '0')
          if (count > 0) {
            this.issues.push({
              severity: 'low',
              category: 'Timestamp Consistency',
              model: (result as any).table_name,
              description: 'Records with unrealistic future dates',
              affectedRecords: count,
              recommendation: 'Review and correct future date entries'
            })
          }
        }
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'medium',
        category: 'Timestamp Consistency',
        model: 'General',
        description: `Error checking timestamp consistency: ${error}`,
        recommendation: 'Manual investigation required'
      })
    }
  }
  
  private generateIntegrityReport(): void {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const highIssues = this.issues.filter(i => i.severity === 'high')
    const mediumIssues = this.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.issues.filter(i => i.severity === 'low')
    
    console.log('\n🔍 Database Integrity Report')
    console.log('='.repeat(50))
    console.log(`Total Issues Found: ${this.issues.length}`)
    console.log(`🔴 Critical: ${criticalIssues.length}`)
    console.log(`🟠 High: ${highIssues.length}`)
    console.log(`🟡 Medium: ${mediumIssues.length}`)
    console.log(`⚪ Low: ${lowIssues.length}`)
    console.log()
    
    // Group issues by category
    const categoryGroups: Record<string, IntegrityIssue[]> = {}
    this.issues.forEach(issue => {
      if (!categoryGroups[issue.category]) {
        categoryGroups[issue.category] = []
      }
      categoryGroups[issue.category].push(issue)
    })
    
    // Display issues by category
    Object.entries(categoryGroups).forEach(([category, issues]) => {
      console.log(`📊 ${category.toUpperCase()} (${issues.length} issues):`)
      
      issues.forEach((issue, index) => {
        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '⚪'
        }[issue.severity]
        
        console.log(`\n${index + 1}. ${severityEmoji} ${issue.model}${issue.field ? `.${issue.field}` : ''}`)
        console.log(`   ${issue.description}`)
        if (issue.affectedRecords !== undefined) {
          console.log(`   Affected Records: ${issue.affectedRecords}`)
        }
        console.log(`   Recommendation: ${issue.recommendation}`)
      })
      
      console.log()
    })
    
    // Save detailed JSON report
    const report = {
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL',
      totalModels: 31,
      summary: {
        total: this.issues.length,
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      },
      categories: Object.keys(categoryGroups).map(category => ({
        name: category,
        issueCount: categoryGroups[category].length,
        issues: categoryGroups[category]
      })),
      issues: this.issues
    }
    
    const outputPath = path.join(process.cwd(), 'output', 'database-integrity-report.json')
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`📄 Detailed integrity report saved to: ${outputPath}`)
    
    // Final assessment
    if (criticalIssues.length > 0) {
      console.log('\n❌ Critical database integrity issues found!')
      console.log('Immediate action required to prevent data corruption.')
      process.exit(1)
    } else if (highIssues.length > 0) {
      console.log('\n⚠️  High severity integrity issues found.')
      console.log('Please address these issues to maintain data quality.')
    } else if (this.issues.length === 0) {
      console.log('\n✅ No database integrity issues found. Excellent!')
    } else {
      console.log('\n👍 No critical issues found.')
      console.log('Some minor issues detected - consider addressing during maintenance.')
    }
  }
}

async function main() {
  const checker = new DatabaseIntegrityChecker()
  await checker.runIntegrityCheck()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Database integrity check failed:', error)
    process.exit(1)
  })
}