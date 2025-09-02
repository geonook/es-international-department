#!/usr/bin/env tsx

/**
 * Data Migration Script: Move existing data to Communications table
 * 資料遷移腳本：將現有資料移至 Communications 表
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingData() {
  console.log('🚀 Starting data migration to Communications table...\n')
  
  try {
    // Step 1: Migrate Announcements to Communications
    console.log('📢 Step 1: Migrating announcements...')
    
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })
    
    console.log(`Found ${announcements.length} announcements to migrate`)
    
    for (const announcement of announcements) {
      const communication = await prisma.communication.create({
        data: {
          title: announcement.title,
          content: announcement.content,
          summary: announcement.summary,
          type: 'announcement',
          targetAudience: announcement.targetAudience as any,
          status: announcement.status as any,
          priority: announcement.priority as any,
          publishedAt: announcement.publishedAt,
          expiresAt: announcement.expiresAt,
          authorId: announcement.authorId,
          createdAt: announcement.createdAt,
          updatedAt: announcement.updatedAt
        }
      })
      
      console.log(`✅ Migrated announcement: "${announcement.title}" → Communication ID ${communication.id}`)
    }
    
    // Step 2: Migrate MessageBoard to Communications
    console.log('\n💬 Step 2: Migrating message board posts...')
    
    const messageBoards = await prisma.messageBoard.findMany({
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    console.log(`Found ${messageBoards.length} message board posts to migrate`)
    
    const messageBoardMapping = new Map<number, number>() // old ID → new ID
    
    for (const messageBoard of messageBoards) {
      const communication = await prisma.communication.create({
        data: {
          title: messageBoard.title,
          content: messageBoard.content,
          type: 'message',
          sourceGroup: messageBoard.sourceGroup,
          boardType: messageBoard.boardType as any,
          isImportant: messageBoard.isImportant,
          isPinned: messageBoard.isPinned,
          status: messageBoard.status as any,
          viewCount: messageBoard.viewCount,
          replyCount: messageBoard.replyCount,
          authorId: messageBoard.authorId,
          createdAt: messageBoard.createdAt,
          updatedAt: messageBoard.updatedAt
        }
      })
      
      messageBoardMapping.set(messageBoard.id, communication.id)
      
      console.log(`✅ Migrated message: "${messageBoard.title}" → Communication ID ${communication.id}`)
      
      // Migrate replies
      if (messageBoard.replies.length > 0) {
        console.log(`   📝 Migrating ${messageBoard.replies.length} replies...`)
        
        for (const reply of messageBoard.replies) {
          await prisma.communicationReply.create({
            data: {
              communicationId: communication.id,
              authorId: reply.authorId,
              content: reply.content,
              parentReplyId: reply.parentReplyId,
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt
            }
          })
        }
        
        console.log(`   ✅ Migrated ${messageBoard.replies.length} replies`)
      }
    }
    
    // Step 3: Verify Vickie's important messages
    console.log('\n🔍 Step 3: Verifying Vickie\'s messages...')
    
    const vickieMessages = await prisma.communication.findMany({
      where: {
        sourceGroup: 'Vickie',
        isImportant: true
      },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`✅ Found ${vickieMessages.length} important messages from Vickie:`)
    vickieMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. "${msg.title}"`)
      console.log(`      Created: ${msg.createdAt.toISOString()}`)
      console.log(`      Author: ${msg.author?.displayName || msg.author?.email || 'Unknown'}`)
      console.log(`      Content preview: ${msg.content.substring(0, 100)}...`)
      console.log('')
    })
    
    // Step 4: Final statistics
    console.log('\n📊 Step 4: Final migration statistics...')
    
    const stats = await Promise.all([
      prisma.communication.count(),
      prisma.communication.count({ where: { type: 'announcement' } }),
      prisma.communication.count({ where: { type: 'message' } }),
      prisma.communication.count({ where: { isImportant: true } }),
      prisma.communication.count({ where: { isPinned: true } }),
      prisma.communication.count({ where: { sourceGroup: 'Vickie' } }),
      prisma.communication.count({ where: { sourceGroup: 'Matthew' } }),
      prisma.communicationReply.count()
    ])
    
    const [
      totalComms, announcementsCount, messagesCount, importantCount, 
      pinnedCount, vickieCount, matthewCount, repliesCount
    ] = stats
    
    console.log('🎉 Migration completed successfully!')
    console.log('=====================================')
    console.log(`Total Communications: ${totalComms}`)
    console.log(`  - Announcements: ${announcementsCount}`)
    console.log(`  - Messages: ${messagesCount}`)
    console.log(`  - Important: ${importantCount}`)
    console.log(`  - Pinned: ${pinnedCount}`)
    console.log(`  - From Vickie: ${vickieCount}`)
    console.log(`  - From Matthew: ${matthewCount}`)
    console.log(`Total Replies: ${repliesCount}`)
    
    // Step 5: Test the new API structure
    console.log('\n🧪 Step 5: Testing new structure...')
    
    const latestComm = await prisma.communication.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        },
        replies: {
          take: 3,
          include: {
            author: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    })
    
    if (latestComm) {
      console.log(`✅ Latest communication test successful:`)
      console.log(`   Title: "${latestComm.title}"`)
      console.log(`   Type: ${latestComm.type}`)
      console.log(`   Author: ${latestComm.author?.displayName || latestComm.author?.email || 'Unknown'}`)
      console.log(`   Source Group: ${latestComm.sourceGroup || 'None'}`)
      console.log(`   Status: ${latestComm.status}`)
      console.log(`   Important: ${latestComm.isImportant}`)
      console.log(`   Pinned: ${latestComm.isPinned}`)
      console.log(`   Replies: ${latestComm.replies.length}`)
    }
    
    console.log('\n🚀 New unified Communications API is ready!')
    console.log('Available endpoints:')
    console.log('  - GET /api/v1/communications')
    console.log('  - POST /api/v1/communications')
    console.log('  - GET /api/v1/communications/[id]')
    console.log('  - PUT /api/v1/communications/[id]')
    console.log('  - DELETE /api/v1/communications/[id]')
    
    console.log('\n💡 Next steps:')
    console.log('  1. Test the new API endpoints')
    console.log('  2. Update frontend to use new unified API')
    console.log('  3. Remove old API endpoints when ready')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  migrateExistingData()
    .then(() => {
      console.log('\n✅ Data migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Data migration failed:', error)
      process.exit(1)
    })
}

export default migrateExistingData