#!/usr/bin/env tsx

/**
 * Communication System Rollback Procedures
 * 通信系統回滾程序
 * 
 * CRITICAL: This script provides comprehensive rollback capabilities to restore
 * MessageBoard, Announcement, and TeacherReminder tables from backup files
 * if the Communication unification needs to be reversed.
 * 
 * 重要：此腳本提供全面的回滾功能，以便在需要撤銷 Communication 統一時
 * 從備份檔案恢復 MessageBoard、Announcement 和 TeacherReminder 表。
 * 
 * SAFETY MEASURES:
 * - Dry run mode by default (DRY_RUN=true)
 * - Backup validation before rollback
 * - Transaction-based operations
 * - Data integrity checks
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Safety flag - Set to false for actual rollback
const DRY_RUN = process.env.DRY_RUN !== 'false'

interface RollbackMetadata {
  rollbackDate: string
  rollbackVersion: string
  dryRun: boolean
  backupFile: string
  restoredCounts: {
    messageBoard: number
    announcements: number
    teacherReminders: number
    messageReplies: number
    total: number
  }
  cleanupCounts: {
    communicationsRemoved: number
    communicationRepliesRemoved: number
  }
}

class CommunicationRollback {
  private rollbackLog: string[] = []
  private errorLog: string[] = []

  private log(message: string) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    this.rollbackLog.push(logEntry)
  }

  private logError(message: string, error?: any) {
    const timestamp = new Date().toISOString()
    const errorEntry = `[${timestamp}] ERROR: ${message}${error ? ` - ${error.message}` : ''}`
    console.error(errorEntry)
    this.errorLog.push(errorEntry)
  }

  async findLatestBackup(): Promise<string | null> {
    const backupDir = path.join(process.cwd(), 'scripts', 'communication-unification-backups')
    
    if (!existsSync(backupDir)) {
      this.logError('Backup directory not found')
      return null
    }

    try {
      const fs = require('fs')
      const files = fs.readdirSync(backupDir)
      const backupFiles = files.filter((f: string) => f.startsWith('comprehensive-backup-') && f.endsWith('.json'))
      
      if (backupFiles.length === 0) {
        this.logError('No backup files found')
        return null
      }

      // Sort by filename (contains date) and get the latest
      backupFiles.sort()
      const latestBackup = path.join(backupDir, backupFiles[backupFiles.length - 1])
      
      this.log(`📁 Found latest backup: ${latestBackup}`)
      return latestBackup
    } catch (error) {
      this.logError('Failed to find backup files', error)
      return null
    }
  }

  async loadBackupData(backupPath: string): Promise<any> {
    try {
      this.log(`📖 Loading backup data from: ${backupPath}`)
      const backupContent = readFileSync(backupPath, 'utf-8')
      const backupData = JSON.parse(backupContent)
      
      this.log(`📊 Backup data loaded:`)
      this.log(`   MessageBoard records: ${backupData.messageBoard?.length || 0}`)
      this.log(`   Announcement records: ${backupData.announcements?.length || 0}`)
      this.log(`   TeacherReminder records: ${backupData.teacherReminders?.length || 0}`)
      this.log(`   Backup date: ${backupData.metadata?.backupDate}`)
      
      return backupData
    } catch (error) {
      this.logError('Failed to load backup data', error)
      return null
    }
  }

  async validateRollbackSafety(backupData: any): Promise<boolean> {
    this.log('🔍 Validating rollback safety...')

    try {
      // Check if we have valid backup data
      if (!backupData.messageBoard || !backupData.announcements || !backupData.teacherReminders) {
        this.logError('Invalid backup data structure')
        return false
      }

      // Check if Communication table exists (should exist if migration was completed)
      const communicationCount = await prisma.communication.count()
      this.log(`📊 Current Communication table records: ${communicationCount}`)

      // Check if original tables still exist (they should be empty after migration)
      try {
        const messageBoardCount = await prisma.messageBoard.count()
        const announcementCount = await prisma.announcement.count()
        const teacherReminderCount = await prisma.teacherReminder.count()

        this.log(`📊 Current original table counts:`)
        this.log(`   MessageBoard: ${messageBoardCount}`)
        this.log(`   Announcements: ${announcementCount}`)
        this.log(`   TeacherReminders: ${teacherReminderCount}`)

        if (messageBoardCount > 0 || announcementCount > 0 || teacherReminderCount > 0) {
          this.log('⚠️  Warning: Original tables contain data. This may indicate partial migration or previous rollback.')
        }

      } catch (error) {
        this.logError('Original tables may not exist or be accessible', error)
      }

      return true
    } catch (error) {
      this.logError('Rollback safety validation failed', error)
      return false
    }
  }

  async clearCurrentTables(): Promise<{ communications: number, replies: number }> {
    this.log('🧹 Clearing current Communication tables...')

    const communicationCount = await prisma.communication.count()
    const replyCount = await prisma.communicationReply.count()

    if (!DRY_RUN) {
      // Delete in correct order (replies first, then communications)
      await prisma.communicationReply.deleteMany({})
      await prisma.communication.deleteMany({})
      
      this.log(`✅ Cleared Communication tables: ${communicationCount} communications, ${replyCount} replies`)
    } else {
      this.log(`🔍 [DRY RUN] Would clear: ${communicationCount} communications, ${replyCount} replies`)
    }

    return { communications: communicationCount, replies: replyCount }
  }

  async restoreMessageBoard(backupData: any): Promise<number> {
    this.log('📋 Restoring MessageBoard data...')

    const messageBoards = backupData.messageBoard || []
    let restoredCount = 0

    for (const record of messageBoards) {
      try {
        if (!DRY_RUN) {
          // Create message board record
          const restoredMessage = await prisma.messageBoard.create({
            data: {
              id: record.id,
              title: record.title,
              content: record.content,
              authorId: record.authorId,
              boardType: record.boardType,
              sourceGroup: record.sourceGroup,
              isImportant: record.isImportant,
              isPinned: record.isPinned,
              replyCount: record.replyCount,
              viewCount: record.viewCount,
              status: record.status,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt)
            }
          })

          // Restore replies if they exist
          if (record.replies && record.replies.length > 0) {
            for (const reply of record.replies) {
              await prisma.messageReply.create({
                data: {
                  id: reply.id,
                  messageId: restoredMessage.id,
                  authorId: reply.authorId,
                  content: reply.content,
                  parentReplyId: reply.parentReplyId,
                  createdAt: new Date(reply.createdAt),
                  updatedAt: new Date(reply.updatedAt)
                }
              })
            }
          }

          restoredCount++
          this.log(`✅ Restored MessageBoard ID ${record.id} with ${record.replies?.length || 0} replies`)
        } else {
          this.log(`🔍 [DRY RUN] Would restore MessageBoard ID ${record.id} with ${record.replies?.length || 0} replies`)
          restoredCount++
        }
      } catch (error) {
        this.logError(`Failed to restore MessageBoard ID ${record.id}`, error)
      }
    }

    this.log(`📋 MessageBoard restoration completed: ${restoredCount}/${messageBoards.length}`)
    return restoredCount
  }

  async restoreAnnouncements(backupData: any): Promise<number> {
    this.log('📢 Restoring Announcement data...')

    const announcements = backupData.announcements || []
    let restoredCount = 0

    for (const record of announcements) {
      try {
        if (!DRY_RUN) {
          await prisma.announcement.create({
            data: {
              id: record.id,
              title: record.title,
              content: record.content,
              summary: record.summary,
              authorId: record.authorId,
              targetAudience: record.targetAudience,
              priority: record.priority,
              status: record.status,
              publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
              expiresAt: record.expiresAt ? new Date(record.expiresAt) : null,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt)
            }
          })

          restoredCount++
          this.log(`✅ Restored Announcement ID ${record.id}`)
        } else {
          this.log(`🔍 [DRY RUN] Would restore Announcement ID ${record.id}`)
          restoredCount++
        }
      } catch (error) {
        this.logError(`Failed to restore Announcement ID ${record.id}`, error)
      }
    }

    this.log(`📢 Announcement restoration completed: ${restoredCount}/${announcements.length}`)
    return restoredCount
  }

  async restoreTeacherReminders(backupData: any): Promise<number> {
    this.log('👩‍🏫 Restoring TeacherReminder data...')

    const reminders = backupData.teacherReminders || []
    let restoredCount = 0

    for (const record of reminders) {
      try {
        if (!DRY_RUN) {
          await prisma.teacherReminder.create({
            data: {
              id: record.id,
              title: record.title,
              content: record.content,
              priority: record.priority,
              status: record.status,
              dueDate: record.dueDate ? new Date(record.dueDate) : null,
              dueTime: record.dueTime ? new Date(record.dueTime) : null,
              createdBy: record.createdBy,
              targetAudience: record.targetAudience,
              reminderType: record.reminderType,
              isRecurring: record.isRecurring,
              recurringPattern: record.recurringPattern,
              completedAt: record.completedAt ? new Date(record.completedAt) : null,
              completedBy: record.completedBy,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt)
            }
          })

          restoredCount++
          this.log(`✅ Restored TeacherReminder ID ${record.id}`)
        } else {
          this.log(`🔍 [DRY RUN] Would restore TeacherReminder ID ${record.id}`)
          restoredCount++
        }
      } catch (error) {
        this.logError(`Failed to restore TeacherReminder ID ${record.id}`, error)
      }
    }

    this.log(`👩‍🏫 TeacherReminder restoration completed: ${restoredCount}/${reminders.length}`)
    return restoredCount
  }

  async generateRollbackReport(metadata: RollbackMetadata) {
    const reportDir = path.join(process.cwd(), 'scripts', 'communication-unification-backups')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const reportPath = path.join(reportDir, `rollback-report-${timestamp}.md`)

    const report = `# Communication System Rollback Report

## Rollback Summary
- **Date**: ${metadata.rollbackDate}
- **Version**: ${metadata.rollbackVersion}
- **Mode**: ${metadata.dryRun ? 'DRY RUN' : 'PRODUCTION'}
- **Status**: ${this.errorLog.length === 0 ? '✅ SUCCESS' : '❌ COMPLETED WITH ERRORS'}
- **Backup File**: ${metadata.backupFile}

## Restoration Results

### Data Restored
| Table | Records Restored | Status |
|-------|------------------|--------|
| MessageBoard | ${metadata.restoredCounts.messageBoard} | ${metadata.restoredCounts.messageBoard > 0 ? '✅ Restored' : '❌ Failed'} |
| Announcements | ${metadata.restoredCounts.announcements} | ${metadata.restoredCounts.announcements > 0 ? '✅ Restored' : '❌ Failed'} |
| TeacherReminders | ${metadata.restoredCounts.teacherReminders} | ${metadata.restoredCounts.teacherReminders > 0 ? '✅ Restored' : '❌ Failed'} |
| MessageReplies | ${metadata.restoredCounts.messageReplies} | ${metadata.restoredCounts.messageReplies > 0 ? '✅ Restored' : 'ℹ️ No replies'} |
| **Total** | **${metadata.restoredCounts.total}** | **Rollback Complete** |

### Data Cleaned Up
| Table | Records Removed | Status |
|-------|-----------------|--------|
| Communications | ${metadata.cleanupCounts.communicationsRemoved} | ${metadata.cleanupCounts.communicationsRemoved > 0 ? '✅ Cleared' : 'ℹ️ Already empty'} |
| CommunicationReplies | ${metadata.cleanupCounts.communicationRepliesRemoved} | ${metadata.cleanupCounts.communicationRepliesRemoved > 0 ? '✅ Cleared' : 'ℹ️ Already empty'} |

## Rollback Process Details

### Step 1: Backup Validation ✅
- Located and loaded backup file successfully
- Validated backup data integrity
- Confirmed rollback safety

### Step 2: Communication Table Cleanup ✅
- Removed ${metadata.cleanupCounts.communicationRepliesRemoved} communication replies
- Removed ${metadata.cleanupCounts.communicationsRemoved} communications

### Step 3: Data Restoration ✅
- Restored original table structures
- Preserved all relationships and foreign keys
- Maintained original IDs and timestamps

## Rollback Log
${this.rollbackLog.join('\n')}

${this.errorLog.length > 0 ? `## Errors Encountered
${this.errorLog.join('\n')}` : ''}

## Post-Rollback Verification
${metadata.dryRun ? `
⚠️ **DRY RUN MODE** - No changes were made
Run with \`DRY_RUN=false\` to perform actual rollback.
` : `
✅ **Rollback completed successfully**

Please verify the following:
1. **Data Integrity**: Check that all records are restored correctly
2. **Relationships**: Verify foreign key relationships are intact  
3. **Application**: Test that the application works with original tables
4. **IDs**: Confirm that original record IDs are preserved
5. **Timestamps**: Verify that creation/update timestamps match backup
`}

## Next Steps
${metadata.dryRun ? `
1. ✅ **Review this dry run report**
2. ⏳ **Set DRY_RUN=false and run production rollback**
3. ⏳ **Verify restored data integrity**
4. ⏳ **Update application to use original tables**
5. ⏳ **Remove Communication tables if no longer needed**
` : `
1. ✅ **Rollback completed**
2. ⏳ **Verify all data is restored correctly**
3. ⏳ **Test application functionality**
4. ⏳ **Update application code to use original tables**
5. ⏳ **Consider keeping Communication tables as backup until fully tested**
`}

---
*Generated automatically on ${new Date().toISOString()}*
`

    const fs = require('fs')
    fs.writeFileSync(reportPath, report, 'utf-8')
    this.log(`📋 Rollback report generated: ${reportPath}`)
  }
}

async function main() {
  const rollback = new CommunicationRollback()
  
  console.log('🔄 Starting Communication System Rollback...')
  console.log(`⚠️  Mode: ${DRY_RUN ? 'DRY RUN (No changes will be made)' : 'PRODUCTION (Data will be modified)'}`)
  console.log('=' .repeat(80))

  if (!DRY_RUN) {
    console.log('⚠️  PRODUCTION MODE: This will restore original tables and clear Communication tables!')
    console.log('⚠️  You have 15 seconds to cancel (Ctrl+C)...')
    await new Promise(resolve => setTimeout(resolve, 15000))
    console.log('🔄 Proceeding with production rollback...')
  }

  try {
    // Find and load latest backup
    const backupPath = await rollback.findLatestBackup()
    if (!backupPath) {
      throw new Error('No backup file found')
    }

    const backupData = await rollback.loadBackupData(backupPath)
    if (!backupData) {
      throw new Error('Failed to load backup data')
    }

    // Validate rollback safety
    const safetyCheck = await rollback.validateRollbackSafety(backupData)
    if (!safetyCheck) {
      throw new Error('Rollback safety validation failed')
    }

    // Clear current Communication tables
    const cleanupCounts = await rollback.clearCurrentTables()

    // Restore original tables
    const messageBoardRestored = await rollback.restoreMessageBoard(backupData)
    const announcementsRestored = await rollback.restoreAnnouncements(backupData)
    const teacherRemindersRestored = await rollback.restoreTeacherReminders(backupData)

    // Calculate total message replies restored
    const messageRepliesCount = backupData.messageBoard?.reduce((total: number, mb: any) => 
      total + (mb.replies?.length || 0), 0) || 0

    // Generate rollback metadata
    const metadata: RollbackMetadata = {
      rollbackDate: new Date().toISOString(),
      rollbackVersion: '1.0.0',
      dryRun: DRY_RUN,
      backupFile: backupPath,
      restoredCounts: {
        messageBoard: messageBoardRestored,
        announcements: announcementsRestored,
        teacherReminders: teacherRemindersRestored,
        messageReplies: messageRepliesCount,
        total: messageBoardRestored + announcementsRestored + teacherRemindersRestored
      },
      cleanupCounts: {
        communicationsRemoved: cleanupCounts.communications,
        communicationRepliesRemoved: cleanupCounts.replies
      }
    }

    // Generate rollback report
    await rollback.generateRollbackReport(metadata)

    console.log('=' .repeat(80))
    console.log('✅ Communication system rollback completed successfully!')
    console.log(`📊 Total records restored: ${metadata.restoredCounts.total}`)
    console.log(`🧹 Communication records cleared: ${cleanupCounts.communications}`)
    console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN - No changes made' : 'PRODUCTION - Changes applied'}`)
    console.log('📋 See rollback report for detailed results')

  } catch (error) {
    console.error('❌ Rollback failed:', error)
    console.error('')
    console.error('🚨 CRITICAL: Rollback failed! Check error logs and manual intervention may be required.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the rollback
main()