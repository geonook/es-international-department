'use client'

/**
 * Resource List Component - ES International Department
 * 資源列表組件 - ES 國際部
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  Download,
  ExternalLink,
  FileText,
  Play,
  Image,
  Globe,
  BookOpen,
  Users,
  Calendar,
  Tag,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Archive,
  Send,
  MoreHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ResourceCard from './ResourceCard'

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

interface ResourceFilters {
  search: string
  categoryId?: number
  gradeLevelId?: number
  status?: string
  resourceType?: string
  isFeatured?: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ResourceListProps {
  resources: Resource[]
  loading: boolean
  error: string
  categories: any[]
  gradeLevels: any[]
  onEdit: (resource: Resource) => void
  onDelete: (resourceId: number) => void
  onFiltersChange: (filters: ResourceFilters) => void
  onPageChange: (page: number) => void
  pagination: PaginationInfo
  filters: ResourceFilters
  onBulkAction?: (action: string, resourceIds: number[]) => Promise<void>
  onRefresh?: () => void
}

export default function ResourceList({
  resources,
  loading,
  error,
  categories,
  gradeLevels,
  onEdit,
  onDelete,
  onFiltersChange,
  onPageChange,
  pagination,
  filters,
  onBulkAction,
  onRefresh
}: ResourceListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [localFilters, setLocalFilters] = useState<ResourceFilters>(filters)
  const [selectedResources, setSelectedResources] = useState<number[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Handle filter changes
  const handleFilterChange = (key: keyof ResourceFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    const emptyFilters: ResourceFilters = {
      search: '',
      categoryId: undefined,
      gradeLevelId: undefined,
      status: undefined,
      resourceType: undefined,
      isFeatured: undefined
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedResources.length === resources.length) {
      setSelectedResources([])
    } else {
      setSelectedResources(resources.map(r => r.id))
    }
  }

  const handleSelectResource = (resourceId: number) => {
    setSelectedResources(prev => 
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    )
  }

  const clearSelection = () => {
    setSelectedResources([])
    setShowBulkActions(false)
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (!onBulkAction || selectedResources.length === 0) return

    const confirmationMessages = {
      'publish': `確定要發佈 ${selectedResources.length} 個資源嗎？`,
      'archive': `確定要封存 ${selectedResources.length} 個資源嗎？`,
      'delete': `確定要刪除 ${selectedResources.length} 個資源嗎？此操作無法復原。`,
      'feature': `確定要將 ${selectedResources.length} 個資源設為精選嗎？`,
      'unfeature': `確定要取消 ${selectedResources.length} 個資源的精選狀態嗎？`
    }

    const message = confirmationMessages[action as keyof typeof confirmationMessages]
    if (message && !confirm(message)) {
      return
    }

    setBulkActionLoading(true)
    try {
      await onBulkAction(action, selectedResources)
      clearSelection()
    } catch (error) {
      console.error('Bulk action error:', error)
    } finally {
      setBulkActionLoading(false)
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">搜尋</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜尋資源標題或描述..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">分類</label>
              <Select
                value={localFilters.categoryId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('categoryId', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部分類</SelectItem>
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
              <label className="text-sm font-medium">年級</label>
              <Select
                value={localFilters.gradeLevelId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('gradeLevelId', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇年級" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部年級</SelectItem>
                  {gradeLevels.map(gradeLevel => (
                    <SelectItem key={gradeLevel.id} value={gradeLevel.id.toString()}>
                      {gradeLevel.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">資源類型</label>
              <Select
                value={localFilters.resourceType || ''}
                onValueChange={(value) => handleFilterChange('resourceType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部類型</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Video">影片</SelectItem>
                  <SelectItem value="Interactive">互動</SelectItem>
                  <SelectItem value="External Platform">外部平台</SelectItem>
                  <SelectItem value="Image">圖片</SelectItem>
                  <SelectItem value="Document">文件</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">狀態</label>
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部狀態</SelectItem>
                  <SelectItem value="published">已發佈</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">已封存</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured */}
            <div className="space-y-2">
              <label className="text-sm font-medium">精選</label>
              <Select
                value={localFilters.isFeatured?.toString() || ''}
                onValueChange={(value) => handleFilterChange('isFeatured', value === 'true' ? true : value === 'false' ? false : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="是否精選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="true">精選</SelectItem>
                  <SelectItem value="false">非精選</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedResources.length > 0 && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  已選擇 {selectedResources.length} 個資源
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  重新載入
                </Button>
              )}
              <Button variant="outline" onClick={clearFilters}>
                清除篩選
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Header and Bulk Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              顯示 {pagination.totalCount} 個資源中的 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount)} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} 個
            </div>
            {resources.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  {selectedResources.length === resources.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedResources.length === resources.length ? '取消全選' : '全選'}
                </button>
                {selectedResources.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    批量操作 ({selectedResources.length})
                    <MoreHorizontal className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              格狀檢視
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              列表檢視
            </Button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedResources.length > 0 && onBulkAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-purple-900">批量操作 - 已選擇 {selectedResources.length} 個資源</h3>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('publish')}
                disabled={bulkActionLoading}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                發佈
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
                disabled={bulkActionLoading}
                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              >
                <Archive className="w-4 h-4 mr-1" />
                封存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('feature')}
                disabled={bulkActionLoading}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Star className="w-4 h-4 mr-1" />
                設為精選
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('unfeature')}
                disabled={bulkActionLoading}
                className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <XCircle className="w-4 h-4 mr-1" />
                取消精選
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                刪除
              </Button>
              {bulkActionLoading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  處理中...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">載入中...</span>
        </div>
      )}

      {/* Resources Grid/List */}
      {!loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {resources.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">沒有找到符合條件的資源</p>
            </div>
          ) : (
            resources.map(resource => (
              <motion.div key={resource.id} variants={itemVariants}>
                <ResourceCard
                  resource={resource}
                  viewMode={viewMode}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getResourceTypeIcon={getResourceTypeIcon}
                  getStatusColor={getStatusColor}
                  formatFileSize={formatFileSize}
                  isSelected={selectedResources.includes(resource.id)}
                  onSelect={() => handleSelectResource(resource.id)}
                  showCheckbox={true}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            第 {pagination.page} 頁，共 {pagination.totalPages} 頁
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
              上一頁
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(
                  pagination.totalPages - 4,
                  pagination.page - 2
                )) + i
                
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              下一頁
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}