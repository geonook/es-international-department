'use client'

/**
 * Admin Dashboard Component with Real Authentication
 * Administrator Dashboard Component - Using Real Authentication
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
  Play,
  CheckCircle,
  Folder,
  Upload,
  BookOpen,
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
  const { user, isLoading, isAuthenticated, logout, isAdmin, redirectToLogin } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Announcement management state
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

  // Fetch announcement list
  const fetchAnnouncements = useCallback(async (newFilters?: AnnouncementFilters, page?: number) => {
    setAnnouncementsLoading(true)
    setAnnouncementsError('')
    
    try {
      const currentFilters = newFilters || filters
      const currentPage = page || pagination.page
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        status: 'all' // Administrators can see announcements in all statuses
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
        
        // Calculate statistics
        calculateStats(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch announcements')
      }
    } catch (error) {
      console.error('Fetch announcements error:', error)
      setAnnouncementsError(error instanceof Error ? error.message : 'An error occurred while loading announcements')
    } finally {
      setAnnouncementsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Calculate statistics
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

  // Create announcement
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
        await fetchAnnouncements() // Reload list
      } else {
        throw new Error(result.message || 'Failed to create announcement')
      }
    } catch (error) {
      console.error('Create announcement error:', error)
      setFormError(error instanceof Error ? error.message : 'An error occurred while creating announcement')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Update announcement
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
        await fetchAnnouncements() // Reload list
      } else {
        throw new Error(result.message || 'Failed to update announcement')
      }
    } catch (error) {
      console.error('Update announcement error:', error)
      setFormError(error instanceof Error ? error.message : 'An error occurred while updating announcement')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Delete announcement
  const deleteAnnouncement = async (announcementId: number) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
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
        await fetchAnnouncements() // Reload list
      } else {
        throw new Error(result.message || 'Failed to delete announcement')
      }
    } catch (error) {
      console.error('Delete announcement error:', error)
      setAnnouncementsError(error instanceof Error ? error.message : 'An error occurred while deleting announcement')
    }
  }

  // Handle edit announcement
  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setShowAnnouncementForm(true)
    setFormError('')
  }

  // Handle create announcement
  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null)
    setShowAnnouncementForm(true)
    setFormError('')
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowAnnouncementForm(false)
    setEditingAnnouncement(null)
    setFormError('')
  }

  // Handle form submit
  const handleFormSubmit = async (data: AnnouncementFormData) => {
    if (editingAnnouncement) {
      await updateAnnouncement(data)
    } else {
      await createAnnouncement(data)
    }
  }

  // Handle filters change
  const handleFiltersChange = (newFilters: AnnouncementFilters) => {
    setFilters(newFilters)
    fetchAnnouncements(newFilters, 1) // Reset to first page
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchAnnouncements(filters, page)
  }

  // Initial load announcements
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

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      // useAuth hook will automatically handle redirect
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  // Check authentication and permissions - Automatically redirect to login page
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      redirectToLogin('/admin')
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin])

  // Not logged in or no administrator privileges - Show loading screen waiting for redirect
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying permissions, redirecting...</p>
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
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "teachers", label: "Teacher Management", icon: GraduationCap },
    { id: "events", label: "Event Management", icon: Calendar },
    { id: "resources", label: "Resource Management", icon: FileText },
    { id: "parents", label: "Parent Information", icon: Users },
    { id: "settings", label: "System Settings", icon: Settings },
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
                  KCISLK ESID Info Hub - Admin Center
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || user?.firstName || user?.email}
                </p>
                <p className="text-xs text-gray-600">Administrator</p>
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
                Logout
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
                      <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                      <p className="text-gray-600 mt-1">System status and important information</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update Data
                    </Button>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Total Teachers</p>
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
                            <p className="text-green-600 text-sm font-medium">Active Parents</p>
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
                            <p className="text-purple-600 text-sm font-medium">Total Events</p>
                            <p className="text-2xl font-bold text-purple-800">28</p>
                          </div>
                          <Calendar className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-600 text-sm font-medium">Total Announcements</p>
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
                              <p className="text-cyan-600 text-sm font-medium">Published</p>
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
                              <p className="text-amber-600 text-sm font-medium">Draft</p>
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
                              <p className="text-red-600 text-sm font-medium">High Priority</p>
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
                              <p className="text-teal-600 text-sm font-medium">Archived</p>
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
                        Recent Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">New Teacher Announcement</p>
                            <p className="text-sm text-gray-600">Staff Meeting Tomorrow - 2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Parent Newsletter Published</p>
                            <p className="text-sm text-gray-600">January Newsletter - 15 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Event Management System</p>
                            <p className="text-sm text-gray-600">Event management features online - 5 minutes ago</p>
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
                  {/* Announcement Form Modal */}
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
                      <h2 className="text-3xl font-bold text-gray-900">Announcement Management</h2>
                      <p className="text-gray-600 mt-1">Manage all announcements and notifications</p>
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
                        Reload
                      </Button>
                      <Button 
                        onClick={handleCreateAnnouncement}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                      </Button>
                    </div>
                  </div>

                  {/* Announcement Statistics Cards */}
                  {announcementStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-medium">Total Announcements</p>
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
                              <p className="text-green-600 text-sm font-medium">Published</p>
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
                              <p className="text-amber-600 text-sm font-medium">Draft</p>
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
                              <p className="text-red-600 text-sm font-medium">High Priority</p>
                              <p className="text-xl font-bold text-red-800">{announcementStats.byPriority.high}</p>
                            </div>
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Announcement List */}
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

              {activeTab === "events" && (
                <motion.div
                  key="events"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Event Management</h2>
                      <p className="text-gray-600 mt-1">Manage all school activities and events</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/admin/events">
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          Enter Event Management
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Event Overview Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-indigo-600 text-sm font-medium">Total Events</p>
                            <p className="text-2xl font-bold text-indigo-800">28</p>
                          </div>
                          <Calendar className="w-8 h-8 text-indigo-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 text-sm font-medium">Published</p>
                            <p className="text-2xl font-bold text-emerald-800">23</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-600 text-sm font-medium">In Progress</p>
                            <p className="text-2xl font-bold text-amber-800">3</p>
                          </div>
                          <Play className="w-8 h-8 text-amber-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-violet-600 text-sm font-medium">Total Registrations</p>
                            <p className="text-2xl font-bold text-violet-800">156</p>
                          </div>
                          <Users className="w-8 h-8 text-violet-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        Recent Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-blue-800">Coffee with Principal - Grades 1-2</h4>
                              <Badge variant="outline" className="text-xs">Meeting</Badge>
                            </div>
                            <p className="text-sm text-blue-600 mb-2">Face-to-face communication with parents to discuss student learning progress</p>
                            <div className="flex items-center text-xs text-blue-500 gap-4">
                              <span>📅 2025-02-15</span>
                              <span>🕰️ 14:00-15:30</span>
                              <span>📍 Conference Room A</span>
                              <span>👥 12/20 registered</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Published</Badge>
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-purple-800">International Culture Day</h4>
                              <Badge variant="outline" className="text-xs">Cultural Event</Badge>
                            </div>
                            <p className="text-sm text-purple-600 mb-2">Celebrate multiculturalism and learn about the characteristics and traditions of different countries</p>
                            <div className="flex items-center text-xs text-purple-500 gap-4">
                              <span>📅 2025-02-28</span>
                              <span>🕰️ 09:00-15:00</span>
                              <span>📍 School Main Hall</span>
                              <span>👥 Whole school participation</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700">Planning</Badge>
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-green-800">Spring Sports Day</h4>
                              <Badge variant="outline" className="text-xs">Sports Event</Badge>
                            </div>
                            <p className="text-sm text-green-600 mb-2">Whole school celebration, showcasing sportsmanship and teamwork</p>
                            <div className="flex items-center text-xs text-green-500 gap-4">
                              <span>📅 2025-04-20</span>
                              <span>🕰️ 08:00-12:00</span>
                              <span>📍 School Sports Field</span>
                              <span>👥 Whole school participation</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/events">
                          <Button variant="outline" className="h-20 w-full flex flex-col hover:bg-purple-50">
                            <Plus className="w-6 h-6 mb-2 text-purple-600" />
                            New Event
                          </Button>
                        </Link>
                        <Button variant="outline" className="h-20 flex flex-col hover:bg-blue-50">
                          <Users className="w-6 h-6 mb-2 text-blue-600" />
                          Manage Registrations
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col hover:bg-green-50">
                          <Download className="w-6 h-6 mb-2 text-green-600" />
                          Export Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "resources" && (
                <motion.div
                  key="resources"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Resource Management</h2>
                      <p className="text-gray-600 mt-1">Manage learning resources, file uploads and categories</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/admin/resources">
                        <Button className="bg-gradient-to-r from-green-600 to-green-700">
                          <FileText className="w-4 h-4 mr-2" />
                          Enter Resource Management
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Resource Overview Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 text-sm font-medium">Total Resources</p>
                            <p className="text-2xl font-bold text-emerald-800">156</p>
                          </div>
                          <FileText className="w-8 h-8 text-emerald-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">PDF Files</p>
                            <p className="text-2xl font-bold text-blue-800">89</p>
                          </div>
                          <Download className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Video Resources</p>
                            <p className="text-2xl font-bold text-purple-800">34</p>
                          </div>
                          <Play className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-600 text-sm font-medium">Interactive Content</p>
                            <p className="text-2xl font-bold text-amber-800">33</p>
                          </div>
                          <BookOpen className="w-8 h-8 text-amber-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resource statistics by grade level */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                        Grade-wise Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <h4 className="font-semibold text-blue-800 mb-2">Grades 1-2</h4>
                            <p className="text-2xl font-bold text-blue-600">52</p>
                            <p className="text-sm text-blue-500">resources</p>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="text-center">
                            <h4 className="font-semibold text-green-800 mb-2">Grades 3-4</h4>
                            <p className="text-2xl font-bold text-green-600">58</p>
                            <p className="text-sm text-green-500">resources</p>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="text-center">
                            <h4 className="font-semibold text-purple-800 mb-2">Grades 5-6</h4>
                            <p className="text-2xl font-bold text-purple-600">46</p>
                            <p className="text-sm text-purple-500">resources</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent resource activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                        Recent Resource Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-emerald-800">Math Practice Book - Grade 3</h4>
                              <Badge variant="outline" className="text-xs">PDF</Badge>
                            </div>
                            <p className="text-sm text-emerald-600 mb-2">Added new third-grade math practice materials</p>
                            <div className="flex items-center text-xs text-emerald-500 gap-4">
                              <span>📁 Learning Materials</span>
                              <span>👤 Teacher Wang</span>
                              <span>⏰ 2 hours ago</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Published</Badge>
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-blue-800">English Reading Video Series</h4>
                              <Badge variant="outline" className="text-xs">Video</Badge>
                            </div>
                            <p className="text-sm text-blue-600 mb-2">Uploaded new English reading demonstration videos</p>
                            <div className="flex items-center text-xs text-blue-500 gap-4">
                              <span>📁 Language Learning</span>
                              <span>👤 Teacher Lin</span>
                              <span>⏰ 5 hours ago</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-purple-800">Science Experiment Interactive Tools</h4>
                              <Badge variant="outline" className="text-xs">Interactive</Badge>
                            </div>
                            <p className="text-sm text-purple-600 mb-2">Added virtual science experiment interactive learning tools</p>
                            <div className="flex items-center text-xs text-purple-500 gap-4">
                              <span>📁 Science Education</span>
                              <span>👤 Teacher Chen</span>
                              <span>⏰ 1 day ago</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Published</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href="/admin/resources">
                          <Button variant="outline" className="h-20 w-full flex flex-col hover:bg-green-50">
                            <Plus className="w-6 h-6 mb-2 text-green-600" />
                            Add Resource
                          </Button>
                        </Link>
                        <Button variant="outline" className="h-20 flex flex-col hover:bg-blue-50">
                          <Folder className="w-6 h-6 mb-2 text-blue-600" />
                          Category Management
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col hover:bg-purple-50">
                          <Upload className="w-6 h-6 mb-2 text-purple-600" />
                          Bulk Upload
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col hover:bg-orange-50">
                          <Download className="w-6 h-6 mb-2 text-orange-600" />
                          Export List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                      <h2 className="text-3xl font-bold text-gray-900">Parent Information Management</h2>
                      <p className="text-gray-600 mt-1">Manage parent communications and activity information</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      New Content
                    </Button>
                  </div>

                  {/* Parent Newsletters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        Parent Newsletters
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
                                    {newsletter.status === 'published' ? 'Published' : 'Draft'}
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
                        Parent Events
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
                                    {event.type === 'meeting' ? 'Meeting' : 'Event'}
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
                    <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
                    <p className="text-gray-600 mt-1">System configuration and account management</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Profile Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input 
                            id="displayName" 
                            defaultValue={user?.displayName || ''} 
                            placeholder="Enter display name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
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
                          Save Changes
                        </Button>
                      </CardContent>
                    </Card>

                    {/* System Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>System Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="siteName">Website Name</Label>
                          <Input 
                            id="siteName" 
                            defaultValue="KCISLK ESID Info Hub" 
                            placeholder="Enter website name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="maintenanceMode" />
                            <Label htmlFor="maintenanceMode">Enable maintenance mode</Label>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          <Save className="w-4 h-4 mr-2" />
                          Update Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Users className="w-6 h-6 mb-2" />
                          User Management
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Download className="w-6 h-6 mb-2" />
                          Data Export
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <RefreshCw className="w-6 h-6 mb-2" />
                          Clear Cache
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