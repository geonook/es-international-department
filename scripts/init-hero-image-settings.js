/**
 * 初始化主視覺圖片系統設定
 * Initialize hero image system settings
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initHeroImageSettings() {
  try {
    console.log('🚀 Initializing hero image system settings...')

    // 檢查設定是否已存在
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key: 'teacher_hero_image_url' }
    })

    if (existingSetting) {
      console.log('✅ Teacher hero image setting already exists:', existingSetting.value)
      return
    }

    // 創建新的系統設定
    const newSetting = await prisma.systemSetting.create({
      data: {
        key: 'teacher_hero_image_url',
        value: '/images/teacher-hero-bg.svg',
        description: 'Teachers page hero section background image URL',
        dataType: 'string',
        isPublic: true, // 允許前端存取
      }
    })

    console.log('✅ Successfully created teacher hero image setting:', newSetting)

    // 創建其他相關設定
    const additionalSettings = [
      {
        key: 'hero_image_upload_enabled',
        value: 'true',
        description: 'Enable hero image upload functionality in admin panel',
        dataType: 'boolean',
        isPublic: false,
      },
      {
        key: 'hero_image_max_size',
        value: '5242880', // 5MB in bytes
        description: 'Maximum file size for hero image uploads (bytes)',
        dataType: 'number',
        isPublic: false,
      },
      {
        key: 'hero_image_allowed_types',
        value: 'jpg,jpeg,png,webp',
        description: 'Allowed file types for hero image uploads',
        dataType: 'string',
        isPublic: false,
      }
    ]

    for (const setting of additionalSettings) {
      const existing = await prisma.systemSetting.findUnique({
        where: { key: setting.key }
      })

      if (!existing) {
        await prisma.systemSetting.create({
          data: setting
        })
        console.log(`✅ Created setting: ${setting.key} = ${setting.value}`)
      } else {
        console.log(`⚠️ Setting already exists: ${setting.key}`)
      }
    }

    console.log('🎉 Hero image system settings initialization completed!')

  } catch (error) {
    console.error('❌ Error initializing hero image settings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 執行初始化
if (require.main === module) {
  initHeroImageSettings().catch((error) => {
    console.error('Failed to initialize hero image settings:', error)
    process.exit(1)
  })
}

module.exports = initHeroImageSettings