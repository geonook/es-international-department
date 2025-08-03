/**
 * File Upload React Hook for ES International Department
 * 檔案上傳 React Hook - 簡化前端檔案上傳功能
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type {
  UseFileUploadOptions,
  UseFileUploadReturn,
  UploadResponse,
  UploadedFile,
  UploadError,
  UploadOptions
} from '@/lib/types/upload'

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const {
    maxFiles = 10,
    allowedTypes = ['image', 'document'],
    autoUpload = false,
    onProgress,
    onSuccess,
    onError
  } = options

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(async (
    files: File[],
    uploadOptions: UploadOptions = {}
  ): Promise<UploadResponse> => {
    if (files.length === 0) {
      const error = 'No files selected'
      setError(error)
      throw new Error(error)
    }

    if (files.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`
      setError(error)
      throw new Error(error)
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 準備表單資料
      const formData = new FormData()
      
      files.forEach(file => {
        formData.append('files', file)
      })

      // 添加選項
      if (uploadOptions.relatedType) {
        formData.append('relatedType', uploadOptions.relatedType)
      }
      if (uploadOptions.relatedId) {
        formData.append('relatedId', uploadOptions.relatedId.toString())
      }
      if (uploadOptions.generateThumbnail !== undefined) {
        formData.append('generateThumbnail', uploadOptions.generateThumbnail.toString())
      }
      if (uploadOptions.compressImage !== undefined) {
        formData.append('compressImage', uploadOptions.compressImage.toString())
      }
      if (uploadOptions.allowedTypes) {
        formData.append('allowedTypes', uploadOptions.allowedTypes.join(','))
      }

      // 執行上傳
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result: UploadResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.error || 'Upload failed')
      }

      setProgress(100)
      
      // 呼叫成功回調
      if (result.results && onSuccess) {
        onSuccess(result.results)
      }

      // 顯示成功訊息
      if (result.success) {
        toast.success(`Successfully uploaded ${result.uploaded} of ${result.total} files`)
      }

      // 如果有錯誤，顯示警告
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map(e => `${e.filename}: ${e.error}`).join('\n')
        toast.warning(`Some files failed to upload:\n${errorMessages}`)
        
        if (onError) {
          onError(result.errors)
        }
      }

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      toast.error(`Upload failed: ${errorMessage}`)
      
      if (onError) {
        onError([{ filename: 'Unknown', error: errorMessage }])
      }

      throw err
    } finally {
      setUploading(false)
    }
  }, [maxFiles, onProgress, onSuccess, onError])

  return {
    upload,
    uploading,
    progress,
    error,
    reset
  }
}

// 圖片專用上傳 Hook
export function useImageUpload(options: UseFileUploadOptions = {}) {
  const baseOptions = {
    ...options,
    allowedTypes: ['image'] as const
  }

  const { upload: baseUpload, ...rest } = useFileUpload(baseOptions)

  const uploadImages = useCallback(async (
    images: File[],
    uploadOptions: Omit<UploadOptions, 'allowedTypes'> = {}
  ) => {
    // 驗證所有檔案都是圖片
    const invalidFiles = images.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      const error = `Invalid image files: ${invalidFiles.map(f => f.name).join(', ')}`
      throw new Error(error)
    }

    // 使用圖片專用端點
    const formData = new FormData()
    images.forEach(image => {
      formData.append('images', image)
    })

    // 添加選項
    if (uploadOptions.relatedType) {
      formData.append('relatedType', uploadOptions.relatedType)
    }
    if (uploadOptions.relatedId) {
      formData.append('relatedId', uploadOptions.relatedId.toString())
    }
    if (uploadOptions.generateThumbnail !== undefined) {
      formData.append('generateThumbnail', uploadOptions.generateThumbnail.toString())
    }
    if (uploadOptions.compressImage !== undefined) {
      formData.append('compressImage', uploadOptions.compressImage.toString())
    }

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    })

    const result: UploadResponse = await response.json()

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.error || 'Image upload failed')
    }

    return result
  }, [])

  return {
    ...rest,
    upload: baseUpload,
    uploadImages
  }
}

// 檔案管理 Hook
export function useFileManager() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteFile = useCallback(async (fileId: number): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/upload/images?fileId=${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed')
      }

      toast.success('File deleted successfully')
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      toast.error(`Delete failed: ${errorMessage}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getFileInfo = useCallback(async (fileId: number) => {
    setLoading(true)
    setError(null)

    try {
      // Use API endpoint instead of direct import
      const response = await fetch(`/api/files/info/${fileId}`)
      if (!response.ok) {
        throw new Error('File not found')
      }
      
      const fileInfo = await response.json()
      return fileInfo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file info'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUploadConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/upload')
      if (!response.ok) {
        throw new Error('Failed to get upload config')
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get config'
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    deleteFile,
    getFileInfo,
    getUploadConfig,
    loading,
    error
  }
}