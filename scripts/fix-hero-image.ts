/**
 * 修復 Teachers 頁面主視覺圖片設定
 * Fix Teachers Page Hero Image Setting
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixHeroImageSetting() {
  try {
    console.log('🔧 開始修復 Teachers 頁面主視覺圖片設定...\n')

    // 1. 獲取最新的圖片上傳記錄
    console.log('1️⃣ 查找最近的圖片上傳記錄:')
    const latestImageUpload = await prisma.fileUpload.findFirst({
      where: {
        mimeType: {
          startsWith: 'image/'
        }
      },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestImageUpload) {
      console.log('❌ 沒有找到任何圖片上傳記錄')
      return
    }

    console.log('✅ 找到最新的圖片上傳:')
    console.log(`   檔案: ${latestImageUpload.originalFilename}`)
    console.log(`   路徑: ${latestImageUpload.filePath}`)
    console.log(`   上傳者: ${latestImageUpload.uploader?.email || 'Unknown'}`)
    console.log(`   上傳時間: ${latestImageUpload.createdAt}\n`)

    // 2. 詢問是否要使用這個圖片作為 Hero Image
    console.log('2️⃣ 將此圖片設定為 Teachers 頁面主視覺圖片...')

    // 3. 更新系統設定
    const updatedSetting = await prisma.systemSetting.update({
      where: { key: 'teacher_hero_image_url' },
      data: {
        value: latestImageUpload.filePath,
        updatedBy: latestImageUpload.uploadedBy
      }
    })

    console.log('✅ 系統設定已更新:')
    console.log(`   舊值: /images/teacher-hero-bg.svg`)
    console.log(`   新值: ${updatedSetting.value}`)
    console.log(`   更新時間: ${updatedSetting.updatedAt}\n`)

    // 4. 可選：將上傳記錄標記為 hero_image 類型
    const updatedUpload = await prisma.fileUpload.update({
      where: { id: latestImageUpload.id },
      data: {
        relatedType: 'hero_image'
      }
    })

    console.log('✅ 檔案上傳記錄已更新:')
    console.log(`   標記為類型: ${updatedUpload.relatedType}\n`)

    // 5. 驗證修復
    console.log('3️⃣ 驗證修復結果:')
    const heroSetting = await prisma.systemSetting.findUnique({
      where: { key: 'teacher_hero_image_url' }
    })

    console.log(`✅ 系統設定確認: ${heroSetting?.value}`)
    console.log('🎉 修復完成！Teachers 頁面現在將顯示新的主視覺圖片')
    console.log('💡 請重新整理瀏覽器頁面查看效果\n')

    console.log('📝 建議後續動作:')
    console.log('1. 測試 Teachers 頁面，確認圖片正確顯示')
    console.log('2. 如需更換圖片，請使用 Admin Dashboard 的 Hero Image 管理功能')
    console.log('3. 確保圖片文件存在於指定路徑\n')

  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHeroImageSetting()