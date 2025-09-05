#!/usr/bin/env tsx

/**
 * Comprehensive Data Backup for Communication System Unification
 * 通信系統統一的全面數據備份
 * 
 * CRITICAL: This script creates complete backups of MessageBoard, Announcement, and TeacherReminder
 * before unifying them into the Communication table.
 * 
 * 重要：此腳本在將 MessageBoard、Announcement 和 TeacherReminder 統一到 Communication 表之前
 * 創建完整的數據備份。
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BackupMetadata {
  backupDate: string
  backupVersion: string
  purpose: string
  tablesIncluded: string[]
  recordCounts: {
    messageBoard: number
    announcements: number
    teacherReminders: number
    total: number
  }
}

interface MessageBoardBackup {
  id: number
  title: string
  content: string
  authorId: string | null
  boardType: string
  sourceGroup: string | null
  isImportant: boolean
  isPinned: boolean
  replyCount: number
  viewCount: number
  status: string
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  } | null
  replies?: MessageReplyBackup[]
}

interface MessageReplyBackup {
  id: number
  messageId: number
  authorId: string | null
  content: string
  parentReplyId: number | null
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    email: string
    displayName: string | null
  } | null
}

interface AnnouncementBackup {
  id: number
  title: string
  content: string
  summary: string | null
  authorId: string | null
  targetAudience: string
  priority: string
  status: string
  publishedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  } | null
}

interface TeacherReminderBackup {
  id: number
  title: string
  content: string
  priority: string
  status: string
  dueDate: Date | null
  dueTime: Date | null
  createdBy: string | null
  targetAudience: string
  reminderType: string
  isRecurring: boolean
  recurringPattern: string | null
  completedAt: Date | null
  completedBy: string | null
  createdAt: Date
  updatedAt: Date
  creator?: {
    id: string
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  } | null
  completer?: {
    id: string
    email: string
    displayName: string | null
  } | null
}

interface ComprehensiveBackup {
  metadata: BackupMetadata
  messageBoard: MessageBoardBackup[]
  announcements: AnnouncementBackup[]
  teacherReminders: TeacherReminderBackup[]
}

async function createComprehensiveBackup(): Promise<ComprehensiveBackup> {
  console.log('🔄 Starting comprehensive data backup for Communication unification...')
  
  // Backup MessageBoard with replies
  console.log('📋 Backing up MessageBoard data...')
  const messageBoard = await prisma.messageBoard.findMany({
    include: {
      author: {
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true
        }
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              email: true,
              displayName: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Backup Announcements
  console.log('📢 Backing up Announcement data...')
  const announcements = await prisma.announcement.findMany({
    include: {
      author: {
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Backup TeacherReminders
  console.log('👩‍🏫 Backing up TeacherReminder data...')
  const teacherReminders = await prisma.teacherReminder.findMany({
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true
        }
      },
      completer: {
        select: {
          id: true,
          email: true,
          displayName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const metadata: BackupMetadata = {
    backupDate: new Date().toISOString(),
    backupVersion: '1.0.0',
    purpose: 'Pre-migration backup for Communication system unification',
    tablesIncluded: ['message_board', 'announcements', 'teacher_reminders'],
    recordCounts: {
      messageBoard: messageBoard.length,
      announcements: announcements.length,
      teacherReminders: teacherReminders.length,
      total: messageBoard.length + announcements.length + teacherReminders.length
    }
  }

  console.log(`📊 Backup Statistics:`)
  console.log(`   MessageBoard records: ${metadata.recordCounts.messageBoard}`)
  console.log(`   Announcement records: ${metadata.recordCounts.announcements}`)
  console.log(`   TeacherReminder records: ${metadata.recordCounts.teacherReminders}`)
  console.log(`   Total records: ${metadata.recordCounts.total}`)

  return {
    metadata,
    messageBoard,
    announcements,
    teacherReminders
  }
}

async function saveBackupFiles(backup: ComprehensiveBackup) {
  const backupDir = path.join(process.cwd(), 'scripts', 'communication-unification-backups')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
  
  // Ensure backup directory exists
  mkdirSync(backupDir, { recursive: true })

  // Save comprehensive backup
  const comprehensiveBackupPath = path.join(backupDir, `comprehensive-backup-${timestamp}.json`)
  writeFileSync(comprehensiveBackupPath, JSON.stringify(backup, null, 2), 'utf-8')

  // Save individual table backups for easier reference
  const messageBoardPath = path.join(backupDir, `messageBoard-backup-${timestamp}.json`)
  writeFileSync(messageBoardPath, JSON.stringify({
    metadata: backup.metadata,
    data: backup.messageBoard
  }, null, 2), 'utf-8')

  const announcementsPath = path.join(backupDir, `announcements-backup-${timestamp}.json`)
  writeFileSync(announcementsPath, JSON.stringify({
    metadata: backup.metadata,
    data: backup.announcements
  }, null, 2), 'utf-8')

  const teacherRemindersPath = path.join(backupDir, `teacherReminders-backup-${timestamp}.json`)
  writeFileSync(teacherRemindersPath, JSON.stringify({
    metadata: backup.metadata,
    data: backup.teacherReminders
  }, null, 2), 'utf-8')

  console.log(`✅ Backup files created successfully:`)
  console.log(`   📁 Comprehensive backup: ${comprehensiveBackupPath}`)
  console.log(`   📋 MessageBoard backup: ${messageBoardPath}`)
  console.log(`   📢 Announcements backup: ${announcementsPath}`)
  console.log(`   👩‍🏫 TeacherReminders backup: ${teacherRemindersPath}`)

  return {
    comprehensiveBackupPath,
    messageBoardPath,
    announcementsPath,
    teacherRemindersPath
  }
}

async function generateBackupSummary(backup: ComprehensiveBackup, filePaths: any) {
  const summaryPath = path.join(process.cwd(), 'scripts', 'communication-unification-backups', 'BACKUP-SUMMARY.md')
  
  const summary = `# Communication Unification Backup Summary

## Backup Information
- **Date**: ${backup.metadata.backupDate}
- **Version**: ${backup.metadata.backupVersion}
- **Purpose**: ${backup.metadata.purpose}

## Record Counts
| Table | Records | Status |
|-------|---------|--------|
| MessageBoard | ${backup.metadata.recordCounts.messageBoard} | ✅ Backed up |
| Announcements | ${backup.metadata.recordCounts.announcements} | ✅ Backed up |
| TeacherReminders | ${backup.metadata.recordCounts.teacherReminders} | ✅ Backed up |
| **Total** | **${backup.metadata.recordCounts.total}** | **✅ Complete** |

## Data Analysis

### MessageBoard Analysis
- **Active records**: ${backup.messageBoard.filter(m => m.status === 'active').length}
- **Important messages**: ${backup.messageBoard.filter(m => m.isImportant).length}
- **Pinned messages**: ${backup.messageBoard.filter(m => m.isPinned).length}
- **Total replies**: ${backup.messageBoard.reduce((sum, m) => sum + (m.replies?.length || 0), 0)}
- **Source groups**: ${[...new Set(backup.messageBoard.map(m => m.sourceGroup).filter(Boolean))].join(', ')}

### Announcements Analysis
- **Published**: ${backup.announcements.filter(a => a.status === 'published').length}
- **Draft**: ${backup.announcements.filter(a => a.status === 'draft').length}
- **High priority**: ${backup.announcements.filter(a => a.priority === 'high').length}
- **Target audiences**: ${[...new Set(backup.announcements.map(a => a.targetAudience))].join(', ')}

### TeacherReminders Analysis
- **Active**: ${backup.teacherReminders.filter(r => r.status === 'active').length}
- **Completed**: ${backup.teacherReminders.filter(r => r.completedAt !== null).length}
- **Recurring**: ${backup.teacherReminders.filter(r => r.isRecurring).length}
- **High priority**: ${backup.teacherReminders.filter(r => r.priority === 'high').length}

## Migration Mapping

### MessageBoard → Communication
- **Type**: \`message_board\`
- **Fields preserved**: All fields mapped directly
- **Replies**: Migrated to CommunicationReply table
- **Special handling**: boardType → boardType, sourceGroup → sourceGroup

### Announcements → Communication  
- **Type**: \`announcement\`
- **Fields preserved**: All fields mapped directly
- **Special handling**: targetAudience → targetAudience

### TeacherReminders → Communication
- **Type**: \`reminder\`
- **Fields preserved**: All fields mapped directly
- **Special handling**: dueDate/dueTime combined in summary field
- **Note**: reminderType, isRecurring, recurringPattern stored in summary

## Backup Files
- **Comprehensive**: \`${path.basename(filePaths.comprehensiveBackupPath)}\`
- **MessageBoard**: \`${path.basename(filePaths.messageBoardPath)}\`
- **Announcements**: \`${path.basename(filePaths.announcementsPath)}\`
- **TeacherReminders**: \`${path.basename(filePaths.teacherRemindersPath)}\`

## Next Steps
1. ⏳ **Prepare Migration Scripts**: Create SQL scripts for data migration
2. ⏳ **Test Migration**: Execute migration on test environment
3. ⏳ **Validate Data**: Ensure all data migrated correctly
4. ⏳ **Execute Production**: Run migration on production database
5. ⏳ **Cleanup**: Remove old tables after validation

## Rollback Information
All backup files are stored in JSON format and can be used to restore data if needed. The comprehensive backup contains all relationships and can be used for complete restoration.

---
*Generated automatically on ${new Date().toISOString()}*
`

  writeFileSync(summaryPath, summary, 'utf-8')
  console.log(`📋 Backup summary generated: ${summaryPath}`)
}

async function main() {
  try {
    console.log('🚀 Starting Communication System Unification Backup Process...')
    console.log('=' .repeat(80))
    
    const backup = await createComprehensiveBackup()
    const filePaths = await saveBackupFiles(backup)
    await generateBackupSummary(backup, filePaths)
    
    console.log('=' .repeat(80))
    console.log('✅ Communication unification backup completed successfully!')
    console.log(`📊 Total records backed up: ${backup.metadata.recordCounts.total}`)
    console.log('📁 All backup files saved to: scripts/communication-unification-backups/')
    console.log('📋 See BACKUP-SUMMARY.md for detailed analysis')
    console.log('')
    console.log('⚠️  NEXT STEPS:')
    console.log('   1. Review backup files for completeness')
    console.log('   2. Run migration scripts (when ready)')
    console.log('   3. Validate migrated data')
    console.log('   4. Keep backups until migration is confirmed stable')

  } catch (error) {
    console.error('❌ Error during backup process:', error)
    console.error('')
    console.error('🚨 CRITICAL: Backup failed! Do not proceed with migration until backup is successful.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the backup
main()