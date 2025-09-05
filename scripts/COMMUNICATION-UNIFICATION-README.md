# Communication System Unification Migration

This document provides comprehensive guidance for migrating MessageBoard, Announcement, and TeacherReminder tables to the unified Communication system.

## Overview

The Communication System Unification consolidates three separate communication tables into a single, unified Communication table with enhanced functionality and consistency.

### Migration Scope

| Source Table | Records Type | Target Mapping |
|-------------|-------------|----------------|
| **MessageBoard** | Discussion posts with replies | `Communication` (type: 'message_board') |
| **Announcement** | Official announcements | `Communication` (type: 'announcement') |
| **TeacherReminder** | Teacher task reminders | `Communication` (type: 'reminder') |
| **MessageReply** | Message board replies | `CommunicationReply` |

## Migration Scripts

### 1. Structure Validation
**File**: `validate-communication-structure.ts`  
**Purpose**: Validates that Communication table can handle all source data  
**Safety**: Read-only validation, no data changes

```bash
# Run structure validation
npm run tsx scripts/validate-communication-structure.ts
```

**Output**: Detailed compatibility report with field mappings and recommendations.

### 2. Data Backup
**File**: `backup-communication-unification.ts`  
**Purpose**: Creates comprehensive backups of all source tables  
**Safety**: Read-only backup creation

```bash
# Create comprehensive backup
npm run tsx scripts/backup-communication-unification.ts
```

**Output**:
- `comprehensive-backup-[date].json` - Complete backup with metadata
- `messageBoard-backup-[date].json` - MessageBoard specific backup
- `announcements-backup-[date].json` - Announcements specific backup  
- `teacherReminders-backup-[date].json` - TeacherReminders specific backup
- `BACKUP-SUMMARY.md` - Detailed backup analysis

### 3. Data Migration
**File**: `migrate-to-communication-system.ts`  
**Purpose**: Performs the actual data migration  
**Safety**: Dry-run mode by default, transaction-based operations

```bash
# Dry run (recommended first)
DRY_RUN=true npm run tsx scripts/migrate-to-communication-system.ts

# Production migration (after dry run validation)
DRY_RUN=false npm run tsx scripts/migrate-to-communication-system.ts
```

**Output**: Migration report with detailed results and statistics.

### 4. Rollback Procedures  
**File**: `rollback-communication-system.ts`  
**Purpose**: Restores original tables from backup if needed  
**Safety**: Dry-run mode by default, comprehensive validation

```bash
# Dry run rollback (check what would be restored)
DRY_RUN=true npm run tsx scripts/rollback-communication-system.ts

# Production rollback (if migration needs to be reversed)
DRY_RUN=false npm run tsx scripts/rollback-communication-system.ts
```

**Output**: Rollback report with restoration details.

## Migration Process

### Phase 1: Pre-Migration Validation ✅

1. **Structure Validation**
   ```bash
   npm run tsx scripts/validate-communication-structure.ts
   ```
   - Validates field compatibility
   - Generates migration strategy
   - Identifies any potential issues

2. **Create Comprehensive Backup** 
   ```bash
   npm run tsx scripts/backup-communication-unification.ts
   ```
   - Backs up all source tables with relationships
   - Creates multiple backup formats
   - Generates backup analysis report

### Phase 2: Migration Testing

3. **Dry Run Migration**
   ```bash
   DRY_RUN=true npm run tsx scripts/migrate-to-communication-system.ts
   ```
   - Tests migration logic without making changes
   - Validates mapping strategies  
   - Reports potential issues

4. **Review Migration Report**
   - Check all records are properly mapped
   - Verify no data loss or corruption
   - Confirm field mappings are correct

### Phase 3: Production Migration

5. **Execute Production Migration**
   ```bash
   DRY_RUN=false npm run tsx scripts/migrate-to-communication-system.ts
   ```
   - Performs actual data migration
   - Creates new Communication records
   - Migrates replies to CommunicationReply

6. **Post-Migration Validation**
   - Verify record counts match expectations
   - Test data integrity and relationships
   - Confirm application functionality

## Field Mapping Details

### MessageBoard → Communication

| MessageBoard Field | Communication Field | Mapping Strategy |
|-------------------|---------------------|------------------|
| `id` | `id` (new) | Auto-generated, original preserved in logs |
| `title` | `title` | Direct mapping |
| `content` | `content` | Direct mapping |
| `authorId` | `authorId` | Direct mapping |
| `boardType` | `boardType` | Direct mapping |
| `sourceGroup` | `sourceGroup` | Direct mapping |
| `isImportant` | `isImportant` | Direct mapping |
| `isPinned` | `isPinned` | Direct mapping |
| `replyCount` | `replyCount` | Direct mapping |
| `viewCount` | `viewCount` | Direct mapping |
| `status` | `status` | Transform: active→published, inactive→archived |
| `createdAt` | `createdAt` | Direct mapping |
| `updatedAt` | `updatedAt` | Direct mapping |
| N/A | `type` | Generated: "message_board" |
| N/A | `summary` | Generated from content + sourceGroup |
| N/A | `targetAudience` | Mapped from boardType |
| N/A | `priority` | Default: "medium" |
| N/A | `isFeatured` | Default: false |
| N/A | `publishedAt` | Set to createdAt if status="active" |

