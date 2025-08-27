'use client'

/**
 * Department Document Manager Component - KCISLK ESID Info Hub
 * 部門文檔管理組件 - KCISLK ESID Info Hub
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  FileText,
  GraduationCap,
  Globe,
  BookOpen,
  Shield,
  Users,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Download,
  Eye,
  AlertTriangle,
  FolderOpen,
  Calendar,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ResourceForm from './ResourceForm'

interface DepartmentDocument {
  id: number
  title: string
  description?: string
  resourceType: string
  fileUrl?: string
  externalUrl?: string
  categoryId?: number
  gradeLevelId?: number
  downloadCount: number
  viewCount: number
  status: string
  createdAt: string
  updatedAt: string
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
  }
  tags: string[]
}

interface DepartmentFilter {
  search: string
  department?: string
  status?: string
  resourceType?: string
}

const departmentIcons = {
  'academic-affairs': GraduationCap,
  'foreign-affairs': Globe,
  'classroom-affairs': BookOpen,
  'administrative-forms': FileText,
  'policies-procedures': Shield,
  'student-resources': Users
}

const departmentColors = {
  'academic-affairs': 'from-blue-500 to-blue-600',
  'foreign-affairs': 'from-green-500 to-green-600',
  'classroom-affairs': 'from-red-500 to-red-600',
  'administrative-forms': 'from-purple-500 to-purple-600',
  'policies-procedures': 'from-orange-500 to-orange-600',
  'student-resources': 'from-cyan-500 to-cyan-600'
}

export default function DepartmentDocumentManager() {
  // State management
  const [documents, setDocuments] = useState<DepartmentDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [activeDepartment, setActiveDepartment] = useState<string>('academic-affairs')
  
  // Filter state
  const [filters, setFilters] = useState<DepartmentFilter>({
    search: '',
    department: undefined,
    status: undefined,
    resourceType: undefined
  })

  // Form state
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DepartmentDocument | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')

  // Metadata
  const [categories, setCategories] = useState<any[]>([])
  const [gradeLevels, setGradeLevels] = useState<any[]>([])

  // Department configurations
  const departments = [
    {
      key: 'academic-affairs',
      name: '學務處文檔',
      description: '學務相關政策、表格、通知與管理文檔',
      icon: GraduationCap,
      color: departmentColors['academic-affairs']
    },
    {
      key: 'foreign-affairs',
      name: '外事處文檔',
      description: '國際交流、簽證、海外活動相關文檔',
      icon: Globe,
      color: departmentColors['foreign-affairs']
    },
    {
      key: 'classroom-affairs',
      name: '教務處文檔',
      description: '課程安排、教學管理、評量相關文檔',
      icon: BookOpen,
      color: departmentColors['classroom-affairs']
    },
    {
      key: 'administrative-forms',
      name: '行政表格',
      description: '各類行政申請表格、審核文件',
      icon: FileText,
      color: departmentColors['administrative-forms']
    },
    {
      key: 'policies-procedures',
      name: '政策程序',
      description: '學校政策、作業程序、規章制度',
      icon: Shield,
      color: departmentColors['policies-procedures']
    },
    {
      key: 'student-resources',
      name: '學生資源',
      description: '學生手冊、指導資料、申請資源',
      icon: Users,
      color: departmentColors['student-resources']
    }
  ]

  // Fetch documents for a department
  const fetchDocuments = useCallback(async (departmentKey?: string) => {
    setLoading(true)
    setError('')
    
    try {
      const targetDepartment = departmentKey || activeDepartment
      const searchParams = new URLSearchParams({
        limit: '100'
      })
      
      // Filter by department category
      const departmentCategory = categories.find(cat => cat.name === targetDepartment)
      if (departmentCategory) {
        searchParams.append('categoryId', departmentCategory.id.toString())
      }
      
      if (filters.search) {
        searchParams.append('search', filters.search)
      }
      if (filters.status) {
        searchParams.append('status', filters.status)
      }
      if (filters.resourceType) {
        searchParams.append('resourceType', filters.resourceType)
      }
      
      const response = await fetch(`/api/admin/resources?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to fetch documents')
      }
    } catch (error) {
      console.error('Fetch documents error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [activeDepartment, categories, filters])

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

  // Handle document operations
  const handleCreateDocument = (departmentKey?: string) => {
    const targetDepartment = departmentKey || activeDepartment
    const departmentCategory = categories.find(cat => cat.name === targetDepartment)
    
    setEditingDocument(null)
    setShowDocumentForm(true)
    setFormError('')
    
    // Pre-set the category for the document
    if (departmentCategory) {
      setEditingDocument({
        id: 0,
        title: '',
        description: '',
        resourceType: 'PDF',
        categoryId: departmentCategory.id,
        downloadCount: 0,
        viewCount: 0,
        status: 'draft',
        createdAt: '',
        updatedAt: '',
        tags: []
      } as DepartmentDocument)
    }
  }

  const handleEditDocument = (document: DepartmentDocument) => {
    setEditingDocument(document)
    setShowDocumentForm(true)
    setFormError('')
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('確定要刪除這個文檔嗎？此操作無法復原。')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/resources/${documentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        await fetchDocuments()
      } else {
        throw new Error(result.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Delete document error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete document')
    }
  }

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true)
    setFormError('')
    
    try {
      const method = editingDocument && editingDocument.id > 0 ? 'PUT' : 'POST'
      const url = editingDocument && editingDocument.id > 0 
        ? `/api/admin/resources/${editingDocument.id}` 
        : '/api/admin/resources'
      
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
        setShowDocumentForm(false)
        setEditingDocument(null)
        await fetchDocuments()
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
    setShowDocumentForm(false)
    setEditingDocument(null)
    setFormError('')
  }

  // Handle department change
  const handleDepartmentChange = (departmentKey: string) => {
    setActiveDepartment(departmentKey)
    setFilters({ search: '', department: departmentKey })
    fetchDocuments(departmentKey)
  }

  // Load initial data
  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      fetchDocuments()
    }
  }, [categories, fetchDocuments])

  // Filter documents for active department
  const departmentDocuments = documents.filter(doc => {
    const departmentCategory = categories.find(cat => cat.name === activeDepartment)
    return departmentCategory && doc.categoryId === departmentCategory.id
  })

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
      {/* Document Form Modal */}
      <AnimatePresence>
        {showDocumentForm && (
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
                resource={editingDocument || undefined}
                categories={categories}
                gradeLevels={gradeLevels}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
                error={formError}
                mode={editingDocument && editingDocument.id > 0 ? 'edit' : 'create'}
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
          <h1 className="text-2xl font-bold text-gray-900">部門文檔管理</h1>
          <p className="text-gray-600 mt-1">管理各部門政策文件、表格與資源</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDocuments()}
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
            onClick={() => handleCreateDocument()}
            className="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增文檔
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

      {/* Department Tabs */}
      <Tabs value={activeDepartment} onValueChange={handleDepartmentChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {departments.map((dept) => {
            const IconComponent = dept.icon
            return (
              <TabsTrigger key={dept.key} value={dept.key} className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{dept.name.replace('文檔', '').replace('處', '')}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {departments.map((dept) => (
          <TabsContent key={dept.key} value={dept.key} className="space-y-6">
            {/* Department Header */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className={`bg-gradient-to-r ${dept.color} text-white overflow-hidden`}>
                <CardHeader className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
                    <dept.icon className="h-8 w-8" />
                    {dept.name}
                  </CardTitle>
                  <p className="text-white/90 relative z-10">{dept.description}</p>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {departmentDocuments.length} 個文檔
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {departmentDocuments.filter(d => d.status === 'published').length} 已發佈
                      </Badge>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCreateDocument(dept.key)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新增文檔
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="搜尋文檔標題或描述..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Filter Options */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Select 
                          value={filters.status || 'all'} 
                          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇狀態" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有狀態</SelectItem>
                            <SelectItem value="draft">草稿</SelectItem>
                            <SelectItem value="published">已發佈</SelectItem>
                            <SelectItem value="archived">已封存</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1">
                        <Select 
                          value={filters.resourceType || 'all'} 
                          onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value === 'all' ? undefined : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="文檔類型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有類型</SelectItem>
                            <SelectItem value="PDF">PDF 文件</SelectItem>
                            <SelectItem value="Document">Word 文檔</SelectItem>
                            <SelectItem value="Spreadsheet">試算表</SelectItem>
                            <SelectItem value="External">外部連結</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => fetchDocuments()}
                        className="flex items-center gap-2"
                      >
                        <Filter className="w-4 h-4" />
                        套用篩選
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : departmentDocuments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      尚無文檔
                    </h3>
                    <p className="text-gray-600 mb-4">
                      開始為{dept.name}新增文檔資源
                    </p>
                    <Button onClick={() => handleCreateDocument(dept.key)}>
                      <Plus className="w-4 h-4 mr-2" />
                      新增第一個文檔
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                departmentDocuments.map((document) => (
                  <motion.div key={document.id} variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <FileText className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {document.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={
                                        document.status === 'published' ? 'success' :
                                        document.status === 'draft' ? 'warning' :
                                        document.status === 'archived' ? 'outline' : 'secondary'
                                      }
                                    >
                                      {document.status === 'published' ? '已發佈' : 
                                       document.status === 'draft' ? '草稿' : '已封存'}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {document.description && (
                                  <div 
                                    className="text-gray-600 mb-3 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: document.description }}
                                  />
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(document.createdAt).toLocaleDateString('zh-TW')}
                                  </div>
                                  {document.creator && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {document.creator.displayName}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Download className="w-4 h-4" />
                                    {document.downloadCount} 下載
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {document.viewCount} 檢視
                                  </div>
                                </div>
                                
                                {/* Tags */}
                                {document.tags && document.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {document.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                  {document.fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(document.fileUrl, '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      檢視
                                    </Button>
                                  )}
                                  {document.externalUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(document.externalUrl, '_blank')}
                                    >
                                      <Globe className="w-4 h-4 mr-2" />
                                      開啟連結
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditDocument(document)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    編輯
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteDocument(document.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    刪除
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}