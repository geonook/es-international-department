#!/usr/bin/env tsx

/**
 * Cleanup Test Messages from Message Board
 * 清理測試訊息，只保留第一週重要訊息
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestMessages() {
  try {
    console.log('🧹 Starting message board cleanup...')
    
    // First, verify what we have
    const allMessages = await prisma.messageBoard.findMany({
      select: {
        id: true,
        title: true,
        sourceGroup: true,
        isImportant: true
      },
      orderBy: { id: 'asc' }
    })

    console.log(`📊 Current messages in database: ${allMessages.length}`)
    
    // Find the first week message (should be ID 16)
    const firstWeekMessage = allMessages.find(m => 
      m.id === 16 && m.title.includes('25-26學年第一週')
    )

    if (!firstWeekMessage) {
      console.error('❌ ERROR: First week message not found! Aborting cleanup.')
      console.error('   Expected: ID 16 with title containing "25-26學年第一週"')
      return
    }

    console.log(`✅ First week message found: ID ${firstWeekMessage.id}`)
    console.log(`   Title: ${firstWeekMessage.title}`)
    console.log(`   Source: ${firstWeekMessage.sourceGroup}`)
    console.log(`   Important: ${firstWeekMessage.isImportant}`)

    // Identify test messages to delete (all except ID 16)
    const testMessageIds = allMessages
      .filter(m => m.id !== 16)
      .map(m => m.id)

    console.log(`\n🎯 Messages to delete: ${testMessageIds.length}`)
    console.log(`   IDs: ${testMessageIds.join(', ')}`)

    if (testMessageIds.length === 0) {
      console.log('✅ No test messages to delete. Database is already clean!')
      return
    }

    // Confirm we're not deleting the important message
    if (testMessageIds.includes(16)) {
      console.error('❌ CRITICAL ERROR: Attempting to delete first week message! Aborting.')
      return
    }

    // Delete test messages
    console.log('\n🗑️  Starting deletion process...')
    
    // Delete any replies to test messages first (foreign key constraint)
    const deletedReplies = await prisma.messageReply.deleteMany({
      where: {
        messageId: {
          in: testMessageIds
        }
      }
    })
    
    console.log(`   Deleted ${deletedReplies.count} replies to test messages`)

    // Now delete the test messages
    const deletedMessages = await prisma.messageBoard.deleteMany({
      where: {
        id: {
          in: testMessageIds
        }
      }
    })

    console.log(`   Deleted ${deletedMessages.count} test messages`)

    // Verify cleanup
    const remainingMessages = await prisma.messageBoard.findMany({
      select: {
        id: true,
        title: true,
        sourceGroup: true,
        isImportant: true
      }
    })

    console.log(`\n✅ Cleanup completed successfully!`)
    console.log(`📊 Final database state:`)
    console.log(`   Remaining messages: ${remainingMessages.length}`)
    
    if (remainingMessages.length === 1) {
      const remaining = remainingMessages[0]
      console.log(`   ✅ Only message: ID ${remaining.id} - ${remaining.title}`)
      console.log(`      Source: ${remaining.sourceGroup}`)
      console.log(`      Important: ${remaining.isImportant}`)
    } else {
      console.log(`   ⚠️  Unexpected: ${remainingMessages.length} messages remaining`)
      remainingMessages.forEach(msg => {
        console.log(`      ID ${msg.id}: ${msg.title}`)
      })
    }

    console.log(`\n🎉 Message board is now clean with only the first week message!`)

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupTestMessages()