/**
 * Public Content Carousel API 
 * 公共內容輪播 API - 用於前端展示
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - 獲取活躍的輪播圖片（公共訪問）
export async function GET(request: NextRequest) {
  try {
    console.log('🎠 GET /api/parents-corner/carousel - 獲取公共輪播圖片')

    // 獲取活躍的輪播圖片，按順序排列
    const carouselImages = await prisma.contentCarouselImage.findMany({
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

    console.log(`📸 Found ${carouselImages.length} active carousel images`)

    return NextResponse.json({
      success: true,
      data: carouselImages,
      count: carouselImages.length
    })

  } catch (error) {
    console.error('❌ Error fetching carousel images:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch carousel images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}