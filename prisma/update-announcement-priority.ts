import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAnnouncementPriority() {
  console.log('🔧 Updating announcement priority and pinned status...')

  try {
    const updated = await prisma.communication.updateMany({
      where: {
        title: "English Textbooks Return & eBook Purchase 英語教材退書 & 電子書加購",
        type: 'announcement'
      },
      data: {
        priority: 'high',
        isImportant: true,
        isPinned: true
      }
    })

    console.log(`✅ Updated ${updated.count} announcement(s)`)

  } catch (error) {
    console.error('❌ Error updating announcement:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAnnouncementPriority()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })