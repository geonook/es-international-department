'use client'

/**
 * Resource Card Component - KCISLK ESID Info Hub
 * 資源卡片組件 - KCISLK ESID Info Hub
 */

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Edit,
  Trash2,
  Star,
  Download,
  ExternalLink,
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

interface ResourceCardProps {
  resource: Resource
  viewMode: 'grid' | 'list'
  onEdit: (resource: Resource) => void
  onDelete: (resourceId: number) => void
  getResourceTypeIcon: (type: string) => any
  getStatusColor: (status: string) => string
  formatFileSize: (bytes?: number) => string
  isSelected?: boolean
  onSelect?: () => void
  showCheckbox?: boolean
}

export default function ResourceCard({
  resource,
  viewMode,
  onEdit,
  onDelete,
  getResourceTypeIcon,
  getStatusColor,
  formatFileSize,
  isSelected = false,
  onSelect,
  showCheckbox = false
}: ResourceCardProps) {
  const TypeIcon = getResourceTypeIcon(resource.resourceType)

  const handleView = () => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank')
    } else if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank')
    }
  }

  const handleDownload = () => {
    if (resource.fileUrl) {
      const link = document.createElement('a')
      link.href = resource.fileUrl
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <Card className={cn(
          "hover:shadow-lg transition-all duration-300 border-l-4",
          isSelected ? "border-l-purple-600 bg-purple-50 shadow-md" : "border-l-purple-500"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Selection Checkbox */}
                {showCheckbox && onSelect && (
                  <div className="flex-shrink-0 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect()
                      }}
                      className="p-1 hover:bg-purple-100 rounded transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-purple-600" />
                      )}
                    </button>
                  </div>
                )}
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-lg flex-shrink-0",
                  resource.category?.color ? `bg-${resource.category.color}-100` : "bg-gray-100"
                )}>
                  <TypeIcon className={cn(
                    "w-6 h-6",
                    resource.category?.color ? `text-${resource.category.color}-600` : "text-gray-600"
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                        {resource.title}
                      </h3>
                      {resource.isFeatured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <Badge className={getStatusColor(resource.status)}>
                      {resource.status === 'published' ? '已發佈' : 
                       resource.status === 'draft' ? '草稿' : '已封存'}
                    </Badge>
                  </div>

                  {resource.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <TypeIcon className="w-4 h-4" />
                      {resource.resourceType}
                    </div>
                    {resource.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {resource.category.displayName}
                      </div>
                    )}
                    {resource.gradeLevel && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {resource.gradeLevel.displayName}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(resource.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👁️ {resource.viewCount} 次檢視</span>
                    <span>⬇️ {resource.downloadCount} 次下載</span>
                    {resource.fileSize && (
                      <span>📁 {formatFileSize(resource.fileSize)}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {resource.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {resource.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{resource.tags.length - 3} 更多</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleView}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {(resource.fileUrl && resource.resourceType === 'PDF') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(resource)}>
                      <Edit className="w-4 h-4 mr-2" />
                      編輯
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(resource.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      刪除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <Card className={cn(
        "h-full hover:shadow-xl transition-all duration-300 overflow-hidden",
        isSelected ? "ring-2 ring-purple-500 shadow-lg" : ""
      )}>
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden">
          {resource.thumbnailUrl ? (
            <img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-16 h-16 text-purple-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleView}
                className="bg-white/90 hover:bg-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {(resource.fileUrl && resource.resourceType === 'PDF') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(resource.status)}>
              {resource.status === 'published' ? '已發佈' : 
               resource.status === 'draft' ? '草稿' : '已封存'}
            </Badge>
          </div>

          {/* Selection Checkbox */}
          {showCheckbox && onSelect && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
                className="p-1 bg-white/90 hover:bg-white rounded transition-colors shadow-sm"
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-600 hover:text-purple-600" />
                )}
              </button>
            </div>
          )}

          {/* Featured Star */}
          {resource.isFeatured && (
            <div className="absolute top-3 right-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="space-y-3">
            {/* Title and Type */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-1 line-clamp-2">
                {resource.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TypeIcon className="w-4 h-4" />
                {resource.resourceType}
              </div>
            </div>

            {/* Description */}
            {resource.description && (
              <p className="text-gray-600 text-sm line-clamp-3">
                {resource.description}
              </p>
            )}

            {/* Category and Grade */}
            <div className="flex items-center gap-2 text-sm">
              {resource.category && (
                <Badge variant="outline" className="text-xs">
                  {resource.category.displayName}
                </Badge>
              )}
              {resource.gradeLevel && (
                <Badge variant="outline" className="text-xs">
                  {resource.gradeLevel.displayName}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {resource.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {resource.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{resource.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <span>👁️ {resource.viewCount}</span>
                <span>⬇️ {resource.downloadCount}</span>
              </div>
              {resource.fileSize && (
                <span>{formatFileSize(resource.fileSize)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(resource)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                編輯
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(resource.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400 border-t pt-2">
              建立於 {formatDate(resource.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}