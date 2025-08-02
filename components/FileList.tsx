/**
 * File List Component for ES International Department
 * 檔案列表組件 - 顯示已上傳的檔案並提供管理功能
 */

'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Download, 
  Trash2, 
  Eye, 
  File, 
  Image, 
  FileText, 
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFileManager } from '@/hooks/useFileUpload'
import type { FileListProps, FileMetadata } from '@/lib/types/upload'

export function FileList({
  files,
  onDelete,
  onDownload,
  loading = false,
  error
}: FileListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null)
  const { deleteFile, loading: deleting } = useFileManager()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: FileMetadata) => {
    const mimeType = file.mimeType || ''
    
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <FileText className="h-5 w-5 text-blue-600" />
    }
    
    return <File className="h-5 w-5 text-gray-500" />
  }

  const getFileTypeBadge = (file: FileMetadata) => {
    const mimeType = file.mimeType || ''
    
    if (mimeType.startsWith('image/')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">圖片</Badge>
    } else if (mimeType === 'application/pdf') {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">PDF</Badge>
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">文件</Badge>
    }
    
    return <Badge variant="outline">檔案</Badge>
  }

  const handleDownload = (file: FileMetadata) => {
    // 直接下載檔案
    window.open(`/api/files${file.publicUrl}?download=true`, '_blank')
    onDownload?.(file.id)
  }

  const handleView = (file: FileMetadata) => {
    // 在新頁面中檢視檔案
    window.open(`/api/files${file.publicUrl}?inline=true`, '_blank')
  }

  const handleDeleteClick = (file: FileMetadata) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return

    try {
      const success = await deleteFile(fileToDelete.id)
      if (success) {
        onDelete?.(fileToDelete.id)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-300 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-300 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-300 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">尚未上傳任何檔案</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id} className={cn(
          'transition-all duration-200 hover:shadow-md',
          !file.fileExists && 'opacity-60 bg-red-50 border-red-200'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalFilename}
                    </p>
                    {getFileTypeBadge(file)}
                    {!file.fileExists && (
                      <Badge variant="destructive" className="text-xs">
                        檔案不存在
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{format(file.createdAt, 'yyyy-MM-dd HH:mm')}</span>
                    {file.uploader && (
                      <span>上傳者: {file.uploader.displayName || file.uploader.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* 圖片預覽 */}
                {file.mimeType?.startsWith('image/') && file.fileExists && (
                  <img
                    src={`/api/files${file.publicUrl}`}
                    alt={file.originalFilename}
                    className="h-12 w-12 object-cover rounded border"
                  />
                )}

                {/* 操作選單 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {file.fileExists && (
                      <>
                        <DropdownMenuItem onClick={() => handleView(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          檢視
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          下載
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/files${file.publicUrl}`)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          複製連結
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(file)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      刪除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除檔案</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除檔案 "{fileToDelete?.originalFilename}" 嗎？
              此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '刪除中...' : '刪除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// 簡化版檔案卡片組件
export function FileCard({ file, onDelete, onDownload }: {
  file: FileMetadata
  onDelete?: (fileId: number) => void
  onDownload?: (fileId: number) => void
}) {
  return (
    <FileList
      files={[file]}
      onDelete={onDelete}
      onDownload={onDownload}
    />
  )
}