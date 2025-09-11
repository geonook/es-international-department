/**
 * Check Carousel Database Records
 * 檢查輪播數據庫記錄
 */

import { prisma } from '../lib/prisma'

async function checkCarouselData() {
  try {
    console.log('🔍 Checking carousel database records...')
    
    // 檢查所有輪播圖片記錄
    const allImages = await prisma.contentCarouselImage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            email: true,
            displayName: true
          }
        }
      }
    })
    
    console.log(`📊 Total carousel images in database: ${allImages.length}`)
    
    if (allImages.length > 0) {
      console.log('\n📸 All carousel images:')
      allImages.forEach((image, index) => {
        console.log(`${index + 1}. ID: ${image.id}`)
        console.log(`   Title: ${image.title || 'No title'}`)
        console.log(`   URL: ${image.imageUrl}`)
        console.log(`   Active: ${image.isActive}`)
        console.log(`   Order: ${image.order}`)
        console.log(`   Created: ${image.createdAt}`)
        console.log(`   Uploader: ${image.uploader?.email || 'Unknown'}`)
        console.log('   ---')
      })
    } else {
      console.log('❌ No carousel images found in database')
    }
    
    // 檢查 active 圖片
    const activeImages = await prisma.contentCarouselImage.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`\n✅ Active carousel images: ${activeImages.length}`)
    
    if (activeImages.length > 0) {
      console.log('\n🎯 Active images (should display on homepage):')
      activeImages.forEach((image, index) => {
        console.log(`${index + 1}. ID: ${image.id}, Order: ${image.order}, URL: ${image.imageUrl}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCarouselData()