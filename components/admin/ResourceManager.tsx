'use client'

/**
 * Resource Manager Component - ES International Department
 * 資源管理組件 - ES 國際部
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Search,
  Filter,
  FileText,
  Folder,
  Upload,
  BarChart3,
  RefreshCw,
  Loader2,
  BookOpen,
  Users,
  GraduationCap,
  Tags,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ResourceList from './ResourceList'
import ResourceForm from './ResourceForm'
import ResourceCategoryManager from './ResourceCategoryManager'
import ResourceAnalytics from './ResourceAnalytics'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

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

interface ResourceStats {
  total: number
  published: number
  draft: number
  archived: number
  featured: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byGradeLevel: Record<string, number>
  totalDownloads: number
  totalViews: number
}

export default function ResourceManager() {
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [stats, setStats] = useState<ResourceStats | null>(null)
  
  // Pagination and filters
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    categoryId: undefined,
    gradeLevelId: undefined,
    status: undefined,
    resourceType: undefined,
    isFeatured: undefined
  })

  // Form state
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')

  // Metadata
  const [categories, setCategories] = useState<any[]>([])
  const [gradeLevels, setGradeLevels] = useState<any[]>([])

  // Fetch resources
  const fetchResources = useCallback(async (newFilters?: ResourceFilters, page?: number) => {
    setLoading(true)
    setError('')
    
    try {
      const currentFilters = newFilters || filters
      const currentPage = page || pagination.page
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString()
      })
      
      if (currentFilters.search) {
        searchParams.append('search', currentFilters.search)
      }
      if (currentFilters.categoryId) {
        searchParams.append('categoryId', currentFilters.categoryId.toString())
      }
      if (currentFilters.gradeLevelId) {
        searchParams.append('gradeLevelId', currentFilters.gradeLevelId.toString())
      }
      if (currentFilters.status) {
        searchParams.append('status', currentFilters.status)
      }
      if (currentFilters.resourceType) {
        searchParams.append('resourceType', currentFilters.resourceType)
      }
      if (currentFilters.isFeatured !== undefined) {
        searchParams.append('isFeatured', currentFilters.isFeatured.toString())
      }
      
      const response = await fetch(`/api/admin/resources?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setResources(data.data)
        setPagination(data.pagination)
        setFilters(currentFilters)
        calculateStats(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch resources')
      }
    } catch (error) {
      console.error('Fetch resources error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Calculate statistics
  const calculateStats = (resourceList: Resource[]) => {
    const stats: ResourceStats = {
      total: resourceList.length,
      published: resourceList.filter(r => r.status === 'published').length,
      draft: resourceList.filter(r => r.status === 'draft').length,
      archived: resourceList.filter(r => r.status === 'archived').length,
      featured: resourceList.filter(r => r.isFeatured).length,
      byType: {},
      byCategory: {},
      byGradeLevel: {},
      totalDownloads: resourceList.reduce((sum, r) => sum + r.downloadCount, 0),
      totalViews: resourceList.reduce((sum, r) => sum + r.viewCount, 0)
    }

    // Group by type
    resourceList.forEach(resource => {
      stats.byType[resource.resourceType] = (stats.byType[resource.resourceType] || 0) + 1
      
      if (resource.category) {
        stats.byCategory[resource.category.displayName] = (stats.byCategory[resource.category.displayName] || 0) + 1
      }
      
      if (resource.gradeLevel) {
        stats.byGradeLevel[resource.gradeLevel.displayName] = (stats.byGradeLevel[resource.gradeLevel.displayName] || 0) + 1
      }
    })

    setStats(stats)
  }

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, gradeLevelsRes] = await Promise.all([
        fetch('/api/admin/resources/categories'),
        fetch('/api/admin/resources/grade-levels')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data || [])
      }

      if (gradeLevelsRes.ok) {
        const gradeLevelsData = await gradeLevelsRes.json()
        setGradeLevels(gradeLevelsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }

  // Handle resource operations
  const handleCreateResource = () => {
    setEditingResource(null)
    setShowResourceForm(true)
    setFormError('')
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setShowResourceForm(true)
    setFormError('')
  }

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm('確定要刪除這個資源嗎？此操作無法復原。')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        await fetchResources()
      } else {
        throw new Error(result.error || 'Failed to delete resource')
      }
    } catch (error) {
      console.error('Delete resource error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete resource')
    }
  }

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true)
    setFormError('')
    
    try {
      const method = editingResource ? 'PUT' : 'POST'
      const url = editingResource ? `/api/admin/resources/${editingResource.id}` : '/api/admin/resources'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setShowResourceForm(false)
        setEditingResource(null)
        await fetchResources()
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
    setShowResourceForm(false)
    setEditingResource(null)
    setFormError('')
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string, resourceIds: number[]) => {
    try {
      const response = await fetch('/api/admin/resources/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          resourceIds
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        await fetchResources()
      } else {
        throw new Error(result.error || 'Bulk action failed')
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      setError(error instanceof Error ? error.message : 'Bulk action failed')
    }
  }

  // Filter handlers
  const handleFiltersChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters)
    fetchResources(newFilters, 1)
  }

  const handlePageChange = (page: number) => {
    fetchResources(filters, page)
  }

  // Load initial data
  useEffect(() => {
    fetchMetadata()
    fetchResources()
  }, [])

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
    <div className="p-6 space-y-6">
      {/* Resource Form Modal */}
      <AnimatePresence>
        {showResourceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
            >
              <ResourceForm
                resource={editingResource || undefined}
                categories={categories}
                gradeLevels={gradeLevels}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
                error={formError}
                mode={editingResource ? 'edit' : 'create'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">資源管理</h1>
          <p className="text-gray-600 mt-1">管理教育資源、檔案和分類系統</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchResources()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn(
              "w-4 h-4",
              loading && "animate-spin"
            )} />
            重新載入
          </Button>
          <Button 
            onClick={handleCreateResource}
            className="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增資源
          </Button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            總覽
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            資源列表
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            分類管理
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            分析報告
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Statistics Cards */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">總資源數</p>
                      <p className="text-2xl font-bold text-blue-800">{stats?.total || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">已發佈</p>
                      <p className="text-2xl font-bold text-green-800">{stats?.published || 0}</p>
                    </div>
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">精選資源</p>
                      <p className="text-2xl font-bold text-yellow-800">{stats?.featured || 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">總下載數</p>
                      <p className="text-2xl font-bold text-purple-800">{stats?.totalDownloads || 0}</p>
                    </div>
                    <Download className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col hover:bg-purple-50"
                    onClick={handleCreateResource}
                  >
                    <Plus className="w-6 h-6 mb-2 text-purple-600" />
                    新增資源
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col hover:bg-blue-50"
                    onClick={() => setActiveTab('categories')}
                  >
                    <Folder className="w-6 h-6 mb-2 text-blue-600" />
                    管理分類
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col hover:bg-green-50"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="w-6 h-6 mb-2 text-green-600" />
                    查看分析
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourceList
            resources={resources}
            loading={loading}
            error={error}
            categories={categories}
            gradeLevels={gradeLevels}
            onEdit={handleEditResource}
            onDelete={handleDeleteResource}
            onFiltersChange={handleFiltersChange}
            onPageChange={handlePageChange}
            pagination={pagination}
            filters={filters}
            onBulkAction={handleBulkAction}
            onRefresh={() => fetchResources()}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <ResourceCategoryManager 
            categories={categories}
            gradeLevels={gradeLevels}
            onUpdate={fetchMetadata}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ResourceAnalytics
            stats={stats}
            categories={categories}
            gradeLevels={gradeLevels}
            onRefresh={() => fetchResources()}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}