/**
 * Database Cleanup Script - Remove Chinese Newsletter Entries
 * 資料庫清理腳本 - 移除中文電子報條目
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupChineseNewsletters() {
  try {
    console.log('🧹 Starting cleanup of Chinese newsletter entries...')
    
    // Find all Chinese newsletter entries
    const chineseNewsletters = await prisma.communication.findMany({
      where: {
        type: 'newsletter',
        OR: [
          { title: { contains: '年' } },
          { title: { contains: '月份' } },
          { title: { contains: '國際部月刊' } },
          { title: { contains: '月刊' } },
          { content: { contains: '月刊內容' } },
          { content: { contains: '學校活動資訊' } },
          { content: { contains: '教學資源' } },
          { content: { contains: '家長' } },
          { content: { contains: '老師' } },
          { summary: { contains: '月刊' } },
          { summary: { contains: '活動資訊' } }
        ]
      },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        publishedAt: true
      }
    })
    
    console.log(`📊 Found ${chineseNewsletters.length} Chinese newsletter entries:`)
    chineseNewsletters.forEach((newsletter, index) => {
      console.log(`   ${index + 1}. ${newsletter.title} (ID: ${newsletter.id}, Issue: ${newsletter.issueNumber})`)
    })
    
    if (chineseNewsletters.length === 0) {
      console.log('✅ No Chinese newsletter entries found. Database is already clean.')
      return
    }
    
    // Delete Chinese newsletter entries
    const deleteResult = await prisma.communication.deleteMany({
      where: {
        type: 'newsletter',
        OR: [
          { title: { contains: '年' } },
          { title: { contains: '月份' } },
          { title: { contains: '國際部月刊' } },
          { title: { contains: '月刊' } },
          { content: { contains: '月刊內容' } },
          { content: { contains: '學校活動資訊' } },
          { content: { contains: '教學資源' } },
          { content: { contains: '家長' } },
          { content: { contains: '老師' } },
          { summary: { contains: '月刊' } },
          { summary: { contains: '活動資訊' } }
        ]
      }
    })
    
    console.log(`🗑️  Deleted ${deleteResult.count} Chinese newsletter entries`)
    
    // Verify cleanup
    const remainingNewsletters = await prisma.communication.findMany({
      where: { type: 'newsletter' },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })
    
    console.log(`📈 Remaining newsletter entries: ${remainingNewsletters.length}`)
    if (remainingNewsletters.length > 0) {
      console.log('📋 Remaining entries:')
      remainingNewsletters.forEach((newsletter, index) => {
        console.log(`   ${index + 1}. ${newsletter.title} (Issue: ${newsletter.issueNumber})`)
      })
    }
    
    console.log('✅ Chinese newsletter cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during Chinese newsletter cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute cleanup
cleanupChineseNewsletters()
  .catch((error) => {
    console.error('💥 Cleanup failed:', error)
    process.exit(1)
  })