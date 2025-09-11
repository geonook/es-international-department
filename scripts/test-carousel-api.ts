/**
 * Test Carousel API Direct Query
 * 測試輪播 API 直接查詢
 */

import { prisma } from '../lib/prisma'

async function testCarouselQuery() {
  try {
    console.log('🧪 Testing carousel API query logic...')
    
    // 首先模擬公共API的查詢
    console.log('\n1. 模擬公共API查詢:')
    const publicQuery = await prisma.contentCarouselImage.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        altText: true,
        order: true,
        createdAt: true
      }
    })
    
    console.log(`📸 Public API would return: ${publicQuery.length} images`)
    if (publicQuery.length > 0) {
      console.log('✅ Public API query is working correctly!')
      publicQuery.forEach((img, index) => {
        console.log(`   ${index + 1}. ID: ${img.id}, Order: ${img.order}, URL: ${img.imageUrl}`)
      })
    } else {
      console.log('❌ Public API query returns 0 images - this explains the frontend issue!')
    }
    
    // 然後檢查不同的查詢條件
    console.log('\n2. 檢查各種查詢條件:')
    
    // 查詢所有記錄（無條件）
    const allRecords = await prisma.contentCarouselImage.findMany()
    console.log(`📊 Total records in table: ${allRecords.length}`)
    
    // 查詢 isActive = true 的記錄
    const activeTrue = await prisma.contentCarouselImage.findMany({
      where: { isActive: true }
    })
    console.log(`✅ Records with isActive = true: ${activeTrue.length}`)
    
    // 查詢 isActive = false 的記錄
    const activeFalse = await prisma.contentCarouselImage.findMany({
      where: { isActive: false }
    })
    console.log(`❌ Records with isActive = false: ${activeFalse.length}`)
    
    // 檢查 null 值
    const activeNull = await prisma.contentCarouselImage.findMany({
      where: { isActive: null }
    })
    console.log(`⚠️ Records with isActive = null: ${activeNull.length}`)
    
    // 檢查每條記錄的 isActive 值
    console.log('\n3. 檢查每條記錄的 isActive 值:')
    allRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, isActive: ${record.isActive} (type: ${typeof record.isActive})`)
    })
    
    // 嘗試原始SQL查詢
    console.log('\n4. 執行原始SQL查詢:')
    const rawQuery = await prisma.$queryRaw`
      SELECT id, title, image_url, is_active, "order", created_at 
      FROM content_carousel_images 
      WHERE is_active = true 
      ORDER BY "order" ASC, created_at DESC
    `
    console.log(`🔍 Raw SQL query result: ${Array.isArray(rawQuery) ? rawQuery.length : 0} records`)
    
    if (Array.isArray(rawQuery) && rawQuery.length > 0) {
      rawQuery.forEach((record: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${record.id}, is_active: ${record.is_active}, order: ${record.order}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCarouselQuery()