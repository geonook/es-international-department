/**
 * Image Upload API Route for ES International Department
 * 圖片專用上傳 API 端點 - 專門處理圖片上傳與最佳化
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile } from '@/lib/fileUpload'

// 圖片專用設定
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES_PER_REQUEST = 5
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // 檢查認證
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 解析表單資料
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    const relatedType = formData.get('relatedType') as string | null
    const relatedId = formData.get('relatedId') as string | null
    const generateThumbnail = formData.get('generateThumbnail') !== 'false' // 預設為 true
    const compressImage = formData.get('compressImage') !== 'false' // 預設為 true
    const thumbnailSize = formData.get('thumbnailSize') as string | null

    // 驗證輸入
    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    if (images.length > MAX_IMAGES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_REQUEST} images allowed per request` },
        { status: 400 }
      )
    }

    // 驗證每個圖片檔案
    for (const image of images) {
      if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image ${image.name} exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit` },
          { status: 400 }
        )
      }

      if (!SUPPORTED_FORMATS.includes(image.type)) {
        return NextResponse.json(
          { error: `Unsupported image format: ${image.type}. Supported: ${SUPPORTED_FORMATS.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // 上傳圖片
    const results = []
    const errors = []

    for (const image of images) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer())

        const result = await uploadFile(buffer, image.name, {
          relatedType: relatedType || undefined,
          relatedId: relatedId ? parseInt(relatedId) : undefined,
          generateThumbnail,
          compressImage,
          allowedTypes: ['image']
        })

        if (result.success) {
          results.push({
            filename: image.name,
            fileId: result.fileId,
            filePath: result.filePath,
            thumbnailPath: result.thumbnailPath,
            originalName: result.originalName,
            storedName: result.storedName,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            publicUrl: `/api/files${result.filePath}`,
            thumbnailUrl: result.thumbnailPath ? `/api/files${result.thumbnailPath}` : null
          })
        } else {
          errors.push({ filename: image.name, error: result.error })
        }
      } catch (error) {
        console.error(`Error uploading image ${image.name}:`, error)
        errors.push({ filename: image.name, error: 'Upload failed' })
      }
    }

    const response = {
      success: results.length > 0,
      uploaded: results.length,
      total: images.length,
      images: results,
      errors: errors.length > 0 ? errors : undefined,
      message: results.length > 0 ? 
        `Successfully uploaded ${results.length} of ${images.length} images` :
        'No images were uploaded successfully'
    }

    // 根據結果設定狀態碼
    if (results.length === 0) {
      return NextResponse.json(response, { status: 400 })
    } else if (errors.length > 0) {
      return NextResponse.json(response, { status: 207 }) // Multi-Status
    } else {
      return NextResponse.json(response, { status: 200 })
    }

  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET 請求：獲取圖片上傳設定
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const config = {
      maxImageSize: MAX_IMAGE_SIZE,
      maxImagesPerRequest: MAX_IMAGES_PER_REQUEST,
      supportedFormats: SUPPORTED_FORMATS,
      features: {
        compression: true,
        thumbnailGeneration: true,
        formatConversion: true,
        imageOptimization: true,
        metadataExtraction: true
      },
      defaultSettings: {
        generateThumbnail: true,
        compressImage: true,
        thumbnailSize: { width: 300, height: 300 },
        compressionQuality: 85
      },
      limits: {
        maxWidth: 2048,
        maxHeight: 2048,
        minWidth: 50,
        minHeight: 50
      }
    }

    return NextResponse.json(config, { status: 200 })

  } catch (error) {
    console.error('Image upload config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE 請求：刪除圖片
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    const { deleteFile } = await import('@/lib/fileUpload')
    const success = await deleteFile(parseInt(fileId))

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Image deleted successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image or permission denied' },
        { status: 403 }
      )
    }

  } catch (error) {
    console.error('Image delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}