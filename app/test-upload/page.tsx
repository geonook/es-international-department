/**
 * File Upload Test Page for KCISLK ESID Info Hub
 * 檔案上傳測試頁面 - 測試和展示檔案上傳功能
 */

'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileUploader, ImageUploader, DocumentUploader } from '@/components/FileUploader'
import { FileList } from '@/components/FileList'
import type { UploadedFile, UploadError, FileMetadata } from '@/lib/types/upload'

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<UploadError[]>([])

  const handleUploadSuccess = (results: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...results])
    console.log('Upload successful:', results)
  }

  const handleUploadError = (uploadErrors: UploadError[]) => {
    setErrors(uploadErrors)
    console.error('Upload errors:', uploadErrors)
  }

  const handleFileDelete = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.fileId !== fileId))
  }

  const handleFileDownload = (fileId: number) => {
    console.log('Downloading file:', fileId)
  }

  // 轉換 UploadedFile 為 FileMetadata 格式
  const convertToFileMetadata = (files: UploadedFile[]): FileMetadata[] => {
    return files.map(file => ({
      id: file.fileId,
      originalFilename: file.originalName,
      storedFilename: file.storedName,
      filePath: file.filePath,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      uploadedBy: null,
      relatedType: null,
      relatedId: null,
      createdAt: new Date(),
      fileExists: true,
      publicUrl: file.filePath
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            檔案上傳系統測試
          </h1>
          <p className="text-gray-600">
            測試檔案上傳功能，包括圖片和文件上傳，以及安全驗證機制。
          </p>
        </div>

        {/* 錯誤顯示 */}
        {errors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">上傳錯誤</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Badge variant="destructive">{error.filename}</Badge>
                    <span className="text-sm text-red-700">{error.error}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">通用上傳</TabsTrigger>
            <TabsTrigger value="images">圖片上傳</TabsTrigger>
            <TabsTrigger value="documents">文件上傳</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通用檔案上傳</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  allowedTypes={['image', 'document']}
                  onUpload={handleUploadSuccess}
                  onError={handleUploadError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>圖片專用上傳</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024} // 5MB
                  onUpload={handleUploadSuccess}
                  onError={handleUploadError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>文件專用上傳</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploader
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  onUpload={handleUploadSuccess}
                  onError={handleUploadError}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 上傳結果 */}
        {uploadedFiles.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>已上傳的檔案 ({uploadedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <FileList
                files={convertToFileMetadata(uploadedFiles)}
                onDelete={handleFileDelete}
                onDownload={handleFileDownload}
              />
            </CardContent>
          </Card>
        )}

        {/* 系統資訊 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>系統設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">圖片檔案</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 支援格式: JPG, PNG, GIF, WebP</li>
                  <li>• 最大大小: 5MB</li>
                  <li>• 自動壓縮最佳化</li>
                  <li>• 自動產生縮略圖</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">文件檔案</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 支援格式: PDF, DOC, DOCX, TXT, RTF</li>
                  <li>• 最大大小: 10MB</li>
                  <li>• 惡意檔案檢測</li>
                  <li>• 檔名安全化處理</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">安全特性</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                <Badge variant="secondary">MIME 類型驗證</Badge>
                <Badge variant="secondary">檔案簽章驗證</Badge>
                <Badge variant="secondary">惡意模式檢測</Badge>
                <Badge variant="secondary">檔名安全化</Badge>
                <Badge variant="secondary">路徑遍歷防護</Badge>
                <Badge variant="secondary">大小限制強制</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}