**Special Handling**:
- MessageReply records → CommunicationReply table
- Preserves all parent-child reply relationships
- Maintains original timestamps and author relationships

### Announcement → Communication

| Announcement Field | Communication Field | Mapping Strategy |
|-------------------|---------------------|------------------|
| `id` | `id` (new) | Auto-generated, original preserved in logs |
| `title` | `title` | Direct mapping |
| `content` | `content` | Direct mapping |
| `summary` | `summary` | Direct mapping |
| `authorId` | `authorId` | Direct mapping |
| `targetAudience` | `targetAudience` | Direct mapping |
| `priority` | `priority` | Direct mapping |
| `status` | `status` | Direct mapping |
| `publishedAt` | `publishedAt` | Direct mapping |
| `expiresAt` | `expiresAt` | Direct mapping |
| `createdAt` | `createdAt` | Direct mapping |
| `updatedAt` | `updatedAt` | Direct mapping |
| N/A | `type` | Generated: "announcement" |
| N/A | `boardType` | Default: "general" |
| N/A | `sourceGroup` | Default: null |
| N/A | `isImportant` | Generated from priority: high→true |
| N/A | `isPinned` | Default: false |
| N/A | `isFeatured` | Generated from priority: high→true |
| N/A | `viewCount` | Default: 0 |
| N/A | `replyCount` | Default: 0 |

### TeacherReminder → Communication

| TeacherReminder Field | Communication Field | Mapping Strategy |
|----------------------|---------------------|------------------|
| `id` | `id` (new) | Auto-generated, original preserved in logs |
| `title` | `title` | Direct mapping |
| `content` | `content` | Direct mapping |
| `priority` | `priority` | Direct mapping |
| `status` | `status` | Transform: active→published, completed→archived |
| `dueDate` | `expiresAt` | Direct mapping |
| `createdBy` | `authorId` | Mapped to authorId |
| `targetAudience` | `targetAudience` | Direct mapping |
| `createdAt` | `createdAt` | Direct mapping |
| `updatedAt` | `updatedAt` | Direct mapping |
| `dueTime` | `summary` | Embedded in enhanced summary |
| `reminderType` | `summary` | Embedded in enhanced summary |
| `isRecurring` | `isFeatured` | isRecurring→isFeatured |
| `recurringPattern` | `summary` | Embedded in enhanced summary |
| `completedAt` | `summary` | Embedded in enhanced summary |
| `completedBy` | `summary` | Embedded in enhanced summary |
| N/A | `type` | Generated: "reminder" |
| N/A | `summary` | Enhanced with reminder details |
| N/A | `sourceGroup` | Default: "Academic Team" |
| N/A | `boardType` | Default: "teachers" |
| N/A | `isImportant` | Generated from priority: high→true |
| N/A | `isPinned` | Generated: active + high priority → true |
| N/A | `publishedAt` | Set to createdAt if status="active" |
| N/A | `viewCount` | Default: 0 |
| N/A | `replyCount` | Default: 0 |

**Enhanced Summary Format for Reminders**:
```
[Original content summary...] | Due: [dueDate] [dueTime] | Type: [reminderType] | Recurring | Pattern: [recurringPattern] | Completed by [completedBy] on [completedAt]
```

## Safety Measures

### Data Protection
- **Comprehensive Backups**: Full table backups with relationships preserved
- **Dry Run Mode**: Test migrations without making changes  
- **Transaction Safety**: All operations wrapped in transactions
- **Rollback Capability**: Complete restoration from backups
- **Data Validation**: Pre and post-migration integrity checks

### Migration Safety
- **Default Dry Run**: All scripts default to DRY_RUN=true
- **Manual Confirmation**: Production mode requires explicit flag setting
- **Countdown Timers**: Warning periods before destructive operations
- **Error Handling**: Comprehensive error logging and graceful failures
- **Atomic Operations**: Either complete success or complete rollback

### Monitoring & Logging
- **Detailed Logging**: Every operation logged with timestamps
- **Progress Tracking**: Real-time progress updates during migration
- **Error Reporting**: Comprehensive error capture and reporting
- **Migration Reports**: Detailed reports for every phase
- **Backup Analysis**: Detailed backup summaries and statistics

## Troubleshooting

### Common Issues

