'use client'

/**
 * Resource Form Component - KCISLK ESID Info Hub
 * 資源表單組件 - KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  X,
  Upload,
  Link,
  Save,
  Eye,
  AlertTriangle,
  FileText,
  Play,
  Image,
  Globe,
  BookOpen,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Resource {
  id: number
  title: string
  description?: string
  resourceType: string
  fileUrl?: string
  externalUrl?: string
  thumbnailUrl?: string
  fileSize?: number
  duration?: number
  gradeLevelId?: number
  categoryId?: number
  createdBy?: string
  downloadCount: number
  viewCount: number
  isFeatured: boolean
  status: string
  createdAt: string
  updatedAt: string
  gradeLevel?: {
    id: number
    name: string
    displayName: string
  }
  category?: {
    id: number
    name: string
    displayName: string
    icon?: string
    color?: string
  }
  creator?: {
    id: string
    displayName?: string
    email: string
  }
  tags: string[]
}

interface ResourceFormData {
  title: string
  description: string
  resourceType: string
  fileUrl: string
  externalUrl: string
  thumbnailUrl: string
  gradeLevelId?: number
  categoryId?: number
  tags: string[]
  isFeatured: boolean
  status: string
}

interface ResourceFormProps {
  resource?: Resource
  categories: any[]
  gradeLevels: any[]
  onSubmit: (data: ResourceFormData) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string
  mode: 'create' | 'edit'
}

export default function ResourceForm({
  resource,
  categories,
  gradeLevels,
  onSubmit,
  onCancel,
  loading,
  error,
  mode
}: ResourceFormProps) {
  // Form state
  const [formData, setFormData] = useState<ResourceFormData>({
    title: resource?.title || '',
    description: resource?.description || '',
    resourceType: resource?.resourceType || 'PDF',
    fileUrl: resource?.fileUrl || '',
    externalUrl: resource?.externalUrl || '',
    thumbnailUrl: resource?.thumbnailUrl || '',
    gradeLevelId: resource?.gradeLevelId,
    categoryId: resource?.categoryId,
    tags: resource?.tags || [],
    isFeatured: resource?.isFeatured || false,
    status: resource?.status || 'draft'
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadLoading, setUploadLoading] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Update form data
  const updateFormData = (key: keyof ResourceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '標題為必填欄位'
    }

    if (!formData.resourceType) {
      newErrors.resourceType = '請選擇資源類型'
    }

    // Validate based on resource type
    if (formData.resourceType === 'External Platform' && !formData.externalUrl.trim()) {
      newErrors.externalUrl = '外部連結為必填欄位'
    } else if (formData.resourceType !== 'External Platform' && !formData.fileUrl.trim()) {
      newErrors.fileUrl = '請上傳檔案或提供檔案連結'
    }

    // Validate URL format
    if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
      newErrors.externalUrl = '請輸入有效的 URL'
    }

    if (formData.fileUrl && !isValidUrl(formData.fileUrl)) {
      newErrors.fileUrl = '請輸入有效的檔案 URL'
    }

    if (formData.thumbnailUrl && !isValidUrl(formData.thumbnailUrl)) {
      newErrors.thumbnailUrl = '請輸入有效的縮略圖 URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('relatedType', 'resource')
      formData.append('generateThumbnail', 'true')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.results.length > 0) {
        const uploadedFile = result.results[0]
        updateFormData('fileUrl', uploadedFile.filePath)
        
        // Set thumbnail if generated
        if (uploadedFile.thumbnailPath) {
          updateFormData('thumbnailUrl', uploadedFile.thumbnailPath)
        }
      } else {
        throw new Error(result.errors?.[0]?.error || 'Upload failed')
      }
    } catch (error) {
      console.error('File upload error:', error)
      setErrors(prev => ({ 
        ...prev, 
        fileUrl: error instanceof Error ? error.message : 'Upload failed' 
      }))
    } finally {
      setUploadLoading(false)
    }
  }

  // Handle tag operations
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      // Error is handled by parent component
    }
  }

  // Get resource type icon
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
      case 'Document':
        return FileText
      case 'Video':
        return Play
      case 'Image':
        return Image
      case 'External Platform':
        return Globe
      case 'Interactive':
        return BookOpen
      default:
        return FileText
    }
  }

  const TypeIcon = getResourceTypeIcon(formData.resourceType)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {mode === 'create' ? '新增資源' : '編輯資源'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="content">內容設定</TabsTrigger>
              <TabsTrigger value="advanced">進階設定</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">標題 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="輸入資源標題"
                  className={cn(errors.title && "border-red-500")}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="輸入資源描述"
                  rows={4}
                />
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <Label>資源類型 *</Label>
                <Select
                  value={formData.resourceType}
                  onValueChange={(value) => updateFormData('resourceType', value)}
                >
                  <SelectTrigger className={cn(errors.resourceType && "border-red-500")}>
                    <SelectValue placeholder="選擇資源類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF 文件
                      </div>
                    </SelectItem>
                    <SelectItem value="Video">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        影片
                      </div>
                    </SelectItem>
                    <SelectItem value="Image">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        圖片
                      </div>
                    </SelectItem>
                    <SelectItem value="Interactive">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        互動內容
                      </div>
                    </SelectItem>
                    <SelectItem value="External Platform">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        外部平台
                      </div>
                    </SelectItem>
                    <SelectItem value="Document">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        文件
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.resourceType && (
                  <p className="text-red-600 text-sm">{errors.resourceType}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>分類</Label>
                <Select
                  value={formData.categoryId?.toString() || ''}
                  onValueChange={(value) => updateFormData('categoryId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">無分類</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grade Level */}
              <div className="space-y-2">
                <Label>年級層級</Label>
                <Select
                  value={formData.gradeLevelId?.toString() || ''}
                  onValueChange={(value) => updateFormData('gradeLevelId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇年級層級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全年級</SelectItem>
                    {gradeLevels.map(gradeLevel => (
                      <SelectItem key={gradeLevel.id} value={gradeLevel.id.toString()}>
                        {gradeLevel.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* File Upload or External URL */}
              {formData.resourceType === 'External Platform' ? (
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">外部連結 *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="externalUrl"
                        type="url"
                        value={formData.externalUrl}
                        onChange={(e) => updateFormData('externalUrl', e.target.value)}
                        placeholder="https://example.com"
                        className={cn(errors.externalUrl && "border-red-500")}
                      />
                      {errors.externalUrl && (
                        <p className="text-red-600 text-sm mt-1">{errors.externalUrl}</p>
                      )}
                    </div>
                    <Button type="button" variant="outline" size="icon">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label>檔案上傳 *</Label>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file)
                        }
                      }}
                      accept={formData.resourceType === 'Image' ? 'image/*' : formData.resourceType === 'PDF' ? '.pdf' : '*'}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {uploadLoading ? (
                          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-purple-600" />
                        )}
                        <p className="text-sm text-gray-600">
                          {uploadLoading ? '上傳中...' : '點擊上傳檔案或拖拽檔案到此處'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Manual File URL */}
                  <div className="space-y-2">
                    <Label htmlFor="fileUrl">或輸入檔案 URL</Label>
                    <Input
                      id="fileUrl"
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => updateFormData('fileUrl', e.target.value)}
                      placeholder="https://example.com/file.pdf"
                      className={cn(errors.fileUrl && "border-red-500")}
                    />
                    {errors.fileUrl && (
                      <p className="text-red-600 text-sm">{errors.fileUrl}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Thumbnail URL */}
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">縮略圖 URL</Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => updateFormData('thumbnailUrl', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className={cn(errors.thumbnailUrl && "border-red-500")}
                />
                {errors.thumbnailUrl && (
                  <p className="text-red-600 text-sm">{errors.thumbnailUrl}</p>
                )}
              </div>

              {/* Preview */}
              {(formData.fileUrl || formData.externalUrl || formData.thumbnailUrl) && (
                <div className="space-y-2">
                  <Label>預覽</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {formData.thumbnailUrl ? (
                          <img
                            src={formData.thumbnailUrl}
                            alt="Thumbnail"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-100 rounded flex items-center justify-center">
                            <TypeIcon className="w-8 h-8 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{formData.title || '未命名資源'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{formData.resourceType}</p>
                        {(formData.fileUrl || formData.externalUrl) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(formData.fileUrl || formData.externalUrl, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            預覽
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              {/* Tags */}
              <div className="space-y-2">
                <Label>標籤</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="輸入新標籤"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>狀態</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已發佈</SelectItem>
                    <SelectItem value="archived">已封存</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>精選資源</Label>
                  <p className="text-sm text-gray-600">將此資源標記為精選內容</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => updateFormData('isFeatured', checked)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? '建立資源' : '更新資源'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}