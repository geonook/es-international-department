/**
 * File Upload Utilities for KCISLK ESID Info Hub
 * 檔案上傳工具函式 - 安全檔案處理與驗證
 */

import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname, basename } from 'path'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// File type configurations
export const FILE_TYPES = {
  IMAGES: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    directory: 'images'
  },
  DOCUMENTS: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    directory: 'documents'
  }
} as const

// Upload configuration
const UPLOAD_BASE_DIR = join(process.cwd(), 'public', 'uploads')
const THUMBNAIL_SIZE = { width: 300, height: 300 }
const COMPRESSION_QUALITY = 85

// Security patterns for malicious files
const MALICIOUS_PATTERNS = [
  /\.exe$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.scr$/i,
  /\.pif$/i,
  /\.jar$/i,
  /\.js$/i,
  /\.vbs$/i,
  /\.com$/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /vbscript:/gi
]

export interface UploadResult {
  success: boolean
  fileId?: number
  filePath?: string
  thumbnailPath?: string
  originalName?: string
  storedName?: string
  fileSize?: number
  mimeType?: string
  error?: string
}

export interface FileValidationResult {
  isValid: boolean
  fileType: 'image' | 'document' | 'unknown'
  error?: string
  detectedMimeType?: string
}

export interface UploadOptions {
  relatedType?: string
  relatedId?: number
  generateThumbnail?: boolean
  compressImage?: boolean
  allowedTypes?: ('image' | 'document')[]
}

/**
 * 產生安全的檔案名稱
 */
export function generateSecureFilename(originalName: string): string {
  const ext = extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const uuid = crypto.randomUUID()
  
  // 清理檔案名稱，移除特殊字符
  const baseName = basename(originalName, ext)
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 100) // 限制長度
  
  return `${timestamp}_${uuid}_${baseName}${ext}`
}

/**
 * 驗證檔案類型和安全性
 */
