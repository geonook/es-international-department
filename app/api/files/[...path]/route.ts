/**
 * File Serving API Route for ES International Department
 * 檔案服務 API 端點 - 提供安全的檔案存取與權限控制
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { getCurrentUser } from '@/lib/auth'
import { getFileInfo } from '@/lib/fileUpload'

// MIME type 對應
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf'
}

// 快取設定
const CACHE_DURATION = {
  images: 31536000, // 1 年
  documents: 86400, // 1 天
  thumbnails: 31536000 // 1 年
}

interface RouteParams {
  params: {
    path: string[]
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { path } = params
    
    if (!path || path.length === 0) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      )
    }

    // 重構完整檔案路徑
    const filePath = '/' + path.join('/')
    const fullPath = join(process.cwd(), 'public', filePath)
    
    // 安全檢查：防止路徑遍歷攻擊
    const normalizedPath = join(process.cwd(), 'public')
    if (!fullPath.startsWith(normalizedPath)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // 檢查檔案是否存在
    try {
      const stats = await stat(fullPath)
      if (!stats.isFile()) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // 獲取請求參數
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'
    const inline = searchParams.get('inline') === 'true'
    const fileId = searchParams.get('fileId')

    // 權限檢查：如果提供了 fileId，檢查檔案權限
    if (fileId) {
      const currentUser = await getCurrentUser()
      const fileInfo = await getFileInfo(parseInt(fileId))
      
      if (!fileInfo) {
        return NextResponse.json(
          { error: 'File not found in database' },
          { status: 404 }
        )
      }

      // 檢查檔案存取權限
      // 目前允許所有認證使用者存取，可以根據需求調整
      if (!currentUser && fileInfo.relatedType !== 'public') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // 更新檔案統計（如果需要）
      // TODO: 可以在這裡加入下載統計
    }

    // 讀取檔案
    const fileBuffer = await readFile(fullPath)
    const ext = extname(filePath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    // 設定回應標頭
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    headers.set('Content-Length', fileBuffer.length.toString())

    // 快取設定
    const isImage = mimeType.startsWith('image/')
    const isThumbnail = path.some(p => p.startsWith('thumb_'))
    const isDocument = !isImage

    let cacheMaxAge = CACHE_DURATION.documents
    if (isImage || isThumbnail) {
      cacheMaxAge = CACHE_DURATION.images
    }

    headers.set('Cache-Control', `public, max-age=${cacheMaxAge}, immutable`)
    headers.set('ETag', `"${Buffer.from(fullPath).toString('base64')}"`)

    // 設定內容處置
    if (download) {
      const filename = path[path.length - 1]
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    } else if (inline) {
      headers.set('Content-Disposition', 'inline')
    } else {
      // 預設行為：圖片內嵌顯示，文件下載
      if (isImage) {
        headers.set('Content-Disposition', 'inline')
      } else {
        const filename = path[path.length - 1]
        headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      }
    }

    // CORS 標頭
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')

    // 檢查 If-None-Match 標頭（ETag 快取）
    const ifNoneMatch = request.headers.get('if-none-match')
    const etag = headers.get('etag')
    if (ifNoneMatch && etag && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': headers.get('Cache-Control') || '',
          'ETag': etag
        }
      })
    }

    // 返回檔案
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('File serving error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// HEAD 請求：檢查檔案是否存在（不返回檔案內容）
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const { path } = params
    
    if (!path || path.length === 0) {
      return new NextResponse(null, { status: 400 })
    }

    const filePath = '/' + path.join('/')
    const fullPath = join(process.cwd(), 'public', filePath)
    
    // 安全檢查
    const normalizedPath = join(process.cwd(), 'public')
    if (!fullPath.startsWith(normalizedPath)) {
      return new NextResponse(null, { status: 400 })
    }

    // 檢查檔案
    try {
      const stats = await stat(fullPath)
      if (!stats.isFile()) {
        return new NextResponse(null, { status: 404 })
      }

      const ext = extname(filePath).toLowerCase()
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

      const headers = new Headers()
      headers.set('Content-Type', mimeType)
      headers.set('Content-Length', stats.size.toString())
      headers.set('Last-Modified', stats.mtime.toUTCString())

      return new NextResponse(null, {
        status: 200,
        headers
      })

    } catch (error) {
      return new NextResponse(null, { status: 404 })
    }

  } catch (error) {
    console.error('File HEAD error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

// OPTIONS 請求：CORS 處理
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
      'Access-Control-Max-Age': '86400'
    }
  })
}