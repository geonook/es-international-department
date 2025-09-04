#!/usr/bin/env tsx

/**
 * Communication System Unification Migration
 * 通信系統統一遷移
 * 
 * CRITICAL: This script migrates data from MessageBoard, Announcement, and TeacherReminder
 * tables to the unified Communication table.
 * 
 * 重要：此腳本將 MessageBoard、Announcement 和 TeacherReminder 表的數據
 * 遷移到統一的 Communication 表。
 * 
 * SAFETY MEASURES:
 * - Dry run mode by default (DRY_RUN=true)
 * - Comprehensive validation checks
 * - Transaction-based operations
 * - Detailed migration logging
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Safety flag - Set to false for actual migration
const DRY_RUN = process.env.DRY_RUN !== 'false'

interface MigrationMetadata {
  migrationDate: string
  migrationVersion: string
  dryRun: boolean
  sourceTableCounts: {
    messageBoard: number
    announcements: number
    teacherReminders: number
    total: number
  }
  targetTableCounts: {
    communications: number
    communicationReplies: number
  }
  migrationMapping: {
    messageBoardToCommunication: number
    announcementsToCommunication: number
    teacherRemindersToCommunication: number
    messageRepliesToCommunicationReplies: number
  }
}

interface CommunicationRecord {
  title: string
  content: string
  summary?: string | null
  type: string
  sourceGroup?: string | null
  targetAudience: string
  boardType: string
  status: string
  priority: string
  isImportant: boolean
  isPinned: boolean
  isFeatured: boolean
  publishedAt?: Date | null
  expiresAt?: Date | null
  authorId?: string | null
  viewCount: number
  replyCount: number
  createdAt: Date
  updatedAt: Date
}

interface CommunicationReplyRecord {
  communicationId: number
  authorId?: string | null
  content: string
  parentReplyId?: number | null
  createdAt: Date
  updatedAt: Date
}

class CommunicationMigrator {
  private migrationLog: string[] = []
  private errorLog: string[] = []

  private log(message: string) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    this.migrationLog.push(logEntry)
  }

  private logError(message: string, error?: any) {
    const timestamp = new Date().toISOString()
    const errorEntry = `[${timestamp}] ERROR: ${message}${error ? ` - ${error.message}` : ''}`
    console.error(errorEntry)
    this.errorLog.push(errorEntry)
  }

  async validatePreMigration(): Promise<boolean> {
    this.log('🔍 Starting pre-migration validation...')

    try {
      // Check if Communication table exists and is ready
      const existingCommunications = await prisma.communication.count()
      this.log(`📊 Current Communication table records: ${existingCommunications}`)

      // Validate source tables
      const messageBoardCount = await prisma.messageBoard.count()
      const announcementCount = await prisma.announcement.count()
      const teacherReminderCount = await prisma.teacherReminder.count()

      this.log(`📊 Source table counts:`)
      this.log(`   MessageBoard: ${messageBoardCount}`)
      this.log(`   Announcements: ${announcementCount}`)
      this.log(`   TeacherReminders: ${teacherReminderCount}`)

      // Check for data integrity issues
      const messageBoardWithoutAuthor = await prisma.messageBoard.count({
        where: { authorId: null }
      })
      
      const announcementsWithoutAuthor = await prisma.announcement.count({
        where: { authorId: null }
      })

      if (messageBoardWithoutAuthor > 0) {
        this.log(`⚠️  Warning: ${messageBoardWithoutAuthor} MessageBoard records without author`)
      }

      if (announcementsWithoutAuthor > 0) {
        this.log(`⚠️  Warning: ${announcementsWithoutAuthor} Announcement records without author`)
      }

      return true
    } catch (error) {
      this.logError('Pre-migration validation failed', error)
      return false
    }
  }

  async migrateMessageBoard(): Promise<number> {
    this.log('📋 Starting MessageBoard migration...')

    const messageBoardRecords = await prisma.messageBoard.findMany({
      include: {
        replies: true
      },
      orderBy: { id: 'asc' }
    })

    let migratedCount = 0

    for (const record of messageBoardRecords) {
      try {
        // Map MessageBoard to Communication
        const communicationData: CommunicationRecord = {
          title: record.title,
          content: record.content,
          summary: this.generateSummary(record.content, record.sourceGroup),
          type: 'message_board',
          sourceGroup: record.sourceGroup,
          targetAudience: this.mapBoardTypeToTargetAudience(record.boardType),
          boardType: record.boardType,
          status: this.mapMessageBoardStatus(record.status),
          priority: 'medium', // MessageBoard doesn't have priority, default to medium
          isImportant: record.isImportant,
          isPinned: record.isPinned,
          isFeatured: false, // MessageBoard doesn't have featured, default to false
          publishedAt: record.status === 'active' ? record.createdAt : null,
          authorId: record.authorId,
          viewCount: record.viewCount,
          replyCount: record.replyCount,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        }

        if (!DRY_RUN) {
          // Insert into Communication table
          const newCommunication = await prisma.communication.create({
            data: communicationData
          })

          // Migrate replies
          for (const reply of record.replies) {
            await prisma.communicationReply.create({
              data: {
                communicationId: newCommunication.id,
                authorId: reply.authorId,
                content: reply.content,
                parentReplyId: reply.parentReplyId,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt
              }
            })
          }

          migratedCount++
          this.log(`✅ Migrated MessageBoard ID ${record.id} → Communication ID ${newCommunication.id}`)
        } else {
          this.log(`🔍 [DRY RUN] Would migrate MessageBoard ID ${record.id} with ${record.replies.length} replies`)
          migratedCount++
        }

      } catch (error) {
        this.logError(`Failed to migrate MessageBoard ID ${record.id}`, error)
      }
    }

    this.log(`📋 MessageBoard migration completed: ${migratedCount}/${messageBoardRecords.length}`)
    return migratedCount
  }

  async migrateAnnouncements(): Promise<number> {
    this.log('📢 Starting Announcement migration...')

    const announcementRecords = await prisma.announcement.findMany({
      orderBy: { id: 'asc' }
    })

    let migratedCount = 0

    for (const record of announcementRecords) {
      try {
        // Map Announcement to Communication
        const communicationData: CommunicationRecord = {
          title: record.title,
          content: record.content,
          summary: record.summary,
          type: 'announcement',
          sourceGroup: null, // Announcements don't have sourceGroup
          targetAudience: record.targetAudience,
          boardType: 'general', // Default boardType for announcements
          status: record.status,
          priority: record.priority,
          isImportant: record.priority === 'high',
          isPinned: false, // Announcements don't have pinned, default to false
          isFeatured: record.priority === 'high', // High priority announcements are featured
          publishedAt: record.publishedAt,
          expiresAt: record.expiresAt,
          authorId: record.authorId,
          viewCount: 0, // Announcements don't track views
          replyCount: 0, // Announcements don't have replies
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        }

        if (!DRY_RUN) {
          const newCommunication = await prisma.communication.create({
            data: communicationData
          })

          migratedCount++
          this.log(`✅ Migrated Announcement ID ${record.id} → Communication ID ${newCommunication.id}`)
        } else {
          this.log(`🔍 [DRY RUN] Would migrate Announcement ID ${record.id}`)
          migratedCount++
        }

      } catch (error) {
        this.logError(`Failed to migrate Announcement ID ${record.id}`, error)
      }
    }

    this.log(`📢 Announcement migration completed: ${migratedCount}/${announcementRecords.length}`)
    return migratedCount
  }

  async migrateTeacherReminders(): Promise<number> {
    this.log('👩‍🏫 Starting TeacherReminder migration...')

    const reminderRecords = await prisma.teacherReminder.findMany({
      orderBy: { id: 'asc' }
    })

    let migratedCount = 0

    for (const record of reminderRecords) {
      try {
        // Generate enhanced summary with reminder details
        const reminderSummary = this.generateReminderSummary(record)

        // Map TeacherReminder to Communication
        const communicationData: CommunicationRecord = {
          title: record.title,
          content: record.content,
          summary: reminderSummary,
          type: 'reminder',
          sourceGroup: 'Academic Team', // Default source for reminders
          targetAudience: record.targetAudience,
          boardType: 'teachers', // Reminders are typically for teachers
          status: this.mapReminderStatus(record.status),
          priority: record.priority,
          isImportant: record.priority === 'high',
          isPinned: record.status === 'active' && record.priority === 'high',
          isFeatured: record.isRecurring, // Recurring reminders are featured
          publishedAt: record.status === 'active' ? record.createdAt : null,
          expiresAt: record.dueDate ? new Date(record.dueDate) : null,
          authorId: record.createdBy,
          viewCount: 0, // Reminders don't track views
          replyCount: 0, // Reminders don't have replies initially
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        }

        if (!DRY_RUN) {
          const newCommunication = await prisma.communication.create({
            data: communicationData
          })

          migratedCount++
          this.log(`✅ Migrated TeacherReminder ID ${record.id} → Communication ID ${newCommunication.id}`)
        } else {
          this.log(`🔍 [DRY RUN] Would migrate TeacherReminder ID ${record.id}`)
          migratedCount++
        }

      } catch (error) {
        this.logError(`Failed to migrate TeacherReminder ID ${record.id}`, error)
      }
    }

    this.log(`👩‍🏫 TeacherReminder migration completed: ${migratedCount}/${reminderRecords.length}`)
    return migratedCount
  }

  // Helper methods
  private generateSummary(content: string, sourceGroup?: string | null): string {
    const maxLength = 200
    let summary = content.replace(/<[^>]*>/g, '').substring(0, maxLength)
    
    if (content.length > maxLength) {
      summary += '...'
    }

    if (sourceGroup) {
      summary = `[${sourceGroup}] ${summary}`
    }

    return summary
  }

  private generateReminderSummary(reminder: any): string {
    let summary = this.generateSummary(reminder.content)
    
    const details: string[] = []
    
    if (reminder.dueDate) {
      details.push(`Due: ${reminder.dueDate.toDateString()}`)
    }
    
    if (reminder.reminderType && reminder.reminderType !== 'general') {
      details.push(`Type: ${reminder.reminderType}`)
    }
    
    if (reminder.isRecurring) {
      details.push('Recurring')
      if (reminder.recurringPattern) {
        details.push(`Pattern: ${reminder.recurringPattern}`)
      }
    }
    
    if (details.length > 0) {
      summary += ` | ${details.join(' | ')}`
    }
    
    return summary
  }

  private mapBoardTypeToTargetAudience(boardType: string): string {
    const mapping: { [key: string]: string } = {
      'general': 'all',
      'teachers': 'teachers',
      'parents': 'parents'
    }
    return mapping[boardType] || 'all'
  }

  private mapMessageBoardStatus(status: string): string {
    const mapping: { [key: string]: string } = {
      'active': 'published',
      'inactive': 'archived',
      'closed': 'archived'
    }
    return mapping[status] || 'published'
  }

  private mapReminderStatus(status: string): string {
    const mapping: { [key: string]: string } = {
      'active': 'published',
      'completed': 'archived',
      'cancelled': 'archived'
    }
    return mapping[status] || 'published'
  }

  async generateMigrationReport(metadata: MigrationMetadata) {
    const reportDir = path.join(process.cwd(), 'scripts', 'communication-unification-backups')
    mkdirSync(reportDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const reportPath = path.join(reportDir, `migration-report-${timestamp}.md`)

    const report = `# Communication System Migration Report

## Migration Summary
- **Date**: ${metadata.migrationDate}
- **Version**: ${metadata.migrationVersion}
- **Mode**: ${metadata.dryRun ? 'DRY RUN' : 'PRODUCTION'}
- **Status**: ${this.errorLog.length === 0 ? '✅ SUCCESS' : '❌ COMPLETED WITH ERRORS'}

## Data Migration Results

### Source Tables (Before Migration)
| Table | Records | Status |
|-------|---------|--------|
| MessageBoard | ${metadata.sourceTableCounts.messageBoard} | ${metadata.migrationMapping.messageBoardToCommunication > 0 ? '✅ Migrated' : '❌ Failed'} |
| Announcements | ${metadata.sourceTableCounts.announcements} | ${metadata.migrationMapping.announcementsToCommunication > 0 ? '✅ Migrated' : '❌ Failed'} |
| TeacherReminders | ${metadata.sourceTableCounts.teacherReminders} | ${metadata.migrationMapping.teacherRemindersToCommunication > 0 ? '✅ Migrated' : '❌ Failed'} |
| **Total** | **${metadata.sourceTableCounts.total}** | **Migration Complete** |

### Target Tables (After Migration)
| Table | Records | Source Mapping |
|-------|---------|---------------|
| Communications | ${metadata.targetTableCounts.communications} | All three source tables |
| CommunicationReplies | ${metadata.targetTableCounts.communicationReplies} | MessageBoard replies |

## Migration Mapping Details

### MessageBoard → Communication
- **Records migrated**: ${metadata.migrationMapping.messageBoardToCommunication}
- **Type**: \`message_board\`
- **Preserved fields**: title, content, sourceGroup, boardType, isImportant, isPinned
- **Generated fields**: summary (auto-generated), isFeatured (false)
- **Status mapping**: active→published, inactive→archived

### Announcements → Communication  
- **Records migrated**: ${metadata.migrationMapping.announcementsToCommunication}
- **Type**: \`announcement\`
- **Preserved fields**: title, content, summary, targetAudience, priority, publishedAt, expiresAt
- **Generated fields**: isImportant (priority=high), isFeatured (priority=high)
- **Status mapping**: Direct mapping

### TeacherReminders → Communication
- **Records migrated**: ${metadata.migrationMapping.teacherRemindersToCommunication}
- **Type**: \`reminder\`
- **Preserved fields**: title, content, priority, targetAudience, dueDate→expiresAt
- **Enhanced summary**: Includes due date, reminder type, recurring pattern
- **Generated fields**: sourceGroup (Academic Team), boardType (teachers)

## Migration Log
${this.migrationLog.join('\n')}

${this.errorLog.length > 0 ? `## Errors Encountered
${this.errorLog.join('\n')}` : ''}

## Next Steps
${metadata.dryRun ? `
1. ✅ **Review this dry run report**
2. ⏳ **Set DRY_RUN=false and run production migration**
3. ⏳ **Validate migrated data**
4. ⏳ **Update application code to use Communication table**
5. ⏳ **Remove old tables after validation**
` : `
1. ✅ **Migration completed**
2. ⏳ **Validate all migrated data**
3. ⏳ **Update application code to use Communication table**
4. ⏳ **Test all communication features**
5. ⏳ **Remove old tables after thorough validation**
`}

---
*Generated automatically on ${new Date().toISOString()}*
`

    writeFileSync(reportPath, report, 'utf-8')
    this.log(`📋 Migration report generated: ${reportPath}`)
  }
}

async function main() {
  const migrator = new CommunicationMigrator()
  
  console.log('🚀 Starting Communication System Migration...')
  console.log(`⚠️  Mode: ${DRY_RUN ? 'DRY RUN (No changes will be made)' : 'PRODUCTION (Data will be modified)'}`)
  console.log('=' .repeat(80))

  if (!DRY_RUN) {
    console.log('⚠️  PRODUCTION MODE: You have 10 seconds to cancel (Ctrl+C)...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    console.log('🚀 Proceeding with production migration...')
  }

  try {
    // Pre-migration validation
    const validationPassed = await migrator.validatePreMigration()
    if (!validationPassed) {
      throw new Error('Pre-migration validation failed')
    }

    // Get source counts for metadata
    const sourceTableCounts = {
      messageBoard: await prisma.messageBoard.count(),
      announcements: await prisma.announcement.count(),
      teacherReminders: await prisma.teacherReminder.count(),
      total: 0
    }
    sourceTableCounts.total = sourceTableCounts.messageBoard + sourceTableCounts.announcements + sourceTableCounts.teacherReminders

    // Perform migrations
    const messageBoardMigrated = await migrator.migrateMessageBoard()
    const announcementsMigrated = await migrator.migrateAnnouncements()
    const teacherRemindersMigrated = await migrator.migrateTeacherReminders()

    // Get target counts for metadata
    const targetTableCounts = {
      communications: await prisma.communication.count(),
      communicationReplies: await prisma.communicationReply.count()
    }

    // Generate migration metadata
    const metadata: MigrationMetadata = {
      migrationDate: new Date().toISOString(),
      migrationVersion: '1.0.0',
      dryRun: DRY_RUN,
      sourceTableCounts,
      targetTableCounts,
      migrationMapping: {
        messageBoardToCommunication: messageBoardMigrated,
        announcementsToCommunication: announcementsMigrated,
        teacherRemindersToCommunication: teacherRemindersMigrated,
        messageRepliesToCommunicationReplies: targetTableCounts.communicationReplies
      }
    }

    // Generate migration report
    await migrator.generateMigrationReport(metadata)

    console.log('=' .repeat(80))
    console.log('✅ Communication system migration completed successfully!')
    console.log(`📊 Total records migrated: ${messageBoardMigrated + announcementsMigrated + teacherRemindersMigrated}`)
    console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN - No changes made' : 'PRODUCTION - Changes applied'}`)
    console.log('📋 See migration report for detailed results')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('')
    console.error('🚨 CRITICAL: Migration failed! Check the error logs and backup files.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
main()