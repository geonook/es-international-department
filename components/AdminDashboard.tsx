'use client'

/**
 * Admin Dashboard Component with Real Authentication
 * 管理員儀表板組件 - 使用真實認證
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Users,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  Shield,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  GraduationCap,
  Sparkles,
  Loader2,
  Send,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import AnnouncementList from '@/components/AnnouncementList'
import AnnouncementForm from '@/components/AnnouncementForm'
import { 
  Announcement, 
  AnnouncementFormData, 
  AnnouncementFilters, 
  PaginationInfo, 
  AnnouncementStats,
  ApiResponse,
  AnnouncementListResponse 
} from '@/lib/types'

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, logout, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // 公告管理狀態
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [announcementsError, setAnnouncementsError] = useState<string>('')
  const [announcementStats, setAnnouncementStats] = useState<AnnouncementStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState<AnnouncementFilters>({
    targetAudience: 'all',
    priority: undefined,
    status: undefined,
    search: ''
  })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')

  // 獲取公告列表
  const fetchAnnouncements = useCallback(async (newFilters?: AnnouncementFilters, page?: number) => {
    setAnnouncementsLoading(true)
    setAnnouncementsError('')
    
    try {
      const currentFilters = newFilters || filters
      const currentPage = page || pagination.page
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        status: 'all' // 管理員可以看到所有狀態的公告
      })
      
      if (currentFilters.targetAudience && currentFilters.targetAudience !== 'all') {
        searchParams.append('targetAudience', currentFilters.targetAudience)
      }
      if (currentFilters.priority) {
        searchParams.append('priority', currentFilters.priority)
      }
      if (currentFilters.status) {
        searchParams.append('status', currentFilters.status)
      }
      if (currentFilters.search) {
        searchParams.append('search', currentFilters.search)
      }
      
      const response = await fetch(`/api/announcements?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: AnnouncementListResponse = await response.json()
      
      if (data.success) {
        setAnnouncements(data.data)
        setPagination(data.pagination)
        setFilters(currentFilters)
        
        // 計算統計資訊
        calculateStats(data.data)
      } else {
        throw new Error(data.message || '獲取公告失敗')
      }
    } catch (error) {
      console.error('Fetch announcements error:', error)
      setAnnouncementsError(error instanceof Error ? error.message : '載入公告時發生錯誤')
    } finally {
      setAnnouncementsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // 計算統計資訊
  const calculateStats = (announcementList: Announcement[]) => {
    const stats: AnnouncementStats = {
      total: announcementList.length,
      published: announcementList.filter(a => a.status === 'published').length,
      draft: announcementList.filter(a => a.status === 'draft').length,
      archived: announcementList.filter(a => a.status === 'archived').length,
      byPriority: {
        high: announcementList.filter(a => a.priority === 'high').length,
        medium: announcementList.filter(a => a.priority === 'medium').length,
        low: announcementList.filter(a => a.priority === 'low').length
      },
      byTargetAudience: {
        teachers: announcementList.filter(a => a.targetAudience === 'teachers').length,
        parents: announcementList.filter(a => a.targetAudience === 'parents').length,
        all: announcementList.filter(a => a.targetAudience === 'all').length
      }
    }
    setAnnouncementStats(stats)
  }

  // 建立公告
  const createAnnouncement = async (data: AnnouncementFormData) => {
    setFormLoading(true)
    setFormError('')
    
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Announcement> = await response.json()
      
      if (result.success) {
        setShowAnnouncementForm(false)
        setEditingAnnouncement(null)
        await fetchAnnouncements() // 重新載入列表
      } else {
        throw new Error(result.message || '建立公告失敗')
      }
    } catch (error) {
      console.error('Create announcement error:', error)
      setFormError(error instanceof Error ? error.message : '建立公告時發生錯誤')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // 更新公告
  const updateAnnouncement = async (data: AnnouncementFormData) => {
    if (!editingAnnouncement) return
    
    setFormLoading(true)
    setFormError('')
    
    try {
      const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Announcement> = await response.json()
      
      if (result.success) {
        setShowAnnouncementForm(false)
        setEditingAnnouncement(null)
        await fetchAnnouncements() // 重新載入列表
      } else {
        throw new Error(result.message || '更新公告失敗')
      }
    } catch (error) {
      console.error('Update announcement error:', error)
      setFormError(error instanceof Error ? error.message : '更新公告時發生錯誤')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // 刪除公告
  const deleteAnnouncement = async (announcementId: number) => {
    if (!confirm('確定要刪除這個公告嗎？此操作無法復原。')) {
      return
    }
    
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        await fetchAnnouncements() // 重新載入列表
      } else {
        throw new Error(result.message || '刪除公告失敗')
      }
    } catch (error) {
      console.error('Delete announcement error:', error)
      setAnnouncementsError(error instanceof Error ? error.message : '刪除公告時發生錯誤')
    }
  }

  // 處理編輯公告
  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setShowAnnouncementForm(true)
    setFormError('')
  }

  // 處理新增公告
  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null)
    setShowAnnouncementForm(true)
    setFormError('')
  }

  // 處理表單取消
  const handleFormCancel = () => {
    setShowAnnouncementForm(false)
    setEditingAnnouncement(null)
    setFormError('')
  }

  // 處理表單提交
  const handleFormSubmit = async (data: AnnouncementFormData) => {
    if (editingAnnouncement) {
      await updateAnnouncement(data)
    } else {
      await createAnnouncement(data)
    }
  }

  // 處理篩選變更
  const handleFiltersChange = (newFilters: AnnouncementFilters) => {
    setFilters(newFilters)
    fetchAnnouncements(newFilters, 1) // 重置到第一頁
  }

  // 處理分頁變更
  const handlePageChange = (page: number) => {
    fetchAnnouncements(filters, page)
  }

  // 初始載入公告
  useEffect(() => {
    if (isAuthenticated && isAdmin() && activeTab === 'teachers') {
      fetchAnnouncements()
    }
  }, [isAuthenticated, activeTab, fetchAnnouncements, isAdmin])

  const [parentsData, setParentsData] = useState({
    newsletters: [
      {
        id: 1,
        title: "January Newsletter",
        content: "Monthly updates and events",
        date: "2025-01-15",
        status: "published",
      },
      { 
        id: 2, 
        title: "February Newsletter", 
        content: "Upcoming activities", 
        date: "2025-02-01", 
        status: "draft" 
      },
    ],
    events: [
      { 
        id: 1, 
        title: "Coffee with Principal", 
        content: "Monthly parent meeting", 
        date: "2025-02-10", 
        type: "meeting" 
      },
      {
        id: 2,
        title: "International Culture Day",
        content: "Cultural celebration event",
        date: "2025-02-28",
        type: "event",
      },
    ],
  })

  // 處理登出
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      // useAuth hook 會自動處理重導向
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">載入中...</p>
        </motion.div>
      </div>
    )
  }

  // 未登入或無管理員權限
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl text-red-600">存取受限</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  您沒有權限存取管理員介面。請使用管理員帳戶登入。
                </AlertDescription>
              </Alert>
              <div className="mt-6 space-y-3">
                <Button 
                  asChild 
                  className="w-full"
                >
                  <Link href="/login?redirect=/admin">
                    重新登入
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full"
                >
                  <Link href="/">
                    返回首頁
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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

  const sidebarItems = [
    { id: "dashboard", label: "儀表板", icon: BarChart3 },
    { id: "teachers", label: "教師管理", icon: GraduationCap },
    { id: "parents", label: "家長資訊", icon: Users },
    { id: "settings", label: "系統設定", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ES 國際部 - 管理中心
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || user?.firstName || user?.email}
                </p>
                <p className="text-xs text-gray-600">管理員</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                登出
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 space-y-2"
          >
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </motion.aside>

          {/* Main Content */}
          <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">儀表板總覽</h2>
                      <p className="text-gray-600 mt-1">系統狀態與重要資訊</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      更新資料
                    </Button>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">總教師數</p>
                            <p className="text-2xl font-bold text-blue-800">25</p>
                          </div>
                          <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">活躍家長</p>
                            <p className="text-2xl font-bold text-green-800">342</p>
                          </div>
                          <Users className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">本月活動</p>
                            <p className="text-2xl font-bold text-purple-800">8</p>
                          </div>
                          <Calendar className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-600 text-sm font-medium">總公告數</p>
                            <p className="text-2xl font-bold text-orange-800">
                              {announcementStats?.total || 0}
                            </p>
                          </div>
                          <MessageSquare className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Announcement Statistics */}
                  {announcementStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-cyan-600 text-sm font-medium">已發佈</p>
                              <p className="text-2xl font-bold text-cyan-800">
                                {announcementStats.published}
                              </p>
                            </div>
                            <Send className="w-8 h-8 text-cyan-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-amber-600 text-sm font-medium">草稿</p>
                              <p className="text-2xl font-bold text-amber-800">
                                {announcementStats.draft}
                              </p>
                            </div>
                            <FileText className="w-8 h-8 text-amber-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-600 text-sm font-medium">高優先級</p>
                              <p className="text-2xl font-bold text-red-800">
                                {announcementStats.byPriority.high}
                              </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-teal-600 text-sm font-medium">已封存</p>
                              <p className="text-2xl font-bold text-teal-800">
                                {announcementStats.archived}
                              </p>
                            </div>
                            <Download className="w-8 h-8 text-teal-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Recent Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                        最近活動
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">新增教師公告</p>
                            <p className="text-sm text-gray-600">Staff Meeting Tomorrow - 2 分鐘前</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">家長通訊發佈</p>
                            <p className="text-sm text-gray-600">January Newsletter - 15 分鐘前</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">系統更新</p>
                            <p className="text-sm text-gray-600">認證系統升級完成 - 1 小時前</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "teachers" && (
                <motion.div
                  key="teachers"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  {/* 公告表單模態 */}
                  {showAnnouncementForm && (
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
                        <AnnouncementForm
                          announcement={editingAnnouncement || undefined}
                          onSubmit={handleFormSubmit}
                          onCancel={handleFormCancel}
                          loading={formLoading}
                          error={formError}
                          mode={editingAnnouncement ? 'edit' : 'create'}
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">公告管理</h2>
                      <p className="text-gray-600 mt-1">管理所有公告與通知</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fetchAnnouncements()}
                        disabled={announcementsLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={cn(
                          "w-4 h-4",
                          announcementsLoading && "animate-spin"
                        )} />
                        重新載入
                      </Button>
                      <Button 
                        onClick={handleCreateAnnouncement}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        新增公告
                      </Button>
                    </div>
                  </div>

                  {/* 公告統計卡片 */}
                  {announcementStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-medium">總公告數</p>
                              <p className="text-xl font-bold text-blue-800">{announcementStats.total}</p>
                            </div>
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-600 text-sm font-medium">已發佈</p>
                              <p className="text-xl font-bold text-green-800">{announcementStats.published}</p>
                            </div>
                            <Send className="w-6 h-6 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-amber-600 text-sm font-medium">草稿</p>
                              <p className="text-xl font-bold text-amber-800">{announcementStats.draft}</p>
                            </div>
                            <FileText className="w-6 h-6 text-amber-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-600 text-sm font-medium">高優先級</p>
                              <p className="text-xl font-bold text-red-800">{announcementStats.byPriority.high}</p>
                            </div>
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* 公告列表 */}
                  <AnnouncementList
                    announcements={announcements}
                    loading={announcementsLoading}
                    error={announcementsError}
                    onEdit={handleEditAnnouncement}
                    onDelete={deleteAnnouncement}
                    onFiltersChange={handleFiltersChange}
                    onPageChange={handlePageChange}
                    pagination={pagination}
                    filters={filters}
                    showActions={true}
                  />
                </motion.div>
              )}

              {activeTab === "parents" && (
                <motion.div
                  key="parents"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">家長資訊管理</h2>
                      <p className="text-gray-600 mt-1">管理家長通訊與活動資訊</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      新增內容
                    </Button>
                  </div>

                  {/* Parent Newsletters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        家長通訊
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {parentsData.newsletters.map((newsletter) => (
                          <div key={newsletter.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold">{newsletter.title}</h3>
                                  <Badge 
                                    variant={newsletter.status === 'published' ? 'default' : 'secondary'}
                                  >
                                    {newsletter.status === 'published' ? '已發佈' : '草稿'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-2">{newsletter.content}</p>
                                <p className="text-sm text-gray-500">{newsletter.date}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parent Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                        家長活動
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {parentsData.events.map((event) => (
                          <div key={event.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold">{event.title}</h3>
                                  <Badge variant="outline">
                                    {event.type === 'meeting' ? '會議' : '活動'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-2">{event.content}</p>
                                <p className="text-sm text-gray-500">{event.date}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">系統設定</h2>
                    <p className="text-gray-600 mt-1">系統配置與帳戶管理</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Profile Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>個人資訊</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="displayName">顯示名稱</Label>
                          <Input 
                            id="displayName" 
                            defaultValue={user?.displayName || ''} 
                            placeholder="請輸入顯示名稱"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">電子郵件</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            defaultValue={user?.email || ''} 
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          <Save className="w-4 h-4 mr-2" />
                          儲存變更
                        </Button>
                      </CardContent>
                    </Card>

                    {/* System Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>系統配置</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="siteName">網站名稱</Label>
                          <Input 
                            id="siteName" 
                            defaultValue="ES 國際部" 
                            placeholder="請輸入網站名稱"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maintenanceMode">維護模式</Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="maintenanceMode" />
                            <Label htmlFor="maintenanceMode">啟用維護模式</Label>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          <Save className="w-4 h-4 mr-2" />
                          更新設定
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>快速操作</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Users className="w-6 h-6 mb-2" />
                          用戶管理
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Download className="w-6 h-6 mb-2" />
                          資料匯出
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <RefreshCw className="w-6 h-6 mb-2" />
                          清除快取
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  )
}