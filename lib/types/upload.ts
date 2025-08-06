/**
 * File Upload Type Definitions for KCISLK ESID Info Hub
 * 檔案上傳系統型別定義
 */

export interface FileUploadConfig {
  maxFilesPerRequest: number
  maxRequestSize: number
  supportedTypes: {
    images: FileTypeConfig
    documents: FileTypeConfig
  }
  securityFeatures: string[]
}

export interface FileTypeConfig {
  extensions: string[]
  maxSize: number
  compressionEnabled: boolean
  thumbnailGeneration: boolean
}

export interface UploadResponse {
  success: boolean
  uploaded: number
  total: number
  results?: UploadedFile[]
  images?: UploadedFile[]
  errors?: UploadError[]
  message?: string
}

export interface UploadedFile {
  filename: string
  fileId: number
  filePath: string
  thumbnailPath?: string | null
  originalName: string
  storedName: string
  fileSize: number
  mimeType: string
  publicUrl?: string
  thumbnailUrl?: string | null
}

export interface UploadError {
  filename: string
  error: string
}

export interface FileMetadata {
  id: number
  originalFilename: string
  storedFilename: string
  filePath: string
  fileSize: number
  mimeType: string | null
  uploadedBy: string | null
  relatedType: string | null
  relatedId: number | null
  createdAt: Date
  uploader?: {
    id: string
    displayName: string | null
    email: string
  }
  fileExists: boolean
  publicUrl: string
}

export interface ImageUploadConfig {
  maxImageSize: number
  maxImagesPerRequest: number
  supportedFormats: string[]
  features: {
    compression: boolean
    thumbnailGeneration: boolean
    formatConversion: boolean
    imageOptimization: boolean
    metadataExtraction: boolean
  }
  defaultSettings: {
    generateThumbnail: boolean
    compressImage: boolean
    thumbnailSize: { width: number; height: number }
    compressionQuality: number
  }
  limits: {
    maxWidth: number
    maxHeight: number
    minWidth: number
    minHeight: number
  }
}

export interface FileValidation {
  isValid: boolean
  fileType: 'image' | 'document' | 'unknown'
  error?: string
  detectedMimeType?: string
}

export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ImageOptimizationOptions {
  quality?: number
  progressive?: boolean
  strip?: boolean
  resize?: {
    width?: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  }
}

export interface FileSecurityCheck {
  hasMaliciousPatterns: boolean
  validMimeType: boolean
  validFileSignature: boolean
  safePath: boolean
  withinSizeLimit: boolean
  allowedExtension: boolean
}

export interface FileCleanupResult {
  deletedFiles: number
  freedSpace: number
  errors: string[]
}

export interface FileStats {
  totalFiles: number
  totalSize: number
  byType: {
    images: { count: number; size: number }
    documents: { count: number; size: number }
  }
  byUser: Array<{
    userId: string
    displayName: string
    fileCount: number
    totalSize: number
  }>
  recentUploads: Array<{
    id: number
    originalFilename: string
    uploadedBy: string
    createdAt: Date
  }>
}

// Prisma model types extension
export interface FileUploadWithRelations {
  id: number
  originalFilename: string
  storedFilename: string
  filePath: string
  fileSize: bigint
  mimeType: string | null
  uploadedBy: string | null
  relatedType: string | null
  relatedId: number | null
  createdAt: Date
  uploader?: {
    id: string
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  } | null
}

// API endpoint interfaces
export interface UploadAPIRequest {
  files: File[]
  relatedType?: string
  relatedId?: number
  generateThumbnail?: boolean
  compressImage?: boolean
  allowedTypes?: ('image' | 'document')[]
}

export interface ImageUploadAPIRequest {
  images: File[]
  relatedType?: string
  relatedId?: number
  generateThumbnail?: boolean
  compressImage?: boolean
  thumbnailSize?: string
}

export interface FileServingQuery {
  download?: boolean
  inline?: boolean
  fileId?: number
}

// Error types
export type UploadErrorType = 
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_FILES'
  | 'MALICIOUS_FILE'
  | 'UPLOAD_FAILED'
  | 'VALIDATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'FILE_NOT_FOUND'
  | 'INTERNAL_ERROR'

export interface DetailedUploadError {
  type: UploadErrorType
  message: string
  filename?: string
  details?: Record<string, any>
}

// Hook types for React components
export interface UseFileUploadOptions {
  maxFiles?: number
  allowedTypes?: ('image' | 'document')[]
  autoUpload?: boolean
  onProgress?: (progress: number) => void
  onSuccess?: (results: UploadedFile[]) => void
  onError?: (errors: UploadError[]) => void
}

export interface UseFileUploadReturn {
  upload: (files: File[], options?: UploadOptions) => Promise<UploadResponse>
  uploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

// Component prop types
export interface FileUploaderProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  allowedTypes?: ('image' | 'document')[]
  onUpload?: (results: UploadedFile[]) => void
  onError?: (errors: UploadError[]) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export interface FilePreviewProps {
  file: File | UploadedFile
  onRemove?: () => void
  showProgress?: boolean
  progress?: number
  error?: string
}

export interface FileListProps {
  files: FileMetadata[]
  onDelete?: (fileId: number) => void
  onDownload?: (fileId: number) => void
  loading?: boolean
  error?: string
}

// Re-export from fileUpload.ts for convenience
export type { UploadResult, UploadOptions } from '@/lib/fileUpload'