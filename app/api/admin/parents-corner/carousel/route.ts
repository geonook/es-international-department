/**
 * Content Carousel API - Admin Only
 * 內容輪播 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// GET - 獲取所有輪播圖片
export async function GET(request: NextRequest) {
  try {
    console.log('🎠 GET /api/admin/parents-corner/carousel - 獲取輪播圖片')
    
    // 認證檢查
    const authResult = await requireAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      console.log('❌ Authentication failed')
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    console.log('✅ Admin authenticated:', authResult.user.email)

    // 獲取所有輪播圖片，按 order 排序
    const carouselImages = await prisma.contentCarouselImage.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        }
      }
    })

    console.log(`📸 Found ${carouselImages.length} carousel images`)

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

// POST - 創建新的輪播圖片
export async function POST(request: NextRequest) {
  try {
    console.log('🎠 POST /api/admin/parents-corner/carousel - 創建輪播圖片')
    
    // 認證檢查
    const authResult = await requireAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      console.log('❌ Authentication failed')
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const adminUser = authResult.user
    console.log('✅ Admin authenticated:', adminUser.email)

    // 解析請求內容
    const body = await request.json()
    const { title, description, imageUrl, altText, order, isActive } = body

    // 驗證必需字段
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // 如果沒有指定 order，使用下一個可用的順序
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.contentCarouselImage.aggregate({
        _max: { order: true }
      })
      finalOrder = (maxOrder._max.order || 0) + 1
    }

    // 創建輪播圖片
    const carouselImage = await prisma.contentCarouselImage.create({
      data: {
        title: title || null,
        description: description || null,
        imageUrl,
        altText: altText || 'Family learning moment',
        order: finalOrder,
        isActive: isActive !== undefined ? isActive : true,
        uploadedBy: adminUser.id
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        }
      }
    })

    console.log('✅ Created carousel image:', carouselImage.id)

    return NextResponse.json({
      success: true,
      data: carouselImage,
      message: 'Carousel image created successfully'
    })

  } catch (error) {
    console.error('❌ Error creating carousel image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create carousel image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - 批量更新輪播圖片順序
export async function PUT(request: NextRequest) {
  try {
    console.log('🎠 PUT /api/admin/parents-corner/carousel - 批量更新順序')
    
    // 認證檢查
    const authResult = await requireAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      console.log('❌ Authentication failed')
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    console.log('✅ Admin authenticated:', authResult.user.email)

    // 解析請求內容
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      )
    }

    // 使用事務批量更新
    const results = await prisma.$transaction(
      updates.map(({ id, order, isActive }) =>
        prisma.contentCarouselImage.update({
          where: { id },
          data: {
            ...(order !== undefined && { order }),
            ...(isActive !== undefined && { isActive })
          }
        })
      )
    )

    console.log(`✅ Updated ${results.length} carousel images`)

    return NextResponse.json({
      success: true,
      data: results,
      message: `Updated ${results.length} carousel images`
    })

  } catch (error) {
    console.error('❌ Error updating carousel images:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update carousel images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}