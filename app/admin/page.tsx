/**
 * Enhanced Admin Page - KCISLK ESID Info Hub
 * Integrated design with real authentication system
 */

'use client'

import type React from 'react'
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
  ExternalLink,
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
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface Announcement {
  id: string
  title: string
  content: string
  summary?: string
  targetAudience: 'teachers' | 'parents' | 'all'
  priority: 'high' | 'medium' | 'low'
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  expiresAt?: string
  author: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
}

interface Event {
  id: string
  title: string
  description?: string
  eventType: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  location?: string
  maxParticipants?: number
  registrationRequired: boolean
  registrationDeadline?: string
  targetGrades?: string[]
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  creator: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
}

interface DashboardStats {
  totalTeachers: number
  totalParents: number
  activePosts: number
  systemHealth: string
}

export default function AdminPage() {
  const { user, isLoading, isAuthenticated, logout, isAdmin, redirectToLogin } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  // Real data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalParents: 0,
    activePosts: 0,
    systemHealth: '98%'
  })

  // Check authentication and permissions - Automatically redirect to login page
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      redirectToLogin('/admin')
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin])

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      setDataLoading(true)
      const response = await fetch('/api/admin/announcements?limit=10', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnnouncements(data.announcements || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
      setError('Failed to load announcements')
    } finally {
      setDataLoading(false)
    }
  }, [])

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    try {
      setDataLoading(true)
      const response = await fetch('/api/admin/events?limit=10', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvents(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setError('Failed to load events')
    } finally {
      setDataLoading(false)
    }
  }, [])

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      // Mock stats for now - can be enhanced with real API
      setDashboardStats({
        totalTeachers: 45,
        totalParents: 320,
        activePosts: announcements.length + events.length,
        systemHealth: '98%'
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  }, [announcements.length, events.length])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchAnnouncements()
      fetchEvents()
    }
  }, [isAuthenticated, isAdmin])

  // Update stats when data changes
  useEffect(() => {
    fetchDashboardStats()
  }, [announcements.length, events.length])

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Mock data for Teachers reminders (temporary - to be replaced with real API)
  const teachersReminders = [
    {
      id: 1,
      title: 'Grade Submission Deadline',
      content: 'Submit all semester grades by Friday 5 PM',
      date: '2025-02-01',
      status: 'active' as const,
    },
    {
      id: 2,
      title: 'Parent Conference Week',
      content: 'Schedule your parent conferences for next week',
      date: '2025-02-05',
      status: 'pending' as const,
    },
    {
      id: 3,
      title: 'Curriculum Planning Meeting',
      content: 'Department heads meeting completed',
      date: '2025-01-28',
      status: 'completed' as const,
    },
  ]

  // Legacy mock data for newsletters (can be replaced with real API later)
  const [parentsData] = useState({
    newsletters: [
      {
        id: 1,
        title: 'February Newsletter',
        content: 'Monthly updates, upcoming events, and important announcements',
        date: '2025-02-01',
        status: 'published' as const,
      },
      {
        id: 2,
        title: 'March Newsletter',
        content: 'Spring activities, academic updates, and community news',
        date: '2025-03-01',
        status: 'draft' as const,
      },
    ],
    events: [
      {
        id: 1,
        title: 'Coffee with Principal',
        content: 'Monthly parent meeting with Principal Chen - February session',
        date: '2025-02-10',
        type: 'meeting' as const,
      },
      {
        id: 2,
        title: 'International Culture Day',
        content: 'Annual cultural celebration event with performances and exhibitions',
        date: '2025-02-28',
        type: 'event' as const,
      },
      {
        id: 3,
        title: 'Science Fair',
        content: 'Student science project presentations and awards ceremony',
        date: '2025-03-15',
        type: 'activity' as const,
      },
    ],
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      // Redirect will happen automatically via useAuth
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
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
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, return null (redirect will happen automatically)
  if (!isAuthenticated || !isAdmin()) {
    return null
  }

  // Main authenticated admin interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">
                  ESID Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">Content Management System</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </div>
              )}
              <Badge variant="outline" className="text-green-600 border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Admin
              </Badge>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          className="w-64 bg-white/80 backdrop-blur-lg shadow-lg border-r border-white/20 min-h-screen"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <nav className="p-4">
            <div className="space-y-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                { id: 'teachers', name: "Teachers' Corner", icon: GraduationCap },
                { id: 'parents', name: "Parents' Corner", icon: Sparkles },
                { id: 'users', name: 'User Management', icon: Users },
                { id: 'settings', name: 'Settings', icon: Settings },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-800 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </motion.button>
              ))}
            </div>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">Monitor and manage both Teachers' and Parents' Corner systems</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { title: 'Total Teachers', value: dashboardStats.totalTeachers.toString(), icon: GraduationCap, color: 'blue' },
                    { title: 'Total Parents', value: dashboardStats.totalParents.toString(), icon: Users, color: 'purple' },
                    { title: 'Active Posts', value: dashboardStats.activePosts.toString(), icon: MessageSquare, color: 'green' },
                    { title: 'System Health', value: dashboardStats.systemHealth, icon: BarChart3, color: 'orange' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className="p-3 rounded-full bg-indigo-100">
                              <stat.icon className="w-6 h-6 text-indigo-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Teachers' Corner Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          className="w-full justify-start bg-transparent"
                          variant="outline"
                          onClick={() => setActiveTab('teachers')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Manage Announcements
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Update Calendar
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Manage Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Parents' Corner Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          className="w-full justify-start bg-transparent"
                          variant="outline"
                          onClick={() => setActiveTab('parents')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Newsletter
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Manage Events
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Update News Board
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Links */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Teachers' Corner</h4>
                            <p className="text-gray-600 text-sm">Access the teachers' platform</p>
                          </div>
                          <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                        <Link href="/teachers">
                          <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Teachers' Corner
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Parents' Corner</h4>
                            <p className="text-gray-600 text-sm">Access the parents' platform</p>
                          </div>
                          <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <Link href="/">
                          <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Parents' Corner
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'teachers' && (
              <motion.div
                key="teachers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Teachers' Corner Management</h2>
                  <p className="text-gray-600">Manage content for the teachers' platform</p>
                </div>

                <div className="grid gap-8">
                  {/* Announcements Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-600" />
                        Announcements
                      </CardTitle>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dataLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : announcements.filter(a => a.targetAudience === 'teachers' || a.targetAudience === 'all').length > 0 ? (
                          announcements
                            .filter(a => a.targetAudience === 'teachers' || a.targetAudience === 'all')
                            .slice(0, 5)
                            .map((announcement) => (
                              <div
                                key={announcement.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                  <p className="text-sm text-gray-600">{announcement.summary || announcement.content.substring(0, 100) + '...'}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant={
                                        announcement.priority === 'high'
                                          ? 'destructive'
                                          : announcement.priority === 'medium'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {announcement.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                      {announcement.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{formatDate(announcement.createdAt)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No teacher announcements found</p>
                            <p className="text-sm">Create your first announcement to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reminders Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        Reminders
                      </CardTitle>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reminder
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {teachersReminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                              <p className="text-sm text-gray-600">{reminder.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant={
                                    reminder.status === 'active'
                                      ? 'default'
                                      : reminder.status === 'completed'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {reminder.status}
                                </Badge>
                                <span className="text-xs text-gray-500">{reminder.date}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'parents' && (
              <motion.div
                key="parents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Parents' Corner Management</h2>
                  <p className="text-gray-600">Manage content for the parents' platform</p>
                </div>

                <div className="grid gap-8">
                  {/* Newsletter Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Newsletters
                      </CardTitle>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Newsletter
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {parentsData.newsletters.map((newsletter) => (
                          <div
                            key={newsletter.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{newsletter.title}</h4>
                              <p className="text-sm text-gray-600">{newsletter.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={newsletter.status === 'published' ? 'default' : 'secondary'}>
                                  {newsletter.status}
                                </Badge>
                                <span className="text-xs text-gray-500">{newsletter.date}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Events Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Events
                      </CardTitle>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dataLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : events.length > 0 ? (
                          events.slice(0, 5).map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-600">{event.description?.substring(0, 100) + '...' || 'No description'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{event.eventType}</Badge>
                                  <Badge variant={
                                    event.status === 'published' ? 'default' :
                                    event.status === 'completed' ? 'secondary' :
                                    event.status === 'cancelled' ? 'destructive' : 'outline'
                                  }>
                                    {event.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{formatDate(event.startDate)}</span>
                                  {event.location && (
                                    <span className="text-xs text-gray-500">📍 {event.location}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No events found</p>
                            <p className="text-sm">Create your first event to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>

                <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        System Users
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                        <Button size="sm" variant="outline">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">User management interface</p>
                      <p className="text-sm">Connect to the real user management API to display and manage users</p>
                      <Button variant="outline" className="mt-4" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Load Users
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h2>
                  <p className="text-gray-600">Configure system preferences and options</p>
                </div>

                <div className="grid gap-6">
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input id="siteName" defaultValue="KCISLK ESID Info Hub" />
                        </div>
                        <div>
                          <Label htmlFor="adminEmail">Admin Email</Label>
                          <Input id="adminEmail" type="email" defaultValue="admin@kcislk.ntpc.edu.tw" />
                        </div>
                        <div>
                          <Label htmlFor="description">Site Description</Label>
                          <Textarea
                            id="description"
                            defaultValue="KCISLK Elementary School International Department management portal"
                          />
                        </div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input id="sessionTimeout" type="number" defaultValue="30" />
                        </div>
                        <div>
                          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                          <Input id="maxLoginAttempts" type="number" defaultValue="5" />
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Update Security
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}