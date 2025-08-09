'use client'

/**
 * Resource Category Manager Component - KCISLK ESID Info Hub
 * Resource Category Manager Component - KCISLK ESID Info Hub
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Folder,
  FolderOpen,
  GripVertical,
  Palette,
  Tag,
  Users,
  BarChart3,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  BookOpen,
  FileText,
  Monitor,
  Scissors,
  Calculator,
  Music,
  Brush,
  Globe,
  Heart,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  displayName: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  resourceCount?: number
  _count?: {
    resources: number
  }
}

interface CategoryFormData {
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  isActive: boolean
}

interface ResourceCategoryManagerProps {
  categories: Category[]
  gradeLevels: any[]
  onUpdate: () => void
}

// Predefined icons for categories
const CATEGORY_ICONS = [
  { value: 'BookOpen', label: 'Book', icon: BookOpen },
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'Monitor', label: 'Digital', icon: Monitor },
  { value: 'Calculator', label: 'Math', icon: Calculator },
  { value: 'Globe', label: 'Social', icon: Globe },
  { value: 'Scissors', label: 'Arts', icon: Scissors },
  { value: 'Music', label: 'Music', icon: Music },
  { value: 'Brush', label: 'Art', icon: Brush },
  { value: 'Heart', label: 'Character', icon: Heart },
  { value: 'Zap', label: 'Science', icon: Zap },
  { value: 'Users', label: 'Group', icon: Users },
  { value: 'Folder', label: 'Folder', icon: Folder }
]

// Predefined colors for categories
const CATEGORY_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' }
]

export default function ResourceCategoryManager({ categories = [], gradeLevels = [], onUpdate }: ResourceCategoryManagerProps) {
  // State management
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showInactiveCategories, setShowInactiveCategories] = useState(false)

  // Form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    displayName: '',
    description: '',
    icon: 'Folder',
    color: 'blue',
    isActive: true
  })

  // Sync with parent categories
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  // Filter and sort categories
  const filteredCategories = localCategories
    .filter(category => {
      const matchesSearch = category.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = showInactiveCategories || category.isActive
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a.displayName.toLowerCase()
      const bValue = b.displayName.toLowerCase()
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

  // Handle form operations
  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      icon: 'Folder',
      color: 'blue',
      isActive: true
    })
    setEditingCategory(null)
    setFormError('')
  }

  const handleCreateCategory = () => {
    resetForm()
    setShowCategoryForm(true)
  }

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || '',
      icon: category.icon || 'Folder',
      color: category.color || 'blue',
      isActive: category.isActive
    })
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}" category? This operation cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/resources/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        await onUpdate()
        setError('')
      } else {
        throw new Error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.displayName.trim()) {
      setFormError('Display name is a required field')
      return
    }

    // Generate slug from display name if name is empty
    if (!formData.name.trim()) {
      formData.name = formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    }

    setFormLoading(true)
    setFormError('')

    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const url = editingCategory 
        ? `/api/admin/resources/categories/${editingCategory.id}` 
        : '/api/admin/resources/categories'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setShowCategoryForm(false)
        resetForm()
        await onUpdate()
      } else {
        throw new Error(result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Form submit error:', error)
      setFormError(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowCategoryForm(false)
    resetForm()
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const iconData = CATEGORY_ICONS.find(icon => icon.value === iconName)
    return iconData ? iconData.icon : Folder
  }

  // Get color class
  const getColorClass = (colorName: string) => {
    const colorData = CATEGORY_COLORS.find(color => color.value === colorName)
    return colorData ? colorData.class : 'bg-blue-500'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g.: Math Materials"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g.: math_materials (leave empty for auto-generation)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Category description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_COLORS.map(({ value, label, class: colorClass }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded", colorClass)} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-gray-600">Disabled categories will not be shown in the frontend</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                    getColorClass(formData.color)
                  )}>
                    {(() => {
                      const IconComponent = getIconComponent(formData.icon)
                      return <IconComponent className="w-5 h-5" />
                    })()}
                  </div>
                  <div>
                    <h4 className="font-medium">{formData.displayName || 'Unnamed Category'}</h4>
                    <p className="text-sm text-gray-600">{formData.description || 'No description'}</p>
                  </div>
                  {!formData.isActive && (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleFormCancel}>
                取消
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? '更新分類' : '建立分類'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">分類管理</h2>
          <p className="text-gray-600 mt-1">管理資源分類、圖示和顏色設定</p>
        </div>
        <Button onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          新增分類
        </Button>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋分類..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactiveCategories}
                  onChange={(e) => setShowInactiveCategories(e.target.checked)}
                  className="w-4 h-4"
                />
                顯示停用分類
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCategories.map((category) => {
          const IconComponent = getIconComponent(category.icon || 'Folder')
          const resourceCount = category._count?.resources || category.resourceCount || 0
          
          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Card className={cn(
                "hover:shadow-md transition-shadow",
                !category.isActive && "opacity-60 border-dashed"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                        getColorClass(category.color || 'blue')
                      )}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.displayName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description || '無描述'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {resourceCount} 個資源
                          </Badge>
                          {!category.isActive && (
                            <Badge variant="secondary" className="text-xs">停用</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.displayName)}
                        disabled={resourceCount > 0}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? '找不到符合的分類' : '尚無分類'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? '請嘗試其他搜尋關鍵字' : '開始新增第一個資源分類'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              新增分類
            </Button>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-600 mt-2">處理中...</p>
        </div>
      )}
    </div>
  )
}