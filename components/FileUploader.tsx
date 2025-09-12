/**
 * File Uploader Component for KCISLK ESID Info Hub
 * File upload component - supports drag and drop upload with progress display
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { FileUploaderProps, UploadedFile, UploadError } from '@/lib/types/upload'

export function FileUploader({
  accept = '*/*',
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image', 'document'],
  onUpload,
  onError,
  disabled = false,
  className,
  children
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, uploading, progress, error, reset } = useFileUpload({
    maxFiles,
    allowedTypes,
    onSuccess: (results) => {
      setSelectedFiles([])
      onUpload?.(results)
    },
    onError: (errors) => {
      onError?.(errors)
    }
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [disabled, uploading])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return

    // Validate file count
    if (files.length > maxFiles) {
      onError?.([{ filename: 'Multiple files', error: `最多只能選擇 ${maxFiles} 個檔案` }])
      return
    }

    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      onError?.(oversizedFiles.map(file => ({
        filename: file.name,
        error: `檔案過大 (${(file.size / 1024 / 1024).toFixed(1)}MB，限制 ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
      })))
      return
    }

    setSelectedFiles(files)
  }, [maxFiles, maxSize, onError])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return

    try {
      await upload(selectedFiles)
    } catch (err) {
      // Error handling is done in the hook
    }
  }, [selectedFiles, upload])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Drag and drop area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          uploading && 'pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && !uploading ? openFileDialog : undefined}
      >
        {children || (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              拖放檔案到此處或點擊選擇檔案
            </p>
            <p className="text-sm text-gray-500">
              支援 {allowedTypes.map(type => type === 'image' ? '圖片' : '文件').join('、')} 格式，單檔最大 {formatFileSize(maxSize)}，最多 {maxFiles} 個檔案
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Upload progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleUpload}
              disabled={disabled || uploading || selectedFiles.length === 0}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([])
                reset()
              }}
              disabled={uploading}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Image-specific upload component
export function ImageUploader({
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  onUpload,
  onError,
  ...props
}: Omit<FileUploaderProps, 'allowedTypes' | 'accept'>) {
  return (
    <FileUploader
      accept="image/*"
      allowedTypes={['image']}
      maxFiles={maxFiles}
      maxSize={maxSize}
      onUpload={onUpload}
      onError={onError}
      {...props}
    >
      <div className="text-center">
        <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop images here or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports JPG, PNG, GIF, WebP formats, maximum {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
    </FileUploader>
  )
}

// Document-specific upload component
export function DocumentUploader({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  onError,
  ...props
}: Omit<FileUploaderProps, 'allowedTypes' | 'accept'>) {
  return (
    <FileUploader
      accept=".pdf,.doc,.docx,.txt,.rtf"
      allowedTypes={['document']}
      maxFiles={maxFiles}
      maxSize={maxSize}
      onUpload={onUpload}
      onError={onError}
      {...props}
    >
      <div className="text-center">
        <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop documents here or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, DOC, DOCX, TXT, RTF formats, maximum {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
    </FileUploader>
  )
}