export async function validateFile(
  buffer: Buffer,
  originalName: string,
  allowedTypes: ('image' | 'document')[] = ['image', 'document']
): Promise<FileValidationResult> {
  try {
    // 檢查檔案大小
    if (buffer.length === 0) {
      return { isValid: false, fileType: 'unknown', error: 'Empty file' }
    }

    // 使用 magic bytes 檢測真實的檔案類型
    const detectedType = await fileTypeFromBuffer(buffer)
    const extension = extname(originalName).toLowerCase().slice(1)

    // 檢查惡意檔案模式
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(originalName) || (buffer.toString().match(pattern))) {
        return { isValid: false, fileType: 'unknown', error: 'Potentially malicious file detected' }
      }
    }

    let fileType: 'image' | 'document' | 'unknown' = 'unknown'
    let isValid = false

    // 驗證圖片檔案
    if (allowedTypes.includes('image')) {
      const imageConfig = FILE_TYPES.IMAGES
      if (imageConfig.extensions.includes(extension) && 
          detectedType && imageConfig.mimeTypes.includes(detectedType.mime)) {
        if (buffer.length <= imageConfig.maxSize) {
          fileType = 'image'
          isValid = true
        } else {
          return { isValid: false, fileType: 'image', error: `Image file too large. Maximum size: ${imageConfig.maxSize / 1024 / 1024}MB` }
        }
      }
    }

    // 驗證文件檔案
    if (!isValid && allowedTypes.includes('document')) {
      const docConfig = FILE_TYPES.DOCUMENTS
      if (docConfig.extensions.includes(extension) && 
          detectedType && docConfig.mimeTypes.includes(detectedType.mime)) {
        if (buffer.length <= docConfig.maxSize) {
          fileType = 'document'
          isValid = true
        } else {
          return { isValid: false, fileType: 'document', error: `Document file too large. Maximum size: ${docConfig.maxSize / 1024 / 1024}MB` }
        }
      }
    }

    if (!isValid) {
      return { 
        isValid: false, 
        fileType: 'unknown', 
        error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`,
        detectedMimeType: detectedType?.mime 
      }
    }

    return {
      isValid: true,
      fileType,
      detectedMimeType: detectedType?.mime
    }
  } catch (error) {
    console.error('File validation error:', error)
    return { isValid: false, fileType: 'unknown', error: 'File validation failed' }
  }
}

/**
 * 建立目錄結構
 */
async function ensureUploadDirectory(subDir: string): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  const dirPath = join(UPLOAD_BASE_DIR, subDir, String(year), month, day)
  
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
  
  return dirPath
}

/**
 * 壓縮和最佳化圖片
 */
async function optimizeImage(buffer: Buffer, filePath: string): Promise<Buffer> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // 如果圖片太大，調整大小
    let processedImage = image
    if (metadata.width && metadata.width > 2048) {
      processedImage = processedImage.resize(2048, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
    }
    
    // 根據格式進行最佳化
    if (filePath.toLowerCase().endsWith('.png')) {
      return await processedImage
        .png({ quality: COMPRESSION_QUALITY, progressive: true })
        .toBuffer()
    } else if (filePath.toLowerCase().endsWith('.webp')) {
      return await processedImage
        .webp({ quality: COMPRESSION_QUALITY })
        .toBuffer()
    } else {
      // JPEG 格式
      return await processedImage
        .jpeg({ quality: COMPRESSION_QUALITY, progressive: true })
        .toBuffer()
    }
  } catch (error) {
    console.error('Image optimization error:', error)
    return buffer // 返回原始檔案
  }
}

/**
 * 產生縮略圖
 */
async function generateThumbnail(buffer: Buffer, originalPath: string): Promise<string | null> {
  try {
    const thumbnailFilename = 'thumb_' + basename(originalPath)
    const thumbnailPath = join(dirname(originalPath), thumbnailFilename)
    
    const thumbnailBuffer = await sharp(buffer)
      .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()
    
    await writeFile(thumbnailPath, thumbnailBuffer)
    
    // 返回相對於 public 的路徑
    return thumbnailPath.replace(join(process.cwd(), 'public'), '')
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return null
  }
}

/**
 * 儲存檔案到資料庫
 */
async function saveFileToDatabase(
  originalName: string,
  storedName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  userId: string,
  relatedType?: string,
  relatedId?: number
): Promise<number> {
  try {
    const fileRecord = await prisma.fileUpload.create({
      data: {
        originalFilename: originalName,
        storedFilename: storedName,
        filePath: filePath.replace(join(process.cwd(), 'public'), ''), // 相對路徑
        fileSize: BigInt(fileSize),
        mimeType,
        uploadedBy: userId,
        relatedType,
        relatedId
      }
    })
    
    return fileRecord.id
  } catch (error) {
    console.error('Database save error:', error)
    throw new Error('Failed to save file record to database')
  }
}

/**
 * 主要檔案上傳函式
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // 獲取當前使用者
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: 'Authentication required' }
    }

    // 驗證檔案
    const validation = await validateFile(buffer, originalName, options.allowedTypes)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // 產生安全檔案名稱
    const secureFilename = generateSecureFilename(originalName)
    const fileType = validation.fileType as 'image' | 'document'
    
    // 建立目錄
    const fileTypeKey = fileType === 'image' ? 'IMAGES' : 'DOCUMENTS'
    const uploadDir = await ensureUploadDirectory(FILE_TYPES[fileTypeKey as keyof typeof FILE_TYPES].directory)
    const filePath = join(uploadDir, secureFilename)
    
    // 處理圖片最佳化
    let finalBuffer = buffer
    if (fileType === 'image' && options.compressImage !== false) {
      finalBuffer = await optimizeImage(buffer, filePath)
    }
    
    // 寫入檔案
    await writeFile(filePath, finalBuffer)
    
    // 產生縮略圖
    let thumbnailPath: string | null = null
    if (fileType === 'image' && options.generateThumbnail !== false) {
      thumbnailPath = await generateThumbnail(finalBuffer, filePath)
    }
    
    // 儲存到資料庫
    const fileId = await saveFileToDatabase(
      originalName,
      secureFilename,
      filePath,
      finalBuffer.length,
      validation.detectedMimeType || 'application/octet-stream',
      currentUser.id,
      options.relatedType,
      options.relatedId
    )
    
    return {
      success: true,
      fileId,
      filePath: filePath.replace(join(process.cwd(), 'public'), ''),
      thumbnailPath,
      originalName,
      storedName: secureFilename,
      fileSize: finalBuffer.length,
      mimeType: validation.detectedMimeType
    }
    
  } catch (error) {
    console.error('File upload error:', error)
    return { success: false, error: 'File upload failed' }
  }
}

/**
 * 刪除檔案
 */
export async function deleteFile(fileId: number): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return false
    }

    // 獲取檔案記錄
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id: fileId }
    })

    if (!fileRecord) {
      return false
    }

    // 檢查權限（只有上傳者或管理員可以刪除）
    if (fileRecord.uploadedBy !== currentUser.id && !currentUser.roles.includes('admin')) {
      return false
    }

    // 刪除實體檔案
    const fullPath = join(process.cwd(), 'public', fileRecord.filePath)
    try {
      await unlink(fullPath)
      
      // 刪除縮略圖
      const thumbnailPath = join(dirname(fullPath), 'thumb_' + basename(fullPath))
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath)
      }
    } catch (error) {
      console.error('Error deleting physical file:', error)
    }

    // 刪除資料庫記錄
    await prisma.fileUpload.delete({
      where: { id: fileId }
    })

    return true
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
}

/**
 * 獲取檔案資訊
 */
export async function getFileInfo(fileId: number) {
  try {
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })

    if (!fileRecord) {
      return null
    }

    // 檢查檔案是否存在
    const fullPath = join(process.cwd(), 'public', fileRecord.filePath)
    const fileExists = existsSync(fullPath)

    return {
      ...fileRecord,
      fileSize: Number(fileRecord.fileSize),
      fileExists,
      publicUrl: fileRecord.filePath
    }
  } catch (error) {
    console.error('Error getting file info:', error)
    return null
  }
}

/**
 * 清理暫存檔案
 */
export async function cleanupTempFiles(): Promise<void> {
  try {
    const tempDir = join(UPLOAD_BASE_DIR, 'temp')
    if (!existsSync(tempDir)) {
      return
    }

    const files = await readdir(tempDir)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小時

    for (const file of files) {
      const filePath = join(tempDir, file)
      const stats = await stat(filePath)
      
      if (now - stats.mtime.getTime() > maxAge) {
        await unlink(filePath)
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error)
  }
}

// Helper function imports
import { readdir } from 'fs/promises'
import { dirname } from 'path'