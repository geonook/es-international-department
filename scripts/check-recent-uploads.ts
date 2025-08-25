/**
 * 檢查最近的檔案上傳記錄
 * Check Recent File Upload Records
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRecentUploads() {
  try {
    console.log('🔍 檢查最近的檔案上傳記錄...\n')

    // 檢查最近的所有檔案上傳
    const recentUploads = await prisma.fileUpload.findMany({
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (recentUploads.length > 0) {
      console.log(`✅ 找到 ${recentUploads.length} 條最近的上傳記錄:`)
      console.log('─'.repeat(80))
      
      recentUploads.forEach((upload, index) => {
        console.log(`Upload ${index + 1}:`)
        console.log(`  ID: ${upload.id}`)
        console.log(`  Original: ${upload.originalFilename}`)
        console.log(`  Stored: ${upload.storedFilename}`)
        console.log(`  Path: ${upload.filePath}`)
        console.log(`  Size: ${Number(upload.fileSize)} bytes`)
        console.log(`  Type: ${upload.mimeType}`)
        console.log(`  Related Type: ${upload.relatedType}`)
        console.log(`  Related ID: ${upload.relatedId}`)
        console.log(`  Uploader: ${upload.uploader?.email || 'Unknown'}`)
        console.log(`  Created: ${upload.createdAt}`)
        console.log('─'.repeat(40))
      })

      // 檢查最新的 hero_image 上傳
      const heroImageUpload = recentUploads.find(upload => upload.relatedType === 'hero_image')
      if (heroImageUpload) {
        console.log('\n🎯 發現 Hero Image 上傳記錄:')
        console.log(`   檔案路徑: ${heroImageUpload.filePath}`)
        console.log(`   上傳時間: ${heroImageUpload.createdAt}`)
        
        // 檢查系統設定是否同步更新
        const heroSetting = await prisma.systemSetting.findUnique({
          where: { key: 'teacher_hero_image_url' }
        })
        
        console.log(`   系統設定值: ${heroSetting?.value}`)
        console.log(`   設定更新時間: ${heroSetting?.updatedAt}`)
        
        if (heroSetting?.value === heroImageUpload.filePath) {
          console.log('   ✅ 系統設定與上傳檔案路徑一致')
        } else {
          console.log('   ❌ 系統設定與上傳檔案路徑不一致！')
        }
      } else {
        console.log('\n❌ 未發現 hero_image 類型的上傳記錄')
      }

    } else {
      console.log('❌ 未找到任何檔案上傳記錄')
    }

    console.log('\n🏁 檢查完成!')

  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentUploads()