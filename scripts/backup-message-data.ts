#!/usr/bin/env tsx

/**
 * Backup Message Board Data Before Cleanup
 * 清理前備份訊息板資料
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function backupMessageData() {
  try {
    console.log('💾 Starting message data backup...')
    
    // Get all message board data
    const messages = await prisma.messageBoard.findMany({
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
                displayName: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Separate first week message from test data
    const firstWeekMessage = messages.find(m => m.id === 16 && m.title.includes('25-26學年第一週'))
    const testMessages = messages.filter(m => m.id !== 16)

    console.log(`📊 Found ${messages.length} total messages:`)
    console.log(`   ✅ First week message: ${firstWeekMessage ? '1' : '0'}`)
    console.log(`   🧪 Test messages: ${testMessages.length}`)

    // Create backup data structure
    const backupData = {
      backupDate: new Date().toISOString(),
      totalMessages: messages.length,
      firstWeekMessage: firstWeekMessage ? {
        id: firstWeekMessage.id,
        title: firstWeekMessage.title,
        sourceGroup: firstWeekMessage.sourceGroup,
        status: 'KEEP - This is the important first week message'
      } : null,
      testMessagesToDelete: testMessages.map(msg => ({
        id: msg.id,
        title: msg.title,
        content: msg.content,
        sourceGroup: msg.sourceGroup,
        boardType: msg.boardType,
        isImportant: msg.isImportant,
        isPinned: msg.isPinned,
        status: msg.status,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        author: msg.author,
        replies: msg.replies,
        note: 'TO BE DELETED - Test data'
      }))
    }

    // Save backup to file
    const backupPath = path.join(process.cwd(), 'scripts', 'message-backup.json')
    writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')

    console.log(`✅ Backup completed successfully!`)
    console.log(`📁 Backup saved to: ${backupPath}`)
    console.log(`📝 Backup summary:`)
    console.log(`   - Total messages backed up: ${messages.length}`)
    console.log(`   - Messages to keep: 1 (ID: ${firstWeekMessage?.id})`)
    console.log(`   - Messages to delete: ${testMessages.length} (IDs: ${testMessages.map(m => m.id).join(', ')})`)

    if (firstWeekMessage) {
      console.log(`\n🎯 First week message details:`)
      console.log(`   Title: ${firstWeekMessage.title}`)
      console.log(`   Source: ${firstWeekMessage.sourceGroup}`)
      console.log(`   Important: ${firstWeekMessage.isImportant}`)
      console.log(`   Created: ${firstWeekMessage.createdAt}`)
    }

  } catch (error) {
    console.error('❌ Error creating backup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the backup
backupMessageData()