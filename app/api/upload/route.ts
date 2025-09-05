/**
 * File Upload API Route for KCISLK ESID Info Hub
 * 檔案上傳 API 端點 - 支援多檔案上傳與安全驗證
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile, UploadOptions } from '@/lib/fileUpload'

export const dynamic = 'force-dynamic'

// API 設定
const MAX_FILES_PER_REQUEST = 10
const MAX_REQUEST_SIZE = 50 * 1024 * 1024 // 50MB

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

    // 檢查內容類型
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      )
    }

    // 解析表單資料
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const relatedType = formData.get('relatedType') as string | null
    const relatedId = formData.get('relatedId') as string | null
    const generateThumbnail = formData.get('generateThumbnail') === 'true'
    const compressImage = formData.get('compressImage') !== 'false'
    const allowedTypesParam = formData.get('allowedTypes') as string | null

    // 驗證檔案數量
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request` },
        { status: 400 }
      )
    }

    // 檢查總檔案大小
    let totalSize = 0
    for (const file of files) {
      totalSize += file.size
    }

    if (totalSize > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: `Total file size exceeds ${MAX_REQUEST_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // 解析允許的檔案類型
    let allowedTypes: ('image' | 'document')[] = ['image', 'document']
    if (allowedTypesParam) {
      const parsed = allowedTypesParam.split(',').map(t => t.trim()) as ('image' | 'document')[]
      if (parsed.every(t => ['image', 'document'].includes(t))) {
        allowedTypes = parsed
      }
    }

    // 設定上傳選項
    const uploadOptions: UploadOptions = {
      relatedType: relatedType || undefined,
      relatedId: relatedId ? parseInt(relatedId) : undefined,
      generateThumbnail,
      compressImage,
      allowedTypes
    }

    // 上傳檔案
    const results = []
    const errors = []

    for (const file of files) {
      try {
        // 驗證檔案
        if (file.size === 0) {
          errors.push({ filename: file.name, error: 'Empty file' })
          continue
        }

        // 轉換為 Buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // 上傳檔案
        const result = await uploadFile(buffer, file.name, uploadOptions)

        if (result.success) {
          results.push({
            filename: file.name,
            fileId: result.fileId,
            filePath: result.filePath,
            thumbnailPath: result.thumbnailPath,
            originalName: result.originalName,
            storedName: result.storedName,
            fileSize: result.fileSize,
            mimeType: result.mimeType
          })
        } else {
          errors.push({ filename: file.name, error: result.error })
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error)
        errors.push({ filename: file.name, error: 'Upload failed' })
      }
    }

    // 準備回應
    const response = {
      success: results.length > 0,
      uploaded: results.length,
      total: files.length,
      results,
      errors: errors.length > 0 ? errors : undefined
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
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 處理 OPTIONS 請求（CORS）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// GET 請求：獲取上傳設定和限制
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
      maxFilesPerRequest: MAX_FILES_PER_REQUEST,
      maxRequestSize: MAX_REQUEST_SIZE,
      supportedTypes: {
        images: {
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          maxSize: 5 * 1024 * 1024, // 5MB
          compressionEnabled: true,
          thumbnailGeneration: true
        },
        documents: {
          extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
          maxSize: 10 * 1024 * 1024, // 10MB
          compressionEnabled: false,
          thumbnailGeneration: false
        }
      },
      securityFeatures: [
        'MIME type validation',
        'File signature verification', 
        'Malicious pattern detection',
        'Filename sanitization',
        'Path traversal protection',
        'Size limit enforcement'
      ]
    }

    return NextResponse.json(config, { status: 200 })

  } catch (error) {
    console.error('Upload config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}