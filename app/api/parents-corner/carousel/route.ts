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

    // Production 環境使用硬編碼資料以確保穩定性
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction) {
      console.log('🏭 Production mode: Using hardcoded carousel data')
      
      const hardcodedCarouselImages = [
        {
          id: 1,
          title: "Festive Learning Environment",
          description: "Students enjoying interactive learning activities in our beautifully decorated classrooms during the holiday season",
          imageUrl: "/images/carousel/carousel-1.jpg",
          altText: "Students participating in Christmas themed classroom activities",
          order: 1,
          createdAt: new Date('2024-12-01T00:00:00Z')
        },
        {
          id: 2,
          title: "Parent Engagement Day",
          description: "Interactive sessions where parents join our educational community to understand and support their children's learning journey",
          imageUrl: "/images/carousel/carousel-2.jpg",
          altText: "Teacher presenting to engaged parents during family learning session",
          order: 2,
          createdAt: new Date('2024-12-02T00:00:00Z')
        },
        {
          id: 3,
          title: "Community Spirit",
          description: "Our school family coming together for special events, building strong connections between students, teachers, and parents",
          imageUrl: "/images/carousel/carousel-3.jpg",
          altText: "Group photo of students, teachers and parents at school community event",
          order: 3,
          createdAt: new Date('2024-12-03T00:00:00Z')
        },
        {
          id: 4,
          title: "Interactive Learning Experience",
          description: "Students actively participating in dynamic classroom activities designed to enhance engagement and understanding",
          imageUrl: "/images/carousel/carousel-4.jpg",
          altText: "Students engaged in interactive classroom learning activities",
          order: 4,
          createdAt: new Date('2024-12-04T00:00:00Z')
        }
      ]

      return NextResponse.json({
        success: true,
        data: hardcodedCarouselImages,
        count: hardcodedCarouselImages.length
      })
    }

    // Development/Staging 環境使用資料庫查詢
    console.log('🧪 Development/Staging mode: Using database query')
    
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