1. **Migration Fails with "Backup not found"**
   ```bash
   # Ensure backup was created first
   npm run tsx scripts/backup-communication-unification.ts
   ```

2. **"DRY_RUN must be set to false" Error**
   ```bash
   # For production migration, explicitly disable dry run
   DRY_RUN=false npm run tsx scripts/migrate-to-communication-system.ts
   ```

3. **Database Connection Issues**
   ```bash
   # Verify database connection
   npm run tsx scripts/test-db-connection.ts
   ```

4. **Permission Errors**
   - Ensure database user has CREATE, INSERT, UPDATE, DELETE permissions
   - Verify table-level permissions for all source and target tables

### Rollback Scenarios

**When to Rollback**:
- Data corruption detected after migration
- Application errors due to migration issues  
- Incomplete migration with missing records
- Performance issues with new structure

**Rollback Process**:
```bash
# 1. Assess the situation
npm run tsx scripts/validate-communication-structure.ts

# 2. Dry run rollback to see what would be restored
DRY_RUN=true npm run tsx scripts/rollback-communication-system.ts

# 3. Execute rollback if needed
DRY_RUN=false npm run tsx scripts/rollback-communication-system.ts
```

### Data Validation

**Post-Migration Checks**:
```sql
-- Verify record counts
SELECT 'MessageBoard', COUNT(*) FROM message_board
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements  
UNION ALL
SELECT 'TeacherReminders', COUNT(*) FROM teacher_reminders
UNION ALL
SELECT 'Communications', COUNT(*) FROM communications
UNION ALL
SELECT 'CommunicationReplies', COUNT(*) FROM communication_replies;

-- Verify type distribution
SELECT type, COUNT(*) FROM communications GROUP BY type;

-- Check for orphaned records
SELECT * FROM communication_replies 
WHERE communication_id NOT IN (SELECT id FROM communications);
```

## Application Updates

After successful migration, update application code:

### Database Queries
```typescript
// OLD: Separate queries for different types
const messages = await prisma.messageBoard.findMany()
const announcements = await prisma.announcement.findMany()
const reminders = await prisma.teacherReminder.findMany()

// NEW: Unified query with type filtering
const allCommunications = await prisma.communication.findMany()
const messages = await prisma.communication.findMany({ where: { type: 'message_board' } })
const announcements = await prisma.communication.findMany({ where: { type: 'announcement' } })
const reminders = await prisma.communication.findMany({ where: { type: 'reminder' } })
```

### API Endpoints
- Update routes to use Communication table
- Maintain backward compatibility if needed
- Update response formats to include new fields

### Frontend Components
- Update component props to handle unified data structure
- Add type-specific rendering logic
- Update form handling for new fields

## Performance Considerations

### Indexing Strategy
```sql
-- Recommended indexes for optimal performance
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_priority ON communications(priority);
CREATE INDEX idx_communications_author ON communications(author_id);
CREATE INDEX idx_communications_board_type ON communications(board_type);
CREATE INDEX idx_communications_source_group ON communications(source_group);
CREATE INDEX idx_communications_published ON communications(published_at);
CREATE INDEX idx_communications_expires ON communications(expires_at);
CREATE INDEX idx_communication_replies_comm_id ON communication_replies(communication_id);
```

### Query Optimization
- Use type-specific indexes for filtering
- Consider pagination for large result sets
- Optimize joins with CommunicationReply table
- Cache frequently accessed data

## File Structure

```
scripts/
├── communication-unification-backups/          # Generated backup files
│   ├── comprehensive-backup-[date].json        # Complete backup
│   ├── messageBoard-backup-[date].json         # MessageBoard backup
│   ├── announcements-backup-[date].json        # Announcements backup
│   ├── teacherReminders-backup-[date].json     # TeacherReminders backup
│   ├── BACKUP-SUMMARY.md                       # Backup analysis
│   ├── structure-validation-[date].md          # Structure validation report
│   ├── migration-report-[date].md              # Migration execution report
│   └── rollback-report-[date].md               # Rollback execution report
├── validate-communication-structure.ts          # Structure validation script
├── backup-communication-unification.ts          # Backup creation script  
├── migrate-to-communication-system.ts           # Migration execution script
├── rollback-communication-system.ts             # Rollback execution script
└── COMMUNICATION-UNIFICATION-README.md          # This documentation
```

## Support

For issues or questions:
1. Check the generated reports in `communication-unification-backups/`
2. Review error logs in script output
3. Consult the troubleshooting section above
4. Test on development environment before production

---

**⚠️ IMPORTANT**: Always run backups and dry-run migrations before executing production migrations. Keep all backup files until migration stability is confirmed.

**🔒 SECURITY**: Ensure all backup files containing sensitive data are properly secured and access-controlled.

**📊 MONITORING**: Monitor application performance and database queries after migration to ensure optimal performance.

---
*Last updated: 2025-09-04*