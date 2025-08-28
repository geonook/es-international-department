/**
 * File Upload Test Page for KCISLK ESID Info Hub
 * File upload testing page - Test and demonstrate file upload functionality
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

  // Convert UploadedFile to FileMetadata format
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
            File Upload System Test
          </h1>
          <p className="text-gray-600">
            Test file upload functionality, including image and document upload, as well as security validation mechanisms.
          </p>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Upload Errors</CardTitle>
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
            <TabsTrigger value="general">General Upload</TabsTrigger>
            <TabsTrigger value="images">Image Upload</TabsTrigger>
            <TabsTrigger value="documents">Document Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General File Upload</CardTitle>
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
                <CardTitle>Image-Specific Upload</CardTitle>
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
                <CardTitle>Document-Specific Upload</CardTitle>
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

        {/* Upload Results */}
        {uploadedFiles.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
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

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image Files</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>• Maximum size: 5MB</li>
                  <li>• Automatic compression optimization</li>
                  <li>• Automatic thumbnail generation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Document Files</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supported formats: PDF, DOC, DOCX, TXT, RTF</li>
                  <li>• Maximum size: 10MB</li>
                  <li>• Malicious file detection</li>
                  <li>• Filename sanitization processing</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Security Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                <Badge variant="secondary">MIME Type Validation</Badge>
                <Badge variant="secondary">File Signature Verification</Badge>
                <Badge variant="secondary">Malicious Pattern Detection</Badge>
                <Badge variant="secondary">Filename Sanitization</Badge>
                <Badge variant="secondary">Path Traversal Protection</Badge>
                <Badge variant="secondary">Size Limit Enforcement</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}