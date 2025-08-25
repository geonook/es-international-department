/**
 * 檢查 Teachers 頁面圖片上傳問題的診斷腳本
 * Check Hero Image Upload Issue Diagnostic Script
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHeroImageIssue() {
  try {
    console.log('🔍 開始檢查 Teachers 頁面圖片顯示問題...\n')

    // 1. 檢查系統設定中的 teacher_hero_image_url
    console.log('1️⃣ 檢查系統設定 teacher_hero_image_url:')
    const heroImageSetting = await prisma.systemSetting.findUnique({
      where: { key: 'teacher_hero_image_url' },
      include: { updater: true }
    })

    if (heroImageSetting) {
      console.log('✅ 找到系統設定:')
      console.log(`   Key: ${heroImageSetting.key}`)
      console.log(`   Value: ${heroImageSetting.value}`)
      console.log(`   Is Public: ${heroImageSetting.isPublic}`)
      console.log(`   Data Type: ${heroImageSetting.dataType}`)
      console.log(`   Updated At: ${heroImageSetting.updatedAt}`)
      console.log(`   Updated By: ${heroImageSetting.updater?.email || 'Unknown'}\n`)
    } else {
      console.log('❌ 未找到 teacher_hero_image_url 設定')
      console.log('   這可能是問題的根源！\n')
    }

    // 2. 檢查最近的檔案上傳記錄
    console.log('2️⃣ 檢查最近的檔案上傳記錄:')
    const recentUploads = await prisma.fileUpload.findMany({
      where: {
        OR: [
          { relatedType: 'hero_image' },
          { originalFilename: { contains: 'hero' } }
        ]
      },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    if (recentUploads.length > 0) {
      console.log('✅ 找到相關檔案上傳記錄:')
      recentUploads.forEach((upload, index) => {
        console.log(`   Upload ${index + 1}:`)
        console.log(`     ID: ${upload.id}`)
        console.log(`     Original: ${upload.originalFilename}`)
        console.log(`     Stored: ${upload.storedFilename}`)
        console.log(`     Path: ${upload.filePath}`)
        console.log(`     Related Type: ${upload.relatedType}`)
        console.log(`     Uploader: ${upload.uploader?.email || 'Unknown'}`)
        console.log(`     Created At: ${upload.createdAt}`)
        console.log('')
      })
    } else {
      console.log('❌ 未找到相關檔案上傳記錄\n')
    }

    // 3. 檢查所有 hero image 相關設定
    console.log('3️⃣ 檢查所有 hero image 相關的系統設定:')
    const heroSettings = await prisma.systemSetting.findMany({
      where: {
        key: {
          contains: 'hero'
        }
      }
    })

    if (heroSettings.length > 0) {
      console.log('✅ 找到 hero image 相關設定:')
      heroSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value} (public: ${setting.isPublic})`)
      })
      console.log('')
    } else {
      console.log('❌ 未找到任何 hero image 相關設定\n')
    }

    // 4. 檢查是否有預設設定需要創建
    if (!heroImageSetting) {
      console.log('4️⃣ 需要創建預設的系統設定')
      console.log('   建議創建以下設定:')
      console.log('   - teacher_hero_image_url: /images/teacher-hero-bg.svg (public: true)')
      console.log('   - hero_image_upload_enabled: true (public: false)')
      console.log('   - hero_image_max_size: 5242880 (public: false)')
      console.log('   - hero_image_allowed_types: jpg,jpeg,png,webp (public: false)\n')
    }

    // 5. 測試 API 端點
    console.log('5️⃣ 建議測試以下 API 端點:')
    console.log('   GET /api/settings?key=teacher_hero_image_url')
    console.log('   GET /api/admin/hero-image')
    console.log('   應該檢查這些端點是否正常返回資料\n')

    console.log('🏁 檢查完成!')

  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkHeroImageIssue()