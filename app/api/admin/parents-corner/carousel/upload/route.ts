/**
 * Carousel Image Upload API - Admin Only
 * 輪播圖片上傳 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { requireAdminAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - 上傳輪播圖片
export async function POST(request: NextRequest) {
  try {
    console.log('📤 POST /api/admin/parents-corner/carousel/upload - 上傳輪播圖片')
    
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

    // 解析 FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // 驗證文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    console.log(`📸 Processing file: ${file.name}, size: ${file.size} bytes`)

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const fileName = `carousel-${timestamp}-${randomString}${fileExtension}`

    // 確保上傳目錄存在
    const uploadDir = path.join(process.cwd(), 'public/uploads/homepage/carousel')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log('📁 Created upload directory:', uploadDir)
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    console.log('💾 File saved to:', filePath)

    // 生成文件URL
    const fileUrl = `/uploads/homepage/carousel/${fileName}`

    console.log('✅ Upload successful:', fileUrl)

    // 獲取額外的元數據
    const title = formData.get('title') as string || ''
    const description = formData.get('description') as string || ''
    const altText = formData.get('altText') as string || 'Family learning moment'

    // 確定輪播順序
    const maxOrder = await prisma.contentCarouselImage.aggregate({
      _max: { order: true }
    })
    const nextOrder = (maxOrder._max.order || 0) + 1

    // 創建輪播圖片記錄
    const carouselImage = await prisma.contentCarouselImage.create({
      data: {
        title: title || null,
        description: description || null,
        imageUrl: fileUrl,
        altText,
        order: nextOrder,
        isActive: true,
        uploadedBy: authResult.user.id
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

    console.log('✅ Created carousel image record:', carouselImage.id)

    return NextResponse.json({
      success: true,
      data: carouselImage,
      message: 'Carousel image uploaded and created successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}