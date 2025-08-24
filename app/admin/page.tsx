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
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import UserList from '@/components/admin/UserList'
import UserForm from '@/components/admin/UserForm'
import { UserData } from '@/components/admin/UserCard'
import TeacherReminderForm from '@/components/admin/TeacherReminderForm'
import NewsletterForm from '@/components/admin/NewsletterForm'
import FeedbackForm from '@/components/admin/FeedbackForm'
import MessageBoardForm from '@/components/admin/MessageBoardForm'

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

interface TeacherReminder {
  id: number
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  dueDate?: string
  dueTime?: string
  targetAudience: string
  reminderType: string
  isRecurring: boolean
  recurringPattern?: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
}

interface Newsletter {
  id: number
  title: string
  content: string
  htmlContent?: string
  coverImageUrl?: string
  status: 'draft' | 'published' | 'archived'
  issueNumber?: number
  publicationDate?: string
  downloadCount: number
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
}

interface FeedbackFormData {
  id: number
  subject: string
  message: string
  category?: string
  priority: 'low' | 'medium' | 'high'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  isAnonymous: boolean
  authorName?: string
  authorEmail?: string
  assignedTo?: string
  response?: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  assignee?: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
}

interface MessageBoardData {
  id: number
  title: string
  content: string
  boardType: 'teachers' | 'parents' | 'general'
  isPinned: boolean
  status: 'active' | 'closed' | 'archived'
  replyCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  replies?: Array<{
    id: number
    content: string
    createdAt: string
    author?: {
      id: string
      email: string
      displayName?: string
      firstName?: string
      lastName?: string
    }
  }>
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
  const [users, setUsers] = useState<UserData[]>([])
  const [teacherReminders, setTeacherReminders] = useState<TeacherReminder[]>([])
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [feedbackForms, setFeedbackForms] = useState<FeedbackFormData[]>([])
  const [messageBoardPosts, setMessageBoardPosts] = useState<MessageBoardData[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalParents: 0,
    activePosts: 0,
    systemHealth: '98%'
  })

  // User management states
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  })

  // Teacher reminders management states
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<TeacherReminder | null>(null)
  const [isReminderLoading, setIsReminderLoading] = useState(false)
  
  // Newsletter management states
  const [showNewsletterForm, setShowNewsletterForm] = useState(false)
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null)
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false)
  
  // Feedback management states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<FeedbackFormData | null>(null)
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false)
  
  // Message board management states
  const [showMessageBoardForm, setShowMessageBoardForm] = useState(false)
  const [editingMessageBoard, setEditingMessageBoard] = useState<MessageBoardData | null>(null)
  const [isMessageBoardLoading, setIsMessageBoardLoading] = useState(false)

  // Check user permissions for different features
  const userRoles = user?.roles || []
  const userIsAdmin = userRoles.includes('admin')
  const userIsOfficeMember = userRoles.includes('office_member')
  const userIsViewer = userRoles.includes('viewer')
  
  // 權限級別：admin > office_member > viewer
  const canManageUsers = userIsAdmin
  const canManageSystem = userIsAdmin
  const canEditContent = userIsAdmin || userIsOfficeMember
  const canViewContent = userIsAdmin || userIsOfficeMember || userIsViewer

  // Check authentication only - 所有已認證用戶都可進入 admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin('/admin')
    }
    // 移除角色檢查 - 讓所有已認證用戶都能進入 admin
  }, [isLoading, isAuthenticated, redirectToLogin])

  // Prevent duplicate requests with separate flags
  const [isAnnouncementLoading, setIsAnnouncementLoading] = useState(false)
  const [isEventLoading, setIsEventLoading] = useState(false)
  const [isUserLoading, setIsUserLoading] = useState(false)

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    if (isAnnouncementLoading) return
    
    try {
      setIsAnnouncementLoading(true)
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
      setIsAnnouncementLoading(false)
    }
  }, [isAnnouncementLoading])

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    if (isEventLoading) return
    
    try {
      setIsEventLoading(true)
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
      setIsEventLoading(false)
    }
  }, [isEventLoading])

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

  // Fetch users from API
  // Fetch teacher reminders from API
  const fetchTeacherReminders = useCallback(async () => {
    if (isReminderLoading) return
    
    try {
      setIsReminderLoading(true)
      setDataLoading(true)
      const response = await fetch('/api/admin/reminders?limit=20', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTeacherReminders(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch teacher reminders:', error)
      setError('Failed to load teacher reminders')
    } finally {
      setDataLoading(false)
      setIsReminderLoading(false)
    }
  }, [isReminderLoading])
  
  // Fetch newsletters from API
  const fetchNewsletters = useCallback(async () => {
    if (isNewsletterLoading) return
    
    try {
      setIsNewsletterLoading(true)
      setDataLoading(true)
      const response = await fetch('/api/admin/newsletters?limit=20', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNewsletters(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
      setError('Failed to load newsletters')
    } finally {
      setDataLoading(false)
      setIsNewsletterLoading(false)
    }
  }, [isNewsletterLoading])
  
  // Fetch feedback forms from API
  const fetchFeedbackForms = useCallback(async () => {
    if (isFeedbackLoading) return
    
    try {
      setIsFeedbackLoading(true)
      setDataLoading(true)
      const response = await fetch('/api/admin/feedback?limit=20', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFeedbackForms(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch feedback forms:', error)
      setError('Failed to load feedback forms')
    } finally {
      setDataLoading(false)
      setIsFeedbackLoading(false)
    }
  }, [isFeedbackLoading])
  
  // Fetch message board posts from API
  const fetchMessageBoardPosts = useCallback(async () => {
    if (isMessageBoardLoading) return
    
    try {
      setIsMessageBoardLoading(true)
      setDataLoading(true)
      const response = await fetch('/api/admin/messages?limit=20', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessageBoardPosts(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch message board posts:', error)
      setError('Failed to load message board posts')
    } finally {
      setDataLoading(false)
      setIsMessageBoardLoading(false)
    }
  }, [isMessageBoardLoading])

  const fetchUsers = useCallback(async () => {
    if (isUserLoading) return
    
    try {
      setIsUserLoading(true)
      setDataLoading(true)
      
      const queryParams = new URLSearchParams({
        page: userPagination.page.toString(),
        limit: userPagination.limit.toString(),
        ...(userSearchQuery && { search: userSearchQuery }),
        ...(userRoleFilter && { role: userRoleFilter })
      })
      
      const response = await fetch(`/api/admin/users?${queryParams}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data.users || [])
          setUserPagination(data.data.pagination)
        }
      } else {
        setError('Failed to load users')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users')
    } finally {
      setDataLoading(false)
      setIsUserLoading(false)
    }
  }, [isUserLoading, userPagination.page, userPagination.limit, userSearchQuery, userRoleFilter])

  // User management functions
  const handleAddUser = () => {
    setEditingUser(null)
    setShowUserForm(true)
  }

  const handleEditUser = (user: UserData) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchUsers() // Refresh users list
      } else {
        setError('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      setError('Failed to delete user')
    } finally {
      setDataLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle_status',
          value: isActive
        })
      })

      if (response.ok) {
        fetchUsers() // Refresh users list
      } else {
        setError('Failed to update user status')
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      setError('Failed to update user status')
    } finally {
      setDataLoading(false)
    }
  }

  const handleManageUserRoles = (user: UserData) => {
    // For now, redirect to edit form
    handleEditUser(user)
  }

  const handleApproveUser = async (userId: string) => {
    if (!confirm('確定要批准這個用戶嗎？將會為其分配 Office Member 角色。')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          role: 'office_member' // 預設分配 office_member 角色
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // 刷新用戶列表
        await fetchUsers()
        // 顯示成功訊息（可選）
        console.log('User approved successfully:', data.message)
      } else {
        setError(data.message || 'Failed to approve user')
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
      setError('Failed to approve user')
    } finally {
      setDataLoading(false)
    }
  }

  const handleRejectUser = async (userId: string) => {
    if (!confirm('確定要拒絕這個用戶嗎？用戶資料將被永久刪除。')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // 刷新用戶列表
        await fetchUsers()
        // 顯示成功訊息（可選）
        console.log('User rejected successfully:', data.message)
      } else {
        setError(data.message || 'Failed to reject user')
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
      setError('Failed to reject user')
    } finally {
      setDataLoading(false)
    }
  }

  const handleUserFormSubmit = async (formData: any) => {
    try {
      setDataLoading(true)
      
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}` 
        : '/api/admin/users'
      
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowUserForm(false)
        setEditingUser(null)
        fetchUsers() // Refresh users list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save user')
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      setError('Failed to save user')
    } finally {
      setDataLoading(false)
    }
  }

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query)
    setUserPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleUserRoleFilter = (role: string) => {
    setUserRoleFilter(role)
    setUserPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleUserPageChange = (page: number) => {
    setUserPagination(prev => ({ ...prev, page }))
  }

  // Teacher reminder management functions
  const handleAddReminder = () => {
    setEditingReminder(null)
    setShowReminderForm(true)
  }

  const handleEditReminder = (reminder: TeacherReminder) => {
    setEditingReminder(reminder)
    setShowReminderForm(true)
  }

  const handleDeleteReminder = async (reminderId: number) => {
    if (!confirm('Are you sure you want to delete this reminder? This action cannot be undone.')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/reminders/${reminderId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchTeacherReminders() // Refresh reminders list
      } else {
        setError('Failed to delete reminder')
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      setError('Failed to delete reminder')
    } finally {
      setDataLoading(false)
    }
  }

  const handleReminderFormSubmit = async (formData: any) => {
    try {
      setDataLoading(true)
      
      const url = editingReminder 
        ? `/api/admin/reminders/${editingReminder.id}` 
        : '/api/admin/reminders'
      
      const method = editingReminder ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowReminderForm(false)
        setEditingReminder(null)
        fetchTeacherReminders() // Refresh reminders list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save reminder')
      }
    } catch (error) {
      console.error('Failed to save reminder:', error)
      setError('Failed to save reminder')
    } finally {
      setDataLoading(false)
    }
  }

  // Newsletter management functions
  const handleAddNewsletter = () => {
    setEditingNewsletter(null)
    setShowNewsletterForm(true)
  }

  const handleEditNewsletter = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter)
    setShowNewsletterForm(true)
  }

  const handleDeleteNewsletter = async (newsletterId: number) => {
    if (!confirm('Are you sure you want to delete this newsletter? This action cannot be undone.')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/newsletters/${newsletterId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchNewsletters() // Refresh newsletters list
      } else {
        setError('Failed to delete newsletter')
      }
    } catch (error) {
      console.error('Failed to delete newsletter:', error)
      setError('Failed to delete newsletter')
    } finally {
      setDataLoading(false)
    }
  }

  const handleNewsletterFormSubmit = async (formData: any) => {
    try {
      setDataLoading(true)
      
      const url = editingNewsletter 
        ? `/api/admin/newsletters/${editingNewsletter.id}` 
        : '/api/admin/newsletters'
      
      const method = editingNewsletter ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowNewsletterForm(false)
        setEditingNewsletter(null)
        fetchNewsletters() // Refresh newsletters list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save newsletter')
      }
    } catch (error) {
      console.error('Failed to save newsletter:', error)
      setError('Failed to save newsletter')
    } finally {
      setDataLoading(false)
    }
  }

  // Feedback management functions
  const handleAddFeedback = () => {
    setEditingFeedback(null)
    setShowFeedbackForm(true)
  }

  const handleEditFeedback = (feedback: FeedbackFormData) => {
    setEditingFeedback(feedback)
    setShowFeedbackForm(true)
  }

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchFeedbackForms() // Refresh feedback list
      } else {
        setError('Failed to delete feedback')
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error)
      setError('Failed to delete feedback')
    } finally {
      setDataLoading(false)
    }
  }

  const handleFeedbackFormSubmit = async (formData: any) => {
    try {
      setDataLoading(true)
      
      const url = editingFeedback 
        ? `/api/admin/feedback/${editingFeedback.id}` 
        : '/api/admin/feedback'
      
      const method = editingFeedback ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowFeedbackForm(false)
        setEditingFeedback(null)
        fetchFeedbackForms() // Refresh feedback list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save feedback')
      }
    } catch (error) {
      console.error('Failed to save feedback:', error)
      setError('Failed to save feedback')
    } finally {
      setDataLoading(false)
    }
  }

  // Message board management functions
  const handleAddMessageBoard = () => {
    setEditingMessageBoard(null)
    setShowMessageBoardForm(true)
  }

  const handleEditMessageBoard = (messageBoard: MessageBoardData) => {
    setEditingMessageBoard(messageBoard)
    setShowMessageBoardForm(true)
  }

  const handleDeleteMessageBoard = async (messageBoardId: number) => {
    if (!confirm('Are you sure you want to delete this message board post? This will also delete all replies.')) {
      return
    }

    try {
      setDataLoading(true)
      const response = await fetch(`/api/admin/messages/${messageBoardId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchMessageBoardPosts() // Refresh message board list
      } else {
        setError('Failed to delete message board post')
      }
    } catch (error) {
      console.error('Failed to delete message board post:', error)
      setError('Failed to delete message board post')
    } finally {
      setDataLoading(false)
    }
  }

  const handleMessageBoardFormSubmit = async (formData: any) => {
    try {
      setDataLoading(true)
      
      const url = editingMessageBoard 
        ? `/api/admin/messages/${editingMessageBoard.id}` 
        : '/api/admin/messages'
      
      const method = editingMessageBoard ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowMessageBoardForm(false)
        setEditingMessageBoard(null)
        fetchMessageBoardPosts() // Refresh message board list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save message board post')
      }
    } catch (error) {
      console.error('Failed to save message board post:', error)
      setError('Failed to save message board post')
    } finally {
      setDataLoading(false)
    }
  }

  // Load initial data when authenticated - 根據權限載入不同數據
  useEffect(() => {
    if (isAuthenticated && canViewContent) {
      // 所有用戶都可以查看公告和活動
      fetchAnnouncements()
      fetchEvents()
      
      // 只有管理員可以載入用戶管理數據
      if (canManageUsers) {
        fetchUsers()
      }
      
      // Load teacher reminders, newsletters, feedback forms, and message boards for all authenticated users
      fetchTeacherReminders()
      fetchNewsletters()
      fetchFeedbackForms()
      fetchMessageBoardPosts()
    }
  }, [isAuthenticated, canViewContent, canManageUsers]) // 基於權限控制數據載入

  // Refetch users when search/filter parameters change - 只有管理員可以搜尋用戶
  useEffect(() => {
    if (isAuthenticated && canManageUsers && (userSearchQuery || userRoleFilter || userPagination.page > 1)) {
      fetchUsers()
    }
  }, [userSearchQuery, userRoleFilter, userPagination.page, isAuthenticated, canManageUsers, fetchUsers])

  // Update stats when data changes - 根據權限載入統計數據
  useEffect(() => {
    if (isAuthenticated && canViewContent) {
      fetchDashboardStats()
    }
  }, [announcements.length, events.length, isAuthenticated, canViewContent])

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Teacher reminders data is now fetched from API

  // Legacy mock data for events (can be replaced with real API later)
  const [parentsData] = useState({
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
                // 所有用戶都可以看到 Teachers' Corner、Parents' Corner、Feedback 和 Message Board
                ...(canViewContent ? [
                  { id: 'teachers', name: "Teachers' Corner", icon: GraduationCap },
                  { id: 'parents', name: "Parents' Corner", icon: Sparkles },
                  { id: 'feedback', name: 'Feedback Management', icon: MessageSquare },
                  { id: 'messages', name: 'Message Board', icon: MessageCircle }
                ] : []),
                // 只有管理員可以看到用戶管理
                ...(canManageUsers ? [
                  { id: 'users', name: 'User Management', icon: Users }
                ] : []),
                // 只有管理員可以看到系統設置
                ...(canManageSystem ? [
                  { id: 'settings', name: 'Settings', icon: Settings }
                ] : [])
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
                  
                  {/* 權限升級請求提示 - 只對 viewer 用戶顯示 */}
                  {userIsViewer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Alert className="bg-blue-50 border-blue-200">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>Limited Access</strong> - You currently have viewer permissions.
                              <br />
                              Contact an administrator to request higher privileges for editing content.
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              Request Upgrade
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
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
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => window.location.href = '/admin/documents'}
                        >
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
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleAddReminder}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reminder
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isReminderLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : teacherReminders.length > 0 ? (
                          teacherReminders.map((reminder) => (
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
                                        : reminder.status === 'pending'
                                        ? 'outline'
                                        : 'destructive'
                                    }
                                  >
                                    {reminder.status}
                                  </Badge>
                                  <Badge
                                    variant={
                                      reminder.priority === 'urgent'
                                        ? 'destructive'
                                        : reminder.priority === 'high'
                                        ? 'destructive'
                                        : reminder.priority === 'medium'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {reminder.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {reminder.dueDate ? formatDate(reminder.dueDate) : formatDate(reminder.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditReminder(reminder)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No teacher reminders found</p>
                            <p className="text-sm">Create your first reminder to get started</p>
                          </div>
                        )}
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
{isNewsletterLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : newsletters.length > 0 ? (
                          newsletters.map((newsletter) => (
                            <div
                              key={newsletter.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{newsletter.title}</h4>
                                <p className="text-sm text-gray-600">{newsletter.content.substring(0, 100) + (newsletter.content.length > 100 ? '...' : '')}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={
                                    newsletter.status === 'published' ? 'default' : 
                                    newsletter.status === 'draft' ? 'secondary' : 'outline'
                                  }>
                                    {newsletter.status}
                                  </Badge>
                                  {newsletter.issueNumber && (
                                    <Badge variant="outline">Issue #{newsletter.issueNumber}</Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {newsletter.publicationDate ? formatDate(newsletter.publicationDate) : formatDate(newsletter.createdAt)}
                                  </span>
                                  <span className="text-xs text-gray-500">📥 {newsletter.downloadCount} downloads</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditNewsletter(newsletter)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteNewsletter(newsletter.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No newsletters found</p>
                            <p className="text-sm">Create your first newsletter to get started</p>
                          </div>
                        )}
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

            {activeTab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h2>
                  <p className="text-gray-600">Manage user feedback and support requests</p>
                </div>

                <div className="grid gap-8">
                  {/* Feedback Forms Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        Feedback Forms
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleAddFeedback}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Feedback
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isFeedbackLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : feedbackForms.length > 0 ? (
                          feedbackForms.map((feedback) => (
                            <div
                              key={feedback.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{feedback.subject}</h4>
                                <p className="text-sm text-gray-600">{feedback.message.substring(0, 100) + (feedback.message.length > 100 ? '...' : '')}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={
                                    feedback.priority === 'high' ? 'destructive' :
                                    feedback.priority === 'medium' ? 'default' : 'secondary'
                                  }>
                                    {feedback.priority}
                                  </Badge>
                                  <Badge variant={
                                    feedback.status === 'new' ? 'default' :
                                    feedback.status === 'in_progress' ? 'secondary' :
                                    feedback.status === 'resolved' ? 'outline' : 'destructive'
                                  }>
                                    {feedback.status}
                                  </Badge>
                                  {feedback.category && (
                                    <Badge variant="outline">{feedback.category}</Badge>
                                  )}
                                  {feedback.isAnonymous && (
                                    <Badge variant="outline">Anonymous</Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatDate(feedback.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditFeedback(feedback)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteFeedback(feedback.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No feedback forms found</p>
                            <p className="text-sm">Create your first feedback entry to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Message Board Management</h2>
                  <p className="text-gray-600">Manage discussion posts and announcements</p>
                </div>

                <div className="grid gap-8">
                  {/* Message Board Posts Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-600" />
                        Message Board Posts
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleAddMessageBoard}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isMessageBoardLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))
                        ) : messageBoardPosts.length > 0 ? (
                          messageBoardPosts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {post.isPinned && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                      📌 Pinned
                                    </Badge>
                                  )}
                                  <h4 className="font-semibold text-gray-900">{post.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={
                                    post.boardType === 'teachers' ? 'default' :
                                    post.boardType === 'parents' ? 'secondary' : 'outline'
                                  }>
                                    {post.boardType}
                                  </Badge>
                                  <Badge variant={
                                    post.status === 'active' ? 'default' :
                                    post.status === 'closed' ? 'destructive' : 'outline'
                                  }>
                                    {post.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    👁️ {post.viewCount} views
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    💬 {post.replyCount} replies
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(post.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditMessageBoard(post)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteMessageBoard(post.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No message board posts found</p>
                            <p className="text-sm">Create your first post to get started</p>
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

                {/* User Form Modal/Dialog */}
                {showUserForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setShowUserForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    >
                      <UserForm
                        user={editingUser}
                        onSubmit={handleUserFormSubmit}
                        onCancel={() => {
                          setShowUserForm(false)
                          setEditingUser(null)
                        }}
                        loading={dataLoading}
                        error={error}
                        mode={editingUser ? 'edit' : 'create'}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Teacher Reminder Form Modal/Dialog */}
                {showReminderForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setShowReminderForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                      <TeacherReminderForm
                        reminder={editingReminder}
                        onSubmit={handleReminderFormSubmit}
                        onCancel={() => {
                          setShowReminderForm(false)
                          setEditingReminder(null)
                        }}
                        loading={dataLoading}
                        error={error}
                        mode={editingReminder ? 'edit' : 'create'}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Newsletter Form Modal/Dialog */}
                {showNewsletterForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setShowNewsletterForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                      <NewsletterForm
                        newsletter={editingNewsletter}
                        onSubmit={handleNewsletterFormSubmit}
                        onCancel={() => {
                          setShowNewsletterForm(false)
                          setEditingNewsletter(null)
                        }}
                        loading={dataLoading}
                        error={error}
                        mode={editingNewsletter ? 'edit' : 'create'}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Feedback Form Modal/Dialog */}
                {showFeedbackForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                      <FeedbackForm
                        feedback={editingFeedback}
                        onSubmit={handleFeedbackFormSubmit}
                        onCancel={() => {
                          setShowFeedbackForm(false)
                          setEditingFeedback(null)
                        }}
                        loading={dataLoading}
                        error={error}
                        mode={editingFeedback ? 'edit' : 'create'}
                        availableAssignees={users.filter(user => user.roles.includes('admin') || user.roles.includes('office_member'))}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Message Board Form Modal/Dialog */}
                {showMessageBoardForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setShowMessageBoardForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                      <MessageBoardForm
                        message={editingMessageBoard}
                        onSubmit={handleMessageBoardFormSubmit}
                        onCancel={() => {
                          setShowMessageBoardForm(false)
                          setEditingMessageBoard(null)
                        }}
                        loading={dataLoading}
                        error={error}
                        mode={editingMessageBoard ? 'edit' : 'create'}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* User List */}
                <UserList
                  users={users}
                  loading={isUserLoading}
                  error={error}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleStatus={handleToggleUserStatus}
                  onManageRoles={handleManageUserRoles}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                  onAddUser={handleAddUser}
                  onSearch={handleUserSearch}
                  onFilterRole={handleUserRoleFilter}
                  onPageChange={handleUserPageChange}
                  onRefresh={fetchUsers}
                  pagination={userPagination}
                  searchQuery={userSearchQuery}
                  roleFilter={userRoleFilter}
                  showActions={true}
                />
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