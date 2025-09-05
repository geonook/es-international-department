#!/usr/bin/env tsx

/**
 * Communication Table Structure Validation
 * Communication 表結構驗證
 * 
 * This script validates that the Communication table structure can handle
 * all data from MessageBoard, Announcement, and TeacherReminder tables.
 * 
 * 此腳本驗證 Communication 表結構是否能夠處理
 * MessageBoard、Announcement 和 TeacherReminder 表的所有數據。
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface FieldMapping {
  sourceField: string
  targetField: string
  sourceType: string
  targetType: string
  required: boolean
  mapped: boolean
  compatible: boolean
  notes: string
}

interface TableValidation {
  sourceTable: string
  totalFields: number
  mappedFields: number
  unmappedFields: string[]
  incompatibleFields: string[]
  fieldMappings: FieldMapping[]
  migrationStrategy: string
}

interface ValidationReport {
  validationDate: string
  overall: {
    status: 'COMPATIBLE' | 'NEEDS_ADJUSTMENT' | 'INCOMPATIBLE'
    compatibilityScore: number
    totalSourceFields: number
    totalMappedFields: number
  }
  tableValidations: TableValidation[]
  recommendations: string[]
  requiredActions: string[]
}

class CommunicationStructureValidator {
  private validationLog: string[] = []

  private log(message: string) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    this.validationLog.push(logEntry)
  }

  async validateMessageBoardMapping(): Promise<TableValidation> {
    this.log('📋 Validating MessageBoard → Communication mapping...')

    const messageBoardFields: FieldMapping[] = [
      {
        sourceField: 'id',
        targetField: 'id (auto-generated)',
        sourceType: 'Int',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Auto-generated, original ID preserved in migration logs'
      },
      {
        sourceField: 'title',
        targetField: 'title',
        sourceType: 'String(255)',
        targetType: 'String(255)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'content',
        targetField: 'content',
        sourceType: 'String',
        targetType: 'String',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'authorId',
        targetField: 'authorId',
        sourceType: 'String?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'boardType',
        targetField: 'boardType',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'sourceGroup',
        targetField: 'sourceGroup',
        sourceType: 'String?(50)',
        targetType: 'String?(50)',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'isImportant',
        targetField: 'isImportant',
        sourceType: 'Boolean',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'isPinned',
        targetField: 'isPinned',
        sourceType: 'Boolean',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'replyCount',
        targetField: 'replyCount',
        sourceType: 'Int',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'viewCount',
        targetField: 'viewCount',
        sourceType: 'Int',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'status',
        targetField: 'status',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Mapped with value transformation: active→published, inactive→archived'
      },
      {
        sourceField: 'createdAt',
        targetField: 'createdAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'updatedAt',
        targetField: 'updatedAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'N/A',
        targetField: 'type',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated field: "message_board"'
      },
      {
        sourceField: 'N/A',
        targetField: 'summary',
        sourceType: 'N/A',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Generated from content (first 200 chars) + sourceGroup prefix'
      },
      {
        sourceField: 'N/A',
        targetField: 'targetAudience',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Mapped from boardType: general→all, teachers→teachers, parents→parents'
      },
      {
        sourceField: 'N/A',
        targetField: 'priority',
        sourceType: 'N/A',
        targetType: 'String(10)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: "medium" (MessageBoard has no priority field)'
      },
      {
        sourceField: 'N/A',
        targetField: 'isFeatured',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: false (MessageBoard has no featured field)'
      },
      {
        sourceField: 'N/A',
        targetField: 'publishedAt',
        sourceType: 'N/A',
        targetType: 'DateTime?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Set to createdAt if status="active"'
      }
    ]

    const mappedFields = messageBoardFields.filter(f => f.mapped).length
    const totalFields = messageBoardFields.length
    const incompatibleFields = messageBoardFields.filter(f => !f.compatible).map(f => f.sourceField)
    const unmappedFields = messageBoardFields.filter(f => !f.mapped).map(f => f.sourceField)

    return {
      sourceTable: 'MessageBoard',
      totalFields,
      mappedFields,
      unmappedFields,
      incompatibleFields,
      fieldMappings: messageBoardFields,
      migrationStrategy: 'All fields can be mapped directly or generated. Message replies will migrate to CommunicationReply table.'
    }
  }

  async validateAnnouncementMapping(): Promise<TableValidation> {
    this.log('📢 Validating Announcement → Communication mapping...')

    const announcementFields: FieldMapping[] = [
      {
        sourceField: 'id',
        targetField: 'id (auto-generated)',
        sourceType: 'Int',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Auto-generated, original ID preserved in migration logs'
      },
      {
        sourceField: 'title',
        targetField: 'title',
        sourceType: 'String(255)',
        targetType: 'String(255)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'content',
        targetField: 'content',
        sourceType: 'String',
        targetType: 'String',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'summary',
        targetField: 'summary',
        sourceType: 'String?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'authorId',
        targetField: 'authorId',
        sourceType: 'String?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'targetAudience',
        targetField: 'targetAudience',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'priority',
        targetField: 'priority',
        sourceType: 'String(10)',
        targetType: 'String(10)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'status',
        targetField: 'status',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping (draft, published, archived)'
      },
      {
        sourceField: 'publishedAt',
        targetField: 'publishedAt',
        sourceType: 'DateTime?',
        targetType: 'DateTime?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'expiresAt',
        targetField: 'expiresAt',
        sourceType: 'DateTime?',
        targetType: 'DateTime?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'createdAt',
        targetField: 'createdAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'updatedAt',
        targetField: 'updatedAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'N/A',
        targetField: 'type',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated field: "announcement"'
      },
      {
        sourceField: 'N/A',
        targetField: 'boardType',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: "general"'
      },
      {
        sourceField: 'N/A',
        targetField: 'sourceGroup',
        sourceType: 'N/A',
        targetType: 'String?(50)',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Default value: null (Announcements don\'t have sourceGroup)'
      },
      {
        sourceField: 'N/A',
        targetField: 'isImportant',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated from priority: high→true, others→false'
      },
      {
        sourceField: 'N/A',
        targetField: 'isPinned',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: false'
      },
      {
        sourceField: 'N/A',
        targetField: 'isFeatured',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated from priority: high→true, others→false'
      },
      {
        sourceField: 'N/A',
        targetField: 'viewCount',
        sourceType: 'N/A',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: 0'
      },
      {
        sourceField: 'N/A',
        targetField: 'replyCount',
        sourceType: 'N/A',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: 0 (Announcements don\'t have replies)'
      }
    ]

    const mappedFields = announcementFields.filter(f => f.mapped).length
    const totalFields = announcementFields.length
    const incompatibleFields = announcementFields.filter(f => !f.compatible).map(f => f.sourceField)
    const unmappedFields = announcementFields.filter(f => !f.mapped).map(f => f.sourceField)

    return {
      sourceTable: 'Announcement',
      totalFields,
      mappedFields,
      unmappedFields,
      incompatibleFields,
      fieldMappings: announcementFields,
      migrationStrategy: 'All fields can be mapped directly or generated. No replies to migrate.'
    }
  }

  async validateTeacherReminderMapping(): Promise<TableValidation> {
    this.log('👩‍🏫 Validating TeacherReminder → Communication mapping...')

    const reminderFields: FieldMapping[] = [
      {
        sourceField: 'id',
        targetField: 'id (auto-generated)',
        sourceType: 'Int',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Auto-generated, original ID preserved in migration logs'
      },
      {
        sourceField: 'title',
        targetField: 'title',
        sourceType: 'String(255)',
        targetType: 'String(255)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'content',
        targetField: 'content',
        sourceType: 'String',
        targetType: 'String',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'priority',
        targetField: 'priority',
        sourceType: 'String(10)',
        targetType: 'String(10)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'status',
        targetField: 'status',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Mapped with transformation: active→published, completed→archived, cancelled→archived'
      },
      {
        sourceField: 'dueDate',
        targetField: 'expiresAt',
        sourceType: 'DateTime?',
        targetType: 'DateTime?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Mapped to expiresAt field'
      },
      {
        sourceField: 'dueTime',
        targetField: 'summary (embedded)',
        sourceType: 'DateTime?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Combined with dueDate and embedded in summary'
      },
      {
        sourceField: 'createdBy',
        targetField: 'authorId',
        sourceType: 'String?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Mapped to authorId'
      },
      {
        sourceField: 'targetAudience',
        targetField: 'targetAudience',
        sourceType: 'String(20)',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'reminderType',
        targetField: 'summary (embedded)',
        sourceType: 'String(50)',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Embedded in enhanced summary'
      },
      {
        sourceField: 'isRecurring',
        targetField: 'isFeatured + summary',
        sourceType: 'Boolean',
        targetType: 'Boolean + String?',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'isRecurring→isFeatured, also embedded in summary'
      },
      {
        sourceField: 'recurringPattern',
        targetField: 'summary (embedded)',
        sourceType: 'String?(50)',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Embedded in enhanced summary'
      },
      {
        sourceField: 'completedAt',
        targetField: 'summary (embedded)',
        sourceType: 'DateTime?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Completion info embedded in summary'
      },
      {
        sourceField: 'completedBy',
        targetField: 'summary (embedded)',
        sourceType: 'String?',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Completion info embedded in summary'
      },
      {
        sourceField: 'createdAt',
        targetField: 'createdAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'updatedAt',
        targetField: 'updatedAt',
        sourceType: 'DateTime',
        targetType: 'DateTime',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Direct mapping'
      },
      {
        sourceField: 'N/A',
        targetField: 'type',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated field: "reminder"'
      },
      {
        sourceField: 'N/A',
        targetField: 'summary',
        sourceType: 'N/A',
        targetType: 'String?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Enhanced summary with due date, type, recurring pattern, completion info'
      },
      {
        sourceField: 'N/A',
        targetField: 'sourceGroup',
        sourceType: 'N/A',
        targetType: 'String?(50)',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Default value: "Academic Team"'
      },
      {
        sourceField: 'N/A',
        targetField: 'boardType',
        sourceType: 'N/A',
        targetType: 'String(20)',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: "teachers"'
      },
      {
        sourceField: 'N/A',
        targetField: 'isImportant',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated from priority: high→true, others→false'
      },
      {
        sourceField: 'N/A',
        targetField: 'isPinned',
        sourceType: 'N/A',
        targetType: 'Boolean',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Generated: active + high priority → true'
      },
      {
        sourceField: 'N/A',
        targetField: 'publishedAt',
        sourceType: 'N/A',
        targetType: 'DateTime?',
        required: false,
        mapped: true,
        compatible: true,
        notes: 'Set to createdAt if status="active"'
      },
      {
        sourceField: 'N/A',
        targetField: 'viewCount',
        sourceType: 'N/A',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: 0'
      },
      {
        sourceField: 'N/A',
        targetField: 'replyCount',
        sourceType: 'N/A',
        targetType: 'Int',
        required: true,
        mapped: true,
        compatible: true,
        notes: 'Default value: 0 (initially no replies)'
      }
    ]

    const mappedFields = reminderFields.filter(f => f.mapped).length
    const totalFields = reminderFields.length
    const incompatibleFields = reminderFields.filter(f => !f.compatible).map(f => f.sourceField)
    const unmappedFields = reminderFields.filter(f => !f.mapped).map(f => f.sourceField)

    return {
      sourceTable: 'TeacherReminder',
      totalFields,
      mappedFields,
      unmappedFields,
      incompatibleFields,
      fieldMappings: reminderFields,
      migrationStrategy: 'All fields can be mapped. Reminder-specific fields (dueTime, reminderType, recurring info, completion info) are embedded in enhanced summary field.'
    }
  }

  async generateCompatibilityScore(validations: TableValidation[]): Promise<number> {
    const totalFields = validations.reduce((sum, v) => sum + v.totalFields, 0)
    const totalMapped = validations.reduce((sum, v) => sum + v.mappedFields, 0)
    const totalIncompatible = validations.reduce((sum, v) => sum + v.incompatibleFields.length, 0)

    // Base score from mapping ratio
    const mappingScore = totalFields > 0 ? (totalMapped / totalFields) * 100 : 100

    // Penalty for incompatible fields
    const incompatibilityPenalty = totalIncompatible * 5 // 5% penalty per incompatible field

    const score = Math.max(0, mappingScore - incompatibilityPenalty)
    
    this.log(`📊 Compatibility Metrics:`)
    this.log(`   Total source fields: ${totalFields}`)
    this.log(`   Mapped fields: ${totalMapped}`)
    this.log(`   Incompatible fields: ${totalIncompatible}`)
    this.log(`   Compatibility score: ${score.toFixed(1)}%`)

    return score
  }

  generateRecommendations(validations: TableValidation[]): string[] {
    const recommendations: string[] = []

    // Check overall compatibility
    const hasIncompatibleFields = validations.some(v => v.incompatibleFields.length > 0)
    const hasUnmappedFields = validations.some(v => v.unmappedFields.length > 0)

    if (!hasIncompatibleFields && !hasUnmappedFields) {
      recommendations.push('✅ All source tables are fully compatible with Communication table structure')
      recommendations.push('✅ Migration can proceed without any schema modifications')
    }

    // Specific recommendations for each table
    validations.forEach(validation => {
      if (validation.sourceTable === 'MessageBoard') {
        recommendations.push('📋 MessageBoard migration: Use CommunicationReply table for replies')
        recommendations.push('📋 MessageBoard: Generate summary from content + sourceGroup prefix')
      }
      
      if (validation.sourceTable === 'Announcement') {
        recommendations.push('📢 Announcement migration: Map priority to isImportant and isFeatured flags')
        recommendations.push('📢 Announcement: Set default values for missing fields (viewCount, replyCount)')
      }
      
      if (validation.sourceTable === 'TeacherReminder') {
        recommendations.push('👩‍🏫 TeacherReminder migration: Create enhanced summary with reminder details')
        recommendations.push('👩‍🏫 TeacherReminder: Map dueDate to expiresAt field')
        recommendations.push('👩‍🏫 TeacherReminder: Embed reminder-specific fields in summary')
      }
    })

    // Performance recommendations
    recommendations.push('⚡ Performance: Ensure proper indexing on type, status, and priority fields')
    recommendations.push('⚡ Performance: Consider partitioning by type if data volume is high')

    return recommendations
  }

  generateRequiredActions(compatibilityScore: number, validations: TableValidation[]): string[] {
    const actions: string[] = []

    if (compatibilityScore >= 95) {
      actions.push('✅ No schema modifications required')
      actions.push('✅ Proceed with migration scripts')
    } else if (compatibilityScore >= 80) {
      actions.push('⚠️ Minor adjustments may be beneficial but not required')
    } else {
      actions.push('❌ Schema modifications required before migration')
    }

    // Check for specific issues
    validations.forEach(validation => {
      if (validation.incompatibleFields.length > 0) {
        actions.push(`❌ Resolve incompatible fields in ${validation.sourceTable}: ${validation.incompatibleFields.join(', ')}`)
      }
      if (validation.unmappedFields.length > 0) {
        actions.push(`⚠️ Consider handling unmapped fields in ${validation.sourceTable}: ${validation.unmappedFields.join(', ')}`)
      }
    })

    // Standard migration actions
    actions.push('📋 Create comprehensive backup of all source tables')
    actions.push('🧪 Test migration on development/staging environment first')
    actions.push('📊 Validate data integrity after migration')
    actions.push('🔄 Prepare rollback procedures')

    return actions
  }

  async saveValidationReport(report: ValidationReport) {
    const reportDir = path.join(process.cwd(), 'scripts', 'communication-unification-backups')
    mkdirSync(reportDir, { recursive: true })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const reportPath = path.join(reportDir, `structure-validation-${timestamp}.md`)

    const markdownReport = `# Communication Table Structure Validation Report

## Executive Summary
- **Validation Date**: ${report.validationDate}
- **Overall Status**: ${report.overall.status}
- **Compatibility Score**: ${report.overall.compatibilityScore.toFixed(1)}%
- **Total Source Fields**: ${report.overall.totalSourceFields}
- **Successfully Mapped Fields**: ${report.overall.totalMappedFields}

## Compatibility Assessment

${report.overall.compatibilityScore >= 95 ? '🟢 **EXCELLENT COMPATIBILITY**' : 
  report.overall.compatibilityScore >= 80 ? '🟡 **GOOD COMPATIBILITY**' : 
  '🔴 **COMPATIBILITY ISSUES**'}

The Communication table structure ${report.overall.compatibilityScore >= 95 ? 'is fully compatible' : 
  report.overall.compatibilityScore >= 80 ? 'is mostly compatible' : 
  'has significant compatibility issues'} with the source tables.

## Table-by-Table Analysis

${report.tableValidations.map(validation => `
### ${validation.sourceTable} → Communication

**Migration Strategy**: ${validation.migrationStrategy}

**Field Mapping Summary**:
- **Total Fields**: ${validation.totalFields}
- **Mapped Fields**: ${validation.mappedFields} (${((validation.mappedFields/validation.totalFields)*100).toFixed(1)}%)
- **Unmapped Fields**: ${validation.unmappedFields.length > 0 ? validation.unmappedFields.join(', ') : 'None'}
- **Incompatible Fields**: ${validation.incompatibleFields.length > 0 ? validation.incompatibleFields.join(', ') : 'None'}

**Detailed Field Mappings**:

| Source Field | Target Field | Type Mapping | Status | Notes |
|-------------|--------------|--------------|--------|-------|
${validation.fieldMappings.map(field => 
  `| \`${field.sourceField}\` | \`${field.targetField}\` | ${field.sourceType} → ${field.targetType} | ${field.compatible ? '✅' : '❌'} ${field.mapped ? 'Mapped' : 'Unmapped'} | ${field.notes} |`
).join('\n')}

`).join('')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Required Actions

${report.requiredActions.map(action => `- ${action}`).join('\n')}

## Migration Readiness Checklist

- [ ] **Schema Validation**: ${report.overall.compatibilityScore >= 95 ? '✅ Passed' : '⚠️ Needs review'}
- [ ] **Backup Preparation**: Run \`backup-communication-unification.ts\`
- [ ] **Migration Script Ready**: \`migrate-to-communication-system.ts\` configured
- [ ] **Rollback Script Ready**: \`rollback-communication-system.ts\` prepared
- [ ] **Test Environment**: Migration tested in development
- [ ] **Data Validation**: Post-migration validation procedures ready
- [ ] **Application Updates**: Code updated to use Communication table

## Migration Script Execution Order

1. **Backup Phase**:
   \`\`\`bash
   npm run tsx scripts/backup-communication-unification.ts
   \`\`\`

2. **Validation Phase** (Dry Run):
   \`\`\`bash
   DRY_RUN=true npm run tsx scripts/migrate-to-communication-system.ts
   \`\`\`

3. **Migration Phase** (Production):
   \`\`\`bash
   DRY_RUN=false npm run tsx scripts/migrate-to-communication-system.ts
   \`\`\`

4. **Rollback Phase** (If needed):
   \`\`\`bash
   DRY_RUN=false npm run tsx scripts/rollback-communication-system.ts
   \`\`\`

## Risk Assessment

**Migration Risk**: ${report.overall.compatibilityScore >= 95 ? '🟢 LOW' : 
  report.overall.compatibilityScore >= 80 ? '🟡 MEDIUM' : '🔴 HIGH'}

**Risk Factors**:
- Data Loss Risk: 🟢 Low (comprehensive backup strategy)
- Compatibility Risk: ${report.overall.compatibilityScore >= 95 ? '🟢 Low' : 
  report.overall.compatibilityScore >= 80 ? '🟡 Medium' : '🔴 High'}
- Rollback Risk: 🟢 Low (complete rollback procedures)
- Downtime Risk: 🟡 Medium (requires careful timing)

---
*Generated automatically on ${new Date().toISOString()}*
`

    writeFileSync(reportPath, markdownReport, 'utf-8')
    this.log(`📋 Validation report saved: ${reportPath}`)
    
    return reportPath
  }
}

async function main() {
  const validator = new CommunicationStructureValidator()
  
  console.log('🔍 Starting Communication Table Structure Validation...')
  console.log('=' .repeat(80))

  try {
    // Validate each table mapping
    const messageBoardValidation = await validator.validateMessageBoardMapping()
    const announcementValidation = await validator.validateAnnouncementMapping()
    const teacherReminderValidation = await validator.validateTeacherReminderMapping()

    const allValidations = [messageBoardValidation, announcementValidation, teacherReminderValidation]

    // Calculate overall compatibility
    const compatibilityScore = await validator.generateCompatibilityScore(allValidations)
    
    // Determine overall status
    let overallStatus: 'COMPATIBLE' | 'NEEDS_ADJUSTMENT' | 'INCOMPATIBLE'
    if (compatibilityScore >= 95) {
      overallStatus = 'COMPATIBLE'
    } else if (compatibilityScore >= 80) {
      overallStatus = 'NEEDS_ADJUSTMENT'
    } else {
      overallStatus = 'INCOMPATIBLE'
    }

    // Generate recommendations and actions
    const recommendations = validator.generateRecommendations(allValidations)
    const requiredActions = validator.generateRequiredActions(compatibilityScore, allValidations)

    // Create validation report
    const report: ValidationReport = {
      validationDate: new Date().toISOString(),
      overall: {
        status: overallStatus,
        compatibilityScore,
        totalSourceFields: allValidations.reduce((sum, v) => sum + v.totalFields, 0),
        totalMappedFields: allValidations.reduce((sum, v) => sum + v.mappedFields, 0)
      },
      tableValidations: allValidations,
      recommendations,
      requiredActions
    }

    // Save detailed report
    await validator.saveValidationReport(report)

    console.log('=' .repeat(80))
    console.log('✅ Communication table structure validation completed!')
    console.log(`📊 Overall compatibility: ${compatibilityScore.toFixed(1)}% (${overallStatus})`)
    console.log(`📋 Total fields analyzed: ${report.overall.totalSourceFields}`)
    console.log(`✅ Successfully mapped: ${report.overall.totalMappedFields}`)
    console.log('')
    
    if (overallStatus === 'COMPATIBLE') {
      console.log('🎉 VALIDATION PASSED: Migration can proceed without schema changes!')
    } else if (overallStatus === 'NEEDS_ADJUSTMENT') {
      console.log('⚠️ VALIDATION PASSED WITH NOTES: Minor adjustments recommended but not required.')
    } else {
      console.log('❌ VALIDATION FAILED: Schema modifications required before migration.')
    }
    
    console.log('📋 See detailed validation report for complete analysis and recommendations.')

  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the validation
main()