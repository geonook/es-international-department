/**
 * Navigation Menu Manager Component for KCISLK ESID Info Hub
 * 導航選單管理組件 - 管理員專用
 * 
 * Manages navigation menu items across various pages and sections
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  RefreshCw, 
  Edit, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Link,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Plus,
  Menu,
  Home,
  Users,
  GraduationCap,
  FileText,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSystemSettings } from '@/hooks/useSystemSettings'

interface NavigationItem {
  id: string
  key: string
  label: string
  href: string
  icon?: string
  section: 'header' | 'footer' | 'sidebar' | 'teachers' | 'parents' | 'admin'
  isVisible: boolean
  isExternal: boolean
  order: number
  parentId?: string
  description?: string
  requiredRole?: 'admin' | 'office' | 'viewer' | null
  targetBlank: boolean
}

interface NavigationMenuManagerProps {
  className?: string
  section?: string
}

export default function NavigationMenuManager({ className, section }: NavigationMenuManagerProps) {
  const [selectedSection, setSelectedSection] = useState(section || 'header')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [editedItem, setEditedItem] = useState<Partial<NavigationItem>>({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [lastSaveResult, setLastSaveResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Default navigation structure
  const defaultNavigationItems: NavigationItem[] = [
    // Header Navigation
    {
      id: 'header_home',
      key: 'nav_header_home',
      label: 'Home',
      href: '/',
      icon: 'Home',
      section: 'header',
      isVisible: true,
      isExternal: false,
      order: 1,
      description: '首頁連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'header_teachers',
      key: 'nav_header_teachers',
      label: 'Teachers',
      href: '/teachers',
      icon: 'GraduationCap',
      section: 'header',
      isVisible: true,
      isExternal: false,
      order: 2,
      description: '教師頁面連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'header_events',
      key: 'nav_header_events',
      label: 'Events',
      href: '/events',
      icon: 'Calendar',
      section: 'header',
      isVisible: true,
      isExternal: false,
      order: 3,
      description: '活動頁面連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'header_resources',
      key: 'nav_header_resources',
      label: 'Resources',
      href: '/resources',
      icon: 'FileText',
      section: 'header',
      isVisible: true,
      isExternal: false,
      order: 4,
      description: '資源頁面連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'header_admin',
      key: 'nav_header_admin',
      label: 'Admin',
      href: '/admin',
      icon: 'Settings',
      section: 'header',
      isVisible: true,
      isExternal: false,
      order: 5,
      description: '管理員頁面連結',
      requiredRole: 'admin',
      targetBlank: false
    },

    // Teachers Page Navigation
    {
      id: 'teachers_home',
      key: 'nav_teachers_home',
      label: 'Home',
      href: '/teachers',
      section: 'teachers',
      isVisible: true,
      isExternal: false,
      order: 1,
      description: '教師首頁',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'teachers_information',
      key: 'nav_teachers_information',
      label: 'Information',
      href: '#information',
      section: 'teachers',
      isVisible: true,
      isExternal: false,
      order: 2,
      description: '資訊區塊錨點',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'teachers_documents',
      key: 'nav_teachers_documents',
      label: 'Documents',
      href: '#documents',
      section: 'teachers',
      isVisible: true,
      isExternal: false,
      order: 3,
      description: '文件區塊錨點',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'teachers_bulletin',
      key: 'nav_teachers_bulletin',
      label: 'Bulletin',
      href: '#bulletin',
      section: 'teachers',
      isVisible: true,
      isExternal: false,
      order: 4,
      description: '公告區塊錨點',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'teachers_parents_corner',
      key: 'nav_teachers_parents_corner',
      label: "Parents' Corner",
      href: '/',
      section: 'teachers',
      isVisible: true,
      isExternal: false,
      order: 5,
      description: '家長專區連結',
      requiredRole: null,
      targetBlank: false
    },

    // Footer Navigation
    {
      id: 'footer_quick_access',
      key: 'nav_footer_quick_access',
      label: 'Information Hub',
      href: '#information',
      section: 'footer',
      isVisible: true,
      isExternal: false,
      order: 1,
      description: '頁腳快速存取連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'footer_documents',
      key: 'nav_footer_documents',
      label: 'Essential Documents',
      href: '#documents',
      section: 'footer',
      isVisible: true,
      isExternal: false,
      order: 2,
      description: '頁腳文件連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'footer_bulletin',
      key: 'nav_footer_bulletin',
      label: "Teachers' Bulletin",
      href: '#bulletin',
      section: 'footer',
      isVisible: true,
      isExternal: false,
      order: 3,
      description: '頁腳公告連結',
      requiredRole: null,
      targetBlank: false
    },
    {
      id: 'footer_feedback',
      key: 'nav_footer_feedback',
      label: 'Feedback Form',
      href: '#feedback',
      section: 'footer',
      isVisible: true,
      isExternal: false,
      order: 4,
      description: '頁腳意見反饋連結',
      requiredRole: null,
      targetBlank: false
    }
  ]

  // Load navigation items from system settings
  const loadNavigationItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings?prefix=nav_')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.length > 0) {
          // Map existing settings to navigation items
          const existingItems = result.data.map((setting: any) => {
            try {
              const data = JSON.parse(setting.value)
              const defaultItem = defaultNavigationItems.find(item => item.key === setting.key)
              return {
                ...defaultItem,
                ...data,
                key: setting.key
              }
            } catch (e) {
              console.warn(`Failed to parse navigation item ${setting.key}:`, e)
              return null
            }
          }).filter(Boolean)
          
          setNavigationItems(existingItems.length > 0 ? existingItems : defaultNavigationItems)
        } else {
          setNavigationItems(defaultNavigationItems)
        }
      } else {
        setNavigationItems(defaultNavigationItems)
      }
    } catch (error) {
      console.error('Error loading navigation items:', error)
      setNavigationItems(defaultNavigationItems)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNavigationItems()
  }, [loadNavigationItems])

  const handleEditItem = useCallback((itemId: string) => {
    const item = navigationItems.find(i => i.id === itemId)
    if (item) {
      setEditedItem(item)
      setEditingItem(itemId)
      setIsCreatingNew(false)
    }
  }, [navigationItems])

  const handleCreateNew = useCallback(() => {
    setEditedItem({
      id: `new_${Date.now()}`,
      key: '',
      label: '',
      href: '',
      section: selectedSection as any,
      isVisible: true,
      isExternal: false,
      order: navigationItems.filter(i => i.section === selectedSection).length + 1,
      requiredRole: null,
      targetBlank: false
    })
    setEditingItem('new')
    setIsCreatingNew(true)
  }, [selectedSection, navigationItems])

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null)
    setEditedItem({})
    setIsCreatingNew(false)
  }, [])

  const handleSaveItem = useCallback(async (itemId: string) => {
    const item = editedItem
    
    if (!item || !item.key || !item.label || !item.href) {
      setLastSaveResult('請填寫所有必填欄位')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: item.key,
          value: JSON.stringify(item),
          description: `Navigation item: ${item.label}`,
          dataType: 'json'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (isCreatingNew) {
            // Add new item
            const newItem = {
              ...item,
              key: item.key.startsWith('nav_') ? item.key : `nav_${item.key}`
            } as NavigationItem
            setNavigationItems(prev => [...prev, newItem])
          } else {
            // Update existing item
            setNavigationItems(prev => prev.map(i => 
              i.id === itemId ? { ...i, ...item } : i
            ))
          }
          setEditingItem(null)
          setEditedItem({})
          setIsCreatingNew(false)
          setLastSaveResult('導航項目更新成功！')
        } else {
          setLastSaveResult('更新失敗：' + (result.error || '未知錯誤'))
        }
      } else {
        setLastSaveResult('更新失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error saving navigation item:', error)
      setLastSaveResult('更新失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [editedItem, isCreatingNew])

  const handleDeleteItem = useCallback(async (itemId: string) => {
    const item = navigationItems.find(i => i.id === itemId)
    if (!item) return

    if (!confirm(`確定要刪除導航項目「${item.label}」嗎？`)) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/settings?key=${item.key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setNavigationItems(prev => prev.filter(i => i.id !== itemId))
        setLastSaveResult('導航項目刪除成功！')
      } else {
        setLastSaveResult('刪除失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error deleting navigation item:', error)
      setLastSaveResult('刪除失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [navigationItems])

  const handleReorderItem = useCallback(async (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = navigationItems.findIndex(i => i.id === itemId)
    if (currentIndex === -1) return

    const item = navigationItems[currentIndex]
    const newOrder = direction === 'up' ? item.order - 1 : item.order + 1
    
    // Find item to swap with
    const swapItem = navigationItems.find(i => 
      i.section === item.section && i.order === newOrder
    )
    
    if (!swapItem) return

    setIsSaving(true)
    try {
      // Update both items
      const updates = [
        { key: item.key, value: JSON.stringify({ ...item, order: newOrder }) },
        { key: swapItem.key, value: JSON.stringify({ ...swapItem, order: item.order }) }
      ]

      const response = await fetch('/api/admin/settings/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (response.ok) {
        setNavigationItems(prev => prev.map(i => {
          if (i.id === itemId) return { ...i, order: newOrder }
          if (i.id === swapItem.id) return { ...i, order: item.order }
          return i
        }))
        setLastSaveResult('順序更新成功！')
      } else {
        setLastSaveResult('順序更新失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error reordering item:', error)
      setLastSaveResult('順序更新失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [navigationItems])

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'header': return Navigation
      case 'footer': return Link
      case 'teachers': return GraduationCap
      case 'parents': return Users
      case 'admin': return Settings
      default: return Menu
    }
  }

  const getSectionColor = (sectionName: string) => {
    switch (sectionName) {
      case 'header': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'footer': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'teachers': return 'bg-green-100 text-green-800 border-green-200'
      case 'parents': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredItems = navigationItems
    .filter(item => selectedSection === 'all' || item.section === selectedSection)
    .sort((a, b) => a.order - b.order)

  return (
    <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">導航選單管理</span>
          <span className="sm:hidden">選單管理</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">載入中...</span>
            </div>
          </div>
        )}

        {/* 保存結果顯示 */}
        {lastSaveResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant={lastSaveResult.includes('失敗') ? 'destructive' : 'default'}>
              {lastSaveResult.includes('失敗') ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{lastSaveResult}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!isLoading && (
          <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
            {/* 行動版使用滿版滿訊式 */}
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6 min-w-[420px] sm:min-w-0">
                <TabsTrigger value="all" className="min-h-[44px] text-xs sm:text-sm px-2">全部</TabsTrigger>
                <TabsTrigger value="header" className="min-h-[44px] text-xs sm:text-sm px-2">主選單</TabsTrigger>
                <TabsTrigger value="teachers" className="min-h-[44px] text-xs sm:text-sm px-2">教師</TabsTrigger>
                <TabsTrigger value="parents" className="min-h-[44px] text-xs sm:text-sm px-2">家長</TabsTrigger>
                <TabsTrigger value="footer" className="min-h-[44px] text-xs sm:text-sm px-2">頁腳</TabsTrigger>
                <TabsTrigger value="admin" className="min-h-[44px] text-xs sm:text-sm px-2">管理</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={selectedSection} className="space-y-4 mt-4 sm:mt-6">
              {/* 新增按鈕 */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  <span className="hidden sm:inline">{selectedSection === 'all' ? '所有導航項目' : `${selectedSection} 區域導航`}</span>
                  <span className="sm:hidden">{selectedSection === 'all' ? '所有項目' : `${selectedSection} 區域`}</span>
                </h3>
                <Button
                  onClick={handleCreateNew}
                  disabled={isSaving || editingItem !== null}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-2 shrink-0" />
                  <span className="hidden sm:inline">新增導航項目</span>
                  <span className="sm:hidden">新增</span>
                </Button>
              </div>

              {/* 新增/編輯表單 */}
              {editingItem && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6"
                >
                  <h4 className="text-base sm:text-lg font-medium text-blue-900 mb-4">
                    {isCreatingNew ? '新增導航項目' : '編輯導航項目'}
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="label" className="text-sm font-medium">顯示名稱 *</Label>
                      <Input
                        id="label"
                        value={editedItem.label || ''}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="例：Home"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="key" className="text-sm font-medium">系統鍵值 *</Label>
                      <Input
                        id="key"
                        value={editedItem.key || ''}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="例：header_home"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="href" className="text-sm font-medium">連結位址 *</Label>
                      <Input
                        id="href"
                        value={editedItem.href || ''}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, href: e.target.value }))}
                        placeholder="例：/teachers 或 #information"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="section" className="text-sm font-medium">所屬區域 *</Label>
                      <Select 
                        value={editedItem.section} 
                        onValueChange={(value) => setEditedItem(prev => ({ ...prev, section: value as any }))}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                          <SelectValue placeholder="選擇區域" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">主選單</SelectItem>
                          <SelectItem value="teachers">教師頁面</SelectItem>
                          <SelectItem value="parents">家長頁面</SelectItem>
                          <SelectItem value="footer">頁腳</SelectItem>
                          <SelectItem value="admin">管理區域</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="icon" className="text-sm font-medium">圖示名稱</Label>
                      <Input
                        id="icon"
                        value={editedItem.icon || ''}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="例：Home, Users, FileText"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="order" className="text-sm font-medium">顯示順序</Label>
                      <Input
                        id="order"
                        type="number"
                        value={editedItem.order || 1}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                        min="1"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requiredRole" className="text-sm font-medium">權限要求</Label>
                      <Select 
                        value={editedItem.requiredRole || 'null'} 
                        onValueChange={(value) => setEditedItem(prev => ({ ...prev, requiredRole: value === 'null' ? null : value as any }))}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                          <SelectValue placeholder="選擇權限" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">無限制</SelectItem>
                          <SelectItem value="viewer">觀看者</SelectItem>
                          <SelectItem value="office">辦公室成員</SelectItem>
                          <SelectItem value="admin">管理員</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isVisible"
                          checked={editedItem.isVisible || false}
                          onCheckedChange={(checked) => setEditedItem(prev => ({ ...prev, isVisible: checked }))}
                        />
                        <Label htmlFor="isVisible" className="text-sm font-medium">顯示</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isExternal"
                          checked={editedItem.isExternal || false}
                          onCheckedChange={(checked) => setEditedItem(prev => ({ ...prev, isExternal: checked }))}
                        />
                        <Label htmlFor="isExternal" className="text-sm font-medium">外部連結</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="targetBlank"
                          checked={editedItem.targetBlank || false}
                          onCheckedChange={(checked) => setEditedItem(prev => ({ ...prev, targetBlank: checked }))}
                        />
                        <Label htmlFor="targetBlank" className="text-sm font-medium">新分頁</Label>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">描述</Label>
                      <Textarea
                        id="description"
                        value={editedItem.description || ''}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="簡要描述此導航項目的用途"
                        rows={2}
                        className="min-h-[44px] text-sm sm:text-base resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={() => handleSaveItem(editingItem)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
                    >
                      <Save className="w-4 h-4 mr-2 shrink-0" />
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      取消
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 導航項目列表 */}
              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Navigation className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">此區域暫無導航項目</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-x-auto">
                    {filteredItems.map((item) => {
                      const SectionIcon = getSectionIcon(item.section)
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          className={`border border-gray-200 rounded-lg p-3 sm:p-4 bg-white min-w-0 ${!item.isVisible ? 'opacity-60' : ''}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <SectionIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.label}</h4>
                                <Badge className={`${getSectionColor(item.section)} text-xs shrink-0`}>
                                  {item.section}
                                </Badge>
                                {!item.isVisible && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                    隱藏
                                  </Badge>
                                )}
                                {item.isExternal && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">外部</span>
                                  </Badge>
                                )}
                                {item.requiredRole && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                    {item.requiredRole}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs sm:text-sm text-gray-600 mb-2 break-all">
                                <strong>連結：</strong> {item.href}
                              </div>
                              
                              {item.description && (
                                <div className="text-xs text-gray-500 mb-2">
                                  {item.description}
                                </div>
                              )}
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                                <span>順序：{item.order}</span>
                                {item.icon && <span className="hidden sm:block">圖示：{item.icon}</span>}
                                {item.targetBlank && <span className="hidden sm:block">新分頁開啟</span>}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              {/* 順序調整按鈕 */}
                              <div className="flex sm:flex-col gap-1 justify-center">
                                <Button
                                  variant="outline"
                                  onClick={() => handleReorderItem(item.id, 'up')}
                                  disabled={editingItem !== null || isSaving || item.order === 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleReorderItem(item.id, 'down')}
                                  disabled={editingItem !== null || isSaving}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>

                              <Button
                                variant="outline"
                                onClick={() => handleEditItem(item.id)}
                                disabled={editingItem !== null || isSaving}
                                className="gap-1 min-h-[44px] text-sm w-full sm:w-auto"
                              >
                                <Edit className="w-3 h-3" />
                                編輯
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={editingItem !== null || isSaving}
                                className="gap-1 border-red-300 text-red-600 hover:bg-red-50 min-h-[44px] text-sm w-full sm:w-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                刪除
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">使用說明</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 各區域導航項目可單獨管理顯示和順序</li>
            <li>• 權限要求決定哪些用戶可以看到該項目</li>
            <li className="hidden sm:block">• 外部連結會在新分頁開啟</li>
            <li>• 順序數值決定在選單中的顯示位置</li>
            <li className="hidden sm:block">• 隱藏的項目不會在前台頁面顯示</li>
            <li className="hidden sm:block">• 圖示名稱使用 Lucide React 圖示庫</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}