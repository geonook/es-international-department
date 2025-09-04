'use client'

/**
 * Admin Dashboard Component with Real Authentication
 * Administrator Dashboard Component - Using Real Authentication
 * Updated: 2025-09-02T07:24:00Z - Separated Teachers' Corner & Parents' Corner System
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
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import AnnouncementList from '@/components/AnnouncementList'
import CommunicationForm from '@/components/admin/CommunicationForm'
import { 
  Announcement, 
  AnnouncementFormData, 
  AnnouncementFilters, 
  PaginationInfo, 
  AnnouncementStats,
  ApiResponse,
  AnnouncementListResponse,
  BulkAnnouncementOperation,
  BulkAnnouncementResult
} from '@/lib/types'

// Using separated Teachers' Corner and Parents' Corner architecture

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, logout, isAdmin, redirectToLogin, checkAuth } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0)
  const [showGracePeriod, setShowGracePeriod] = useState(false)

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
  // Removed: Unified Communications system state variables
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')
  const [showCommunicationForm, setShowCommunicationForm] = useState(false)
  const [editingCommunication, setEditingCommunication] = useState<Announcement | null>(null)
  const [communicationMode, setCommunicationMode] = useState<'create' | 'edit'>('create')
  const [communicationType, setCommunicationType] = useState<'announcement' | 'message' | 'newsletter' | 'reminder'>('announcement')
  
  // Batch operations state
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)
  const [bulkOperationError, setBulkOperationError] = useState<string>('')
  const [bulkOperationSuccess, setBulkOperationSuccess] = useState<string>('')

  // Fetch announcement list
  const fetchAnnouncements = useCallback(async (newFilters?: AnnouncementFilters, page?: number) => {
    setAnnouncementsLoading(true)
    setAnnouncementsError('')
    
    try {
      const currentFilters = newFilters || {
        targetAudience: 'all',
        priority: undefined,
        status: undefined,
        search: ''
      }
      const currentPage = page || 1
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
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
      
      const response = await fetch(`/api/admin/announcements?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAnnouncements(data.data?.announcements || [])
        setPagination(data.data?.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        })
        setFilters(currentFilters)
        
        // Calculate statistics
        calculateStats(data.data?.announcements || [])
      } else {
        throw new Error(data.message || 'Failed to fetch announcements')
      }
    } catch (error) {
      console.error('Fetch announcements error:', error)
      setAnnouncementsError(error instanceof Error ? error.message : 'An error occurred while loading announcements')
    } finally {
      setAnnouncementsLoading(false)
    }
  }, [])

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

  // Removed: createCommunication - replaced with separated Teachers' Corner management

  // Removed: updateCommunication - replaced with separated Teachers' Corner management

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


  // Handle creating new communication
  const handleCreateCommunication = (type: 'announcement' | 'message' | 'newsletter' | 'reminder' = 'announcement') => {
    setCommunicationType(type)
    setCommunicationMode('create')
    setEditingCommunication(null)
    setShowCommunicationForm(true)
  }

  // Handle editing communication
  const handleEditCommunication = (announcement: Announcement) => {
    setEditingCommunication(announcement)
    setCommunicationMode('edit')
    setCommunicationType((announcement as any).type || 'announcement')
    setShowCommunicationForm(true)
  }

  // Handle form submission
  const handleCommunicationSubmit = async (data: any) => {
    try {
      const endpoint = communicationMode === 'create' 
        ? '/api/admin/announcements'
        : `/api/announcements/${editingCommunication?.id}`
      
      const method = communicationMode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(endpoint, {
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
        // Refresh the announcements list
        await fetchAnnouncements()
        setShowCommunicationForm(false)
      } else {
        throw new Error(result.message || 'Failed to save communication')
      }
    } catch (error) {
      console.error('Communication submit error:', error)
      throw error // Re-throw to let form handle the error
    }
  }

  // Handle form cancel
  const handleCommunicationCancel = () => {
    setShowCommunicationForm(false)
    setEditingCommunication(null)
  }

  // Removed: handleFormCancel - no longer needed with separated architecture

  // Removed: handleFormSubmit - replaced with separated Teachers' Corner management

  // Handle filters change
  const handleFiltersChange = (newFilters: AnnouncementFilters) => {
    setFilters(newFilters)
    fetchAnnouncements(newFilters, 1) // Reset to first page
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchAnnouncements(filters, page)
  }

  // Handle bulk operations
  const handleBulkOperation = async (operation: BulkAnnouncementOperation) => {
    setBulkOperationLoading(true)
    setBulkOperationError('')
    setBulkOperationSuccess('')
    
    try {
      const response = await fetch('/api/announcements/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operation)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        const { totalProcessed, totalSuccess, totalFailed } = result.data
        
        // Show success message
        setBulkOperationSuccess(
          `Bulk operation completed! Successfully processed ${totalSuccess}/${totalProcessed} items, ${totalFailed} failed`
        )
        
        // Refresh the announcements list
        await fetchAnnouncements()
        
        // Clear success message after 5 seconds
        setTimeout(() => setBulkOperationSuccess(''), 5000)
      } else {
        throw new Error(result.message || 'Bulk operation failed')
      }
    } catch (error) {
      console.error('Bulk operation error:', error)
      setBulkOperationError(
        error instanceof Error ? error.message : 'An error occurred during bulk operation'
      )
    } finally {
      setBulkOperationLoading(false)
    }
  }

  // Events management state
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState('')

  // Fetch events data
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true)
    setEventsError('')
    
    try {
      const response = await fetch('/api/admin/events')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setEvents(result.data || [])
      } else {
        throw new Error(result.message || 'Failed to fetch events')
      }
    } catch (error) {
      console.error('Fetch events error:', error)
      setEventsError(error instanceof Error ? error.message : 'An error occurred while loading events')
    } finally {
      setEventsLoading(false)
    }
  }, [])

  // Initial load announcements and events
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      if (activeTab === 'communications') {
        fetchAnnouncements()
      } else if (activeTab === 'events') {
        fetchEvents()
      }
    }
  }, [isAuthenticated, activeTab, isAdmin, fetchAnnouncements, fetchEvents])

  // Enhanced authentication check with Grace Period and retry logic
  useEffect(() => {
    const handleAuthCheck = async () => {
      // Skip if still loading or already authenticated as admin
      if (isLoading || (isAuthenticated && isAdmin())) {
        setShowGracePeriod(false)
        return
      }

      // If not authenticated, give it some grace period before redirecting
      if (!isAuthenticated && authCheckAttempts < 2) {
        setShowGracePeriod(true)
        setAuthCheckAttempts(prev => prev + 1)
        
        // Wait a bit and try to re-check auth (maybe token refresh is in progress)
        setTimeout(async () => {
          const user = await checkAuth()
          if (!user || !isAdmin()) {
            // After grace period, redirect to login
            redirectToLogin('/admin')
          } else {
            setShowGracePeriod(false)
          }
        }, 2000) // 2 second grace period
        
        return
      }

      // If authenticated but not admin, redirect immediately
      if (isAuthenticated && !isAdmin()) {
        redirectToLogin('/admin')
        return
      }

      // Final fallback - redirect if not authenticated after retries
      if (!isAuthenticated) {
        redirectToLogin('/admin')
      }
    }

    handleAuthCheck()
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin, checkAuth, authCheckAttempts])

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
    ]
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


  // Not logged in or no administrator privileges - Show appropriate loading or grace period screen
  if (isLoading || (!isAuthenticated || !isAdmin())) {
    const message = showGracePeriod 
      ? "Verifying authentication, please wait..."
      : isLoading 
        ? "Loading..."
        : "Checking permissions..."
    
    const showRetryButton = showGracePeriod && authCheckAttempts >= 1

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 mb-4">{message}</p>
            
            {showGracePeriod && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 mb-4"
              >
                Attempting to refresh authentication automatically...
              </motion.div>
            )}

            {showRetryButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => window.location.href = '/login?redirect=%2Fadmin'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </motion.button>
            )}
          </div>
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
    // Removed: Communications Hub - replaced with separated Teachers' Corner & Parents' Corner
    { id: "events", label: "Event Management", icon: Calendar },
    { id: "resources", label: "Resource Management", icon: FileText },
    { id: "users", label: "User Management", icon: Users },
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
                            <p className="text-blue-600 text-sm font-medium">Total Communications</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {announcementStats?.total || 0}
                            </p>
                          </div>
                          <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Active Users</p>
                            <p className="text-2xl font-bold text-green-800">367</p>
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
                            <p className="text-orange-600 text-sm font-medium">System Health</p>
                            <p className="text-2xl font-bold text-orange-800">98%</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Access Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Communications Management */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('communications')}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                            Communications Management
                          </div>
                          <Badge>Unified</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Manage Announcements</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Update Messages</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Send Reminders</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setActiveTab('communications')}>
                          Manage Teachers Corner
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Event Management */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('events')}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                            Event Management
                          </div>
                          <Badge variant="outline">28 Active</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Manage Events</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Track Registrations</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Send Notifications</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => setActiveTab('events')}>
                          Open Event Management
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

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
                            <p className="font-medium">New Communication Posted</p>
                            <p className="text-sm text-gray-600">Important announcement from Vickie - 2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">System Update Complete</p>
                            <p className="text-sm text-gray-600">Teachers Corner & Parents Corner separated successfully - 15 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Event Registration Open</p>
                            <p className="text-sm text-gray-600">Coffee with Principal - Grades 1-2 - 5 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "communications" && (
                <motion.div
                  key="communications"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Communications Management</h2>
                      <p className="text-gray-600 mt-1">Manage Teachers' Corner and Parents' Corner communication systems</p>
                    </div>
                  </div>

                  {/* Separated Communications Systems */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-blue-800">
                          <MessageSquare className="w-6 h-6" />
                          Teachers' Corner
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Manage teacher communications, messages, reminders, and announcements.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.location.href = '/teachers/communications'}
                            className="bg-gradient-to-r from-blue-600 to-blue-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Board
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = '/teachers/reminders'}
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Reminders
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-purple-800">
                          <Users className="w-6 h-6" />
                          Parents' Corner
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Manage parent communications, newsletters, and community updates.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.location.href = '/parents'}
                            className="bg-gradient-to-r from-purple-600 to-purple-700"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Parents Corner
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('newsletters')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Newsletters
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>


                  {/* Bulk Operation Status Messages */}
                  {bulkOperationSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {bulkOperationSuccess}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {bulkOperationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {bulkOperationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Communication Management Tabs */}
                  <div className="bg-white rounded-lg border">
                    <div className="border-b border-gray-200">
                      <div className="flex items-center justify-between p-4">
                        <h3 className="text-lg font-semibold">Communication Management</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCreateCommunication('announcement')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            New Announcement
                          </Button>
                          <Button
                            onClick={() => handleCreateCommunication('message')}
                            variant="outline"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            New Message Board
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-blue-800 mb-1">Announcements</h4>
                            <p className="text-2xl font-bold text-blue-600">{announcementStats?.total || 0}</p>
                            <p className="text-xs text-blue-500">System announcements</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-green-800 mb-1">Published</h4>
                            <p className="text-2xl font-bold text-green-600">{announcementStats?.published || 0}</p>
                            <p className="text-xs text-green-500">Live communications</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-amber-800 mb-1">Drafts</h4>
                            <p className="text-2xl font-bold text-amber-600">{announcementStats?.draft || 0}</p>
                            <p className="text-xs text-amber-500">Work in progress</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-red-800 mb-1">High Priority</h4>
                            <p className="text-2xl font-bold text-red-600">{announcementStats?.byPriority.high || 0}</p>
                            <p className="text-xs text-red-500">Urgent items</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Communication List */}
                      {announcementsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <AnnouncementList
                          announcements={announcements}
                          onEdit={handleEditCommunication}
                          onDelete={deleteAnnouncement}
                          filters={filters}
                          onFiltersChange={handleFiltersChange}
                          pagination={pagination}
                          onPageChange={handlePageChange}
                          onBulkOperation={handleBulkOperation}
                          bulkOperationLoading={bulkOperationLoading}
                          isAdmin={true}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Communication Form Modal */}
                  {showCommunicationForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                        <CommunicationForm
                          communication={editingCommunication}
                          mode={communicationMode}
                          defaultType={communicationType}
                          onCancel={handleCommunicationCancel}
                          onSubmit={handleCommunicationSubmit}
                        />
                      </div>
                    </div>
                  )}
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

              {activeTab === "users" && (
                <motion.div
                  key="users"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                      <p className="text-gray-600 mt-1">Manage users, permissions, and access control</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>

                  {/* User Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-blue-800">367</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Administrators</p>
                            <p className="text-2xl font-bold text-green-800">5</p>
                          </div>
                          <Shield className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Office Members</p>
                            <p className="text-2xl font-bold text-purple-800">20</p>
                          </div>
                          <GraduationCap className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-600 text-sm font-medium">Viewers</p>
                            <p className="text-2xl font-bold text-orange-800">342</p>
                          </div>
                          <Eye className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* User Management Interface */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          User Directory
                        </div>
                        <div className="flex items-center gap-2">
                          <Input placeholder="Search users..." className="w-64" />
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center py-12">
                        User management interface will be displayed here.
                        <br />
                        <Button className="mt-4" variant="outline">
                          Load User List
                        </Button>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Permission Upgrade Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-purple-600" />
                        Permission Upgrade Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">John Doe requested Office Member role</p>
                              <p className="text-sm text-gray-600">Current role: Viewer • Requested: 2 days ago</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
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