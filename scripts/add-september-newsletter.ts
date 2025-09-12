/**
 * Add September 2024 English Newsletter
 * 添加2024年9月英文電子報
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSeptemberNewsletter() {
  try {
    console.log('📰 Adding September 2024 English newsletter...')
    
    // Find admin user to set as author
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@kcislk.ntpc.edu.tw' }
    })
    
    if (!adminUser) {
      console.error('❌ Admin user not found')
      return
    }
    
    // Check if September 2024 newsletter already exists
    const existingSeptember = await prisma.communication.findFirst({
      where: {
        type: 'newsletter',
        issueNumber: '2024-09'
      }
    })
    
    if (existingSeptember) {
      console.log('ℹ️  September 2024 newsletter already exists, updating to English version...')
      
      await prisma.communication.update({
        where: { id: existingSeptember.id },
        data: {
          title: 'September 2024 ID Monthly Newsletter',
          content: 'This month\'s newsletter contains the latest school activity information and educational resources. Parents and teachers are welcome to read the exciting content online. This issue includes:\n\n1. New semester learning arrangements and schedules\n2. Fall semester activity announcements\n3. Parent-teacher conference information\n4. Student achievement showcases\n5. Important school updates and reminders\n\nThank you for your continued support and participation!',
          summary: 'This month\'s newsletter contains the latest school activity information and educational resources. Parents and teachers are welcome to read online.',
          onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/',
          status: 'published',
          targetAudience: 'all',
          priority: 'high',
          isImportant: true,
          isPinned: true,
          publishedAt: new Date('2024-09-15')
        }
      })
      
      console.log('✅ Updated existing September 2024 newsletter to English version')
    } else {
      // Create new September 2024 newsletter
      const septemberNewsletter = await prisma.communication.create({
        data: {
          title: 'September 2024 ID Monthly Newsletter',
          content: 'This month\'s newsletter contains the latest school activity information and educational resources. Parents and teachers are welcome to read the exciting content online. This issue includes:\n\n1. New semester learning arrangements and schedules\n2. Fall semester activity announcements\n3. Parent-teacher conference information\n4. Student achievement showcases\n5. Important school updates and reminders\n\nThank you for your continued support and participation!',
          summary: 'This month\'s newsletter contains the latest school activity information and educational resources. Parents and teachers are welcome to read online.',
          type: 'newsletter',
          targetAudience: 'all',
          priority: 'high',
          status: 'published',
          isImportant: true,
          isPinned: true,
          authorId: adminUser.id,
          publishedAt: new Date('2024-09-15'),
          onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/',
          pdfUrl: null,
          issueNumber: '2024-09'
        }
      })
      
      console.log(`✅ Created new September 2024 newsletter (ID: ${septemberNewsletter.id})`)
    }
    
    // Verify the newsletter
    const newsletters = await prisma.communication.findMany({
      where: { type: 'newsletter' },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })
    
    console.log('📋 Current newsletter entries:')
    newsletters.forEach((newsletter, index) => {
      console.log(`   ${index + 1}. ${newsletter.title} (Issue: ${newsletter.issueNumber})`)
    })
    
    console.log('✅ September 2024 newsletter setup completed!')
    
  } catch (error) {
    console.error('❌ Error adding September newsletter:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute
addSeptemberNewsletter()
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })