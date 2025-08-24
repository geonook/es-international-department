#!/usr/bin/env node

/**
 * Create Test Data Script
 * 建立測試資料腳本
 * 
 * This script creates sample teacher reminders and message board posts
 * for testing the teacher reminders and message board APIs.
 * 
 * Usage: node scripts/create-test-data.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('🚀 開始建立測試資料...')
    console.log('📋 Creating test data for Teacher Reminders and Message Board...\n')

    // First, ensure we have a test user to use as creator/author
    let testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'test@es-international.com' },
          { email: 'admin@es-international.com' }
        ]
      }
    })

    if (!testUser) {
      console.log('👤 Creating test user for data relationships...')
      const hashedPassword = await bcrypt.hash('testuser123', 12)
      
      testUser = await prisma.user.create({
        data: {
          email: 'test@es-international.com',
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          displayName: 'Test User',
          isActive: true,
          emailVerified: true
        }
      })
      console.log('✅ Test user created successfully')
    } else {
      console.log('✅ Using existing test user:', testUser.email)
    }

    // Create sample teacher reminders
    console.log('\n📝 Creating sample teacher reminders...')
    
    const teacherReminders = [
      {
        title: 'Submit Quarterly Progress Reports',
        content: 'Please submit all student progress reports for Q1 by Friday. Include assessment rubrics and parent communication notes. Remember to double-check grades before submission.',
        priority: 'high',
        status: 'active',
        reminderType: 'deadline',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        dueTime: new Date('2024-01-01T14:00:00Z'), // 2 PM
        targetAudience: 'all',
        createdBy: testUser.id
      },
      {
        title: 'Weekly Staff Meeting',
        content: 'Weekly staff meeting in the main conference room. Agenda includes curriculum updates, upcoming events planning, and professional development opportunities.',
        priority: 'medium',
        status: 'active',
        reminderType: 'meeting',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        dueTime: new Date('2024-01-01T15:30:00Z'), // 3:30 PM
        targetAudience: 'all',
        isRecurring: true,
        recurringPattern: 'weekly',
        createdBy: testUser.id
      },
      {
        title: 'Parent-Teacher Conference Preparation',
        content: 'Prepare materials for upcoming parent-teacher conferences. Update student portfolios, prepare talking points, and schedule individual meeting slots.',
        priority: 'medium',
        status: 'active',
        reminderType: 'task',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        targetAudience: 'specific_grades',
        createdBy: testUser.id
      },
      {
        title: 'Fire Drill Safety Reminder',
        content: 'Monthly fire drill scheduled for next Tuesday at 10 AM. Please review evacuation procedures with your students and ensure all safety protocols are followed.',
        priority: 'urgent',
        status: 'active',
        reminderType: 'announcement',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        dueTime: new Date('2024-01-01T10:00:00Z'), // 10 AM
        targetAudience: 'all',
        createdBy: testUser.id
      },
      {
        title: 'Update Digital Learning Platforms',
        content: 'Please update your classroom materials on the digital learning platform. Upload new assignments and ensure all links are working properly.',
        priority: 'low',
        status: 'completed',
        reminderType: 'task',
        targetAudience: 'departments',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedBy: testUser.id,
        createdBy: testUser.id
      }
    ]

    for (const reminder of teacherReminders) {
      const created = await prisma.teacherReminder.create({
        data: reminder
      })
      console.log(`  ✅ Created reminder: "${created.title}" (Priority: ${created.priority})`)
    }

    // Create sample message board posts
    console.log('\n💬 Creating sample message board posts...')
    
    const messageBoardPosts = [
      {
        title: 'Welcome Back to School!',
        content: 'Welcome back everyone! We hope you had a wonderful break. This semester brings exciting new opportunities and learning experiences. Please check your mailboxes for important updates and new curriculum materials.',
        authorId: testUser.id,
        boardType: 'general',
        isPinned: true,
        status: 'active',
        viewCount: 45,
        replyCount: 3
      },
      {
        title: 'New Teaching Resources Available',
        content: 'The library has acquired new teaching resources including interactive whiteboards, updated textbooks, and digital learning tools. Please schedule a time with the librarian to explore these new materials.',
        authorId: testUser.id,
        boardType: 'teachers',
        isPinned: false,
        status: 'active',
        viewCount: 23,
        replyCount: 7
      },
      {
        title: 'Professional Development Workshop Sign-up',
        content: 'We are offering a professional development workshop on "Integrating Technology in the Classroom" next month. Limited spots available. Please sign up by replying to this message or contacting the administration office.',
        authorId: testUser.id,
        boardType: 'teachers',
        isPinned: true,
        status: 'active',
        viewCount: 31,
        replyCount: 12
      },
      {
        title: 'Lunch Menu Updates',
        content: 'The cafeteria has updated the lunch menu to include more healthy options and accommodate dietary restrictions. The new menu will be effective starting next week. Nutritional information is available at the front office.',
        authorId: testUser.id,
        boardType: 'general',
        isPinned: false,
        status: 'active',
        viewCount: 18,
        replyCount: 2
      },
      {
        title: 'Science Fair Project Guidelines',
        content: 'The annual science fair is approaching! Guidelines for student projects are now available. Please review the criteria with your students and help them brainstorm innovative project ideas. Submission deadline is in 6 weeks.',
        authorId: testUser.id,
        boardType: 'teachers',
        isPinned: false,
        status: 'active',
        viewCount: 29,
        replyCount: 5
      }
    ]

    for (const post of messageBoardPosts) {
      const created = await prisma.messageBoard.create({
        data: post
      })
      console.log(`  ✅ Created message: "${created.title}" (Board: ${created.boardType}${created.isPinned ? ', PINNED' : ''})`)
    }

    console.log('\n🎉 測試資料建立完成!')
    console.log('✅ Test data creation completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • ${teacherReminders.length} Teacher Reminders created`)
    console.log(`   • ${messageBoardPosts.length} Message Board posts created`)
    console.log('   • 1 Test user ensured for relationships')
    console.log('\n🔍 You can now test the Teacher Reminders and Message Board APIs!')
    console.log('💡 Use Prisma Studio (npm run db:studio) to view the created data')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
    console.error('\n🔍 Debugging information:')
    console.error('   - Check your DATABASE_URL environment variable')
    console.error('   - Ensure Prisma schema is up to date (npm run db:generate)')
    console.error('   - Verify database connection (npm run test:db)')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...')
  await prisma.$disconnect()
  process.exit(0)
})

// Execute the script
createTestData()