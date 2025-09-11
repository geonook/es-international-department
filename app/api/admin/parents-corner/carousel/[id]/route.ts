/**
 * Single Content Carousel Image API - Admin Only
 * 單個內容輪播圖片 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// GET - 獲取單個輪播圖片
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎠 GET /api/admin/parents-corner/carousel/${params.id} - 獲取單個輪播圖片`)
    
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

    const carouselId = parseInt(params.id)
    if (isNaN(carouselId)) {
      return NextResponse.json(
        { error: 'Invalid carousel image ID' },
        { status: 400 }
      )
    }

    // 獲取輪播圖片
    const carouselImage = await prisma.contentCarouselImage.findUnique({
      where: { id: carouselId },
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

    if (!carouselImage) {
      return NextResponse.json(
        { error: 'Carousel image not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found carousel image:', carouselImage.id)

    return NextResponse.json({
      success: true,
      data: carouselImage
    })

  } catch (error) {
    console.error('❌ Error fetching carousel image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch carousel image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - 更新輪播圖片
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎠 PUT /api/admin/parents-corner/carousel/${params.id} - 更新輪播圖片`)
    
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

    const carouselId = parseInt(params.id)
    if (isNaN(carouselId)) {
      return NextResponse.json(
        { error: 'Invalid carousel image ID' },
        { status: 400 }
      )
    }

    // 解析請求內容
    const body = await request.json()
    const { title, description, imageUrl, altText, order, isActive } = body

    // 檢查輪播圖片是否存在
    const existingImage = await prisma.contentCarouselImage.findUnique({
      where: { id: carouselId }
    })

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Carousel image not found' },
        { status: 404 }
      )
    }

    // 準備更新數據
    const updateData: any = {}
    if (title !== undefined) updateData.title = title || null
    if (description !== undefined) updateData.description = description || null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (altText !== undefined) updateData.altText = altText
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    // 更新輪播圖片
    const updatedImage = await prisma.contentCarouselImage.update({
      where: { id: carouselId },
      data: updateData,
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

    console.log('✅ Updated carousel image:', updatedImage.id)

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: 'Carousel image updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating carousel image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update carousel image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - 刪除輪播圖片
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎠 DELETE /api/admin/parents-corner/carousel/${params.id} - 刪除輪播圖片`)
    
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

    const carouselId = parseInt(params.id)
    if (isNaN(carouselId)) {
      return NextResponse.json(
        { error: 'Invalid carousel image ID' },
        { status: 400 }
      )
    }

    // 檢查輪播圖片是否存在
    const existingImage = await prisma.contentCarouselImage.findUnique({
      where: { id: carouselId }
    })

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Carousel image not found' },
        { status: 404 }
      )
    }

    // 刪除輪播圖片
    await prisma.contentCarouselImage.delete({
      where: { id: carouselId }
    })

    console.log('✅ Deleted carousel image:', carouselId)

    return NextResponse.json({
      success: true,
      message: 'Carousel image deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting carousel image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete carousel image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}