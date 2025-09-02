#!/usr/bin/env tsx

/**
 * Test Message Display for Vickie's First Week Message
 * 測試Vickie第一週訊息的顯示效果
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMessageDisplay() {
  try {
    console.log('🔍 Testing message display functionality...')
    
    // Test 1: Get all messages from Vickie
    console.log('\n📋 Test 1: Fetching messages from Vickie...')
    const vickieMessages = await prisma.messageBoard.findMany({
      where: {
        sourceGroup: 'Vickie',
        status: 'active'
      },
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
      orderBy: [
        { isImportant: 'desc' },
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`✅ Found ${vickieMessages.length} messages from Vickie`)
    
    if (vickieMessages.length > 0) {
      const latestMessage = vickieMessages[0]
      console.log(`📝 Latest message: "${latestMessage.title}"`)
      console.log(`🚨 Important: ${latestMessage.isImportant}`)
      console.log(`📌 Pinned: ${latestMessage.isPinned}`)
      console.log(`📅 Created: ${latestMessage.createdAt}`)
      console.log(`✍️ Author: ${latestMessage.author?.displayName || 'No author'}`)
    }

    // Test 2: Simulate API response structure
    console.log('\n📡 Test 2: Simulating API response structure...')
    const allMessages = await prisma.messageBoard.findMany({
      where: {
        status: 'active',
        OR: [
          { boardType: 'teachers' },
          { boardType: 'general' }
        ]
      },
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
      orderBy: [
        { isImportant: 'desc' },
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20
    })

    // Separate important, pinned and regular messages
    const importantMessages = allMessages.filter(m => m.isImportant)
    const pinnedMessages = allMessages.filter(m => m.isPinned && !m.isImportant)
    const regularMessages = allMessages.filter(m => !m.isPinned && !m.isImportant)

    // Group messages by source group
    const messagesByGroup = allMessages.reduce((acc, message) => {
      const group = message.sourceGroup || 'general'
      if (!acc[group]) acc[group] = []
      acc[group].push(message)
      return acc
    }, {} as Record<string, typeof allMessages>)

    console.log(`📊 API Response Structure:`)
    console.log(`   Important messages: ${importantMessages.length}`)
    console.log(`   Pinned messages: ${pinnedMessages.length}`)
    console.log(`   Regular messages: ${regularMessages.length}`)
    console.log(`   Total messages: ${allMessages.length}`)
    
    console.log(`📂 Messages by group:`)
    Object.entries(messagesByGroup).forEach(([group, messages]) => {
      console.log(`   ${group}: ${messages.length} messages`)
    })

    // Test 3: Check if Vickie messages are prioritized
    console.log('\n🎯 Test 3: Checking message prioritization...')
    if (importantMessages.some(m => m.sourceGroup === 'Vickie')) {
      console.log('✅ Vickie messages are correctly marked as important')
    } else {
      console.log('⚠️  No important messages found from Vickie')
    }

    // Test 4: Verify color coding data is available
    console.log('\n🎨 Test 4: Verifying color coding data...')
    const groupColors: Record<string, { bg: string, text: string, label: string }> = {
      'Vickie': { bg: 'bg-purple-100', text: 'text-purple-700', label: '👩‍💼 Vickie' },
      '副主任Matthew': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '👨‍💼 副主任 Matthew' },
      'Academic Team': { bg: 'bg-blue-100', text: 'text-blue-700', label: '📚 Academic Team' },
      'Curriculum Team': { bg: 'bg-green-100', text: 'text-green-700', label: '📖 Curriculum Team' },
      'Instructional Team': { bg: 'bg-orange-100', text: 'text-orange-700', label: '🎯 Instructional Team' },
      'general': { bg: 'bg-gray-100', text: 'text-gray-700', label: '📢 General' }
    }

    Object.entries(messagesByGroup).forEach(([group, messages]) => {
      const colors = groupColors[group] || groupColors['general']
      console.log(`   ${colors.label}: ${messages.length} messages (${colors.bg}, ${colors.text})`)
    })

    console.log('\n🎉 Message display test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing message display:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testMessageDisplay()