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
  Phone,
  Navigation,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import MobileNav from '@/components/ui/mobile-nav'
import UserList from '@/components/admin/UserList'
import UserForm from '@/components/admin/UserForm'
import { UserData } from '@/components/admin/UserCard'
import TeacherReminderForm from '@/components/admin/TeacherReminderForm'
import NewsletterForm from '@/components/admin/NewsletterForm'
import FeedbackForm from '@/components/admin/FeedbackForm'
import AnnouncementForm from '@/components/AnnouncementForm'
import CommunicationForm from '@/components/admin/CommunicationForm'
// Removed: Unified Communications system - replaced with separated Teachers' Corner & Parents' Corner
import HeroImageManager from '@/components/admin/HeroImageManager'
import PageContentManager from '@/components/admin/PageContentManager'
import HomepageSettingsManager from '@/components/admin/HomepageSettingsManager'
import ContactInfoManager from '@/components/admin/ContactInfoManager'
import NavigationMenuManager from '@/components/admin/NavigationMenuManager'
import EventForm from '@/components/admin/EventForm'

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

interface Communication {
  id: string | number
  title: string
  content: string
  summary?: string
  type?: 'announcement' | 'message' | 'newsletter' | 'reminder'
  targetAudience?: 'teachers' | 'parents' | 'all'
  priority?: 'high' | 'medium' | 'low'
  status?: 'draft' | 'published' | 'archived'
  sourceGroup?: string
  isImportant?: boolean
  isPinned?: boolean
  publishedAt?: string
  expiresAt?: string
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
  
  
  // Announcement management states
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  
  // Event management states
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Check user permissions for different features
  const userRoles = user?.roles || []
  const userIsAdmin = userRoles.includes('admin')
  const userIsOfficeMember = userRoles.includes('office_member')
  const userIsViewer = userRoles.includes('viewer')
  
  // Permission levels: admin > office_member > viewer
  const canManageUsers = userIsAdmin
  const canManageSystem = userIsAdmin
  const canEditContent = userIsAdmin || userIsOfficeMember
  const canViewContent = userIsAdmin || userIsOfficeMember || userIsViewer

  // Check authentication only - all authenticated users can enter admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin('/admin')
    }
    // Remove role check - allow all authenticated users to enter admin
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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        // Clear any previous error messages
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while fetching announcements:', error)
      setError('Network error: Failed to connect to server')
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
      // Fetch real stats from unified Communication system
      const response = await fetch('/api/admin/communications', {
        credentials: 'include'
      })
      
      let activePosts = 0
      if (response.ok) {
        const data = await response.json()
        activePosts = data.pagination?.total || 0
      } else {
        // Fallback to old system for compatibility
        activePosts = announcements.length + events.length
      }
      
      setDashboardStats({
        totalTeachers: 45,
        totalParents: 320,
        activePosts,
        systemHealth: '98%'
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Fallback to old system on error
      setDashboardStats({
        totalTeachers: 45,
        totalParents: 320,
        activePosts: announcements.length + events.length,
        systemHealth: '98%'
      })
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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        // Clear any previous error messages
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while fetching newsletters:', error)
      setError('Network error: Failed to connect to server')
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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while fetching feedback forms:', error)
      setError('Network error: Failed to connect to server')
    } finally {
      setDataLoading(false)
      setIsFeedbackLoading(false)
    }
  }, [isFeedbackLoading])
  

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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while fetching users:', error)
      setError('Network error: Failed to connect to server')
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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while deleting user:', error)
      setError('Network error: Failed to connect to server')
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
      } else if (response.status === 401) {
        // Authentication required - not a real error
        console.log('Authentication required for admin features')
        setError('')
      } else if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        setError(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Network error while updating user status:', error)
      setError('Network error: Failed to connect to server')
    } finally {
      setDataLoading(false)
    }
  }

  const handleManageUserRoles = (user: UserData) => {
    // For now, redirect to edit form
    handleEditUser(user)
  }

  const handleApproveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this user? They will be assigned the Office Member role.')) {
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
          role: 'office_member' // Default assignment of office_member role
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // Refresh user list
        await fetchUsers()
        // Show success message (optional)
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
    if (!confirm('Are you sure you want to reject this user? User data will be permanently deleted.')) {
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
        // Refresh user list
        await fetchUsers()
        // Show success message (optional)
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

  const handleNewsletterDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return
    try {
      const response = await fetch(`/api/admin/newsletters/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        alert('Newsletter deleted successfully')
        fetchNewsletters()
      } else {
        const error = await response.text()
        alert(`Failed to delete newsletter: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error)
      alert('Failed to delete newsletter')
    }
  }
  
  // Announcement handlers
  const handleAnnouncementDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        alert('Announcement deleted successfully')
        fetchAnnouncements()
      } else {
        alert('Failed to delete announcement')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Error deleting announcement')
    }
  }
  
  // Event handlers
  const handleEventDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        alert('Event deleted successfully')
        fetchEvents()
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event')
    }
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


  // Load initial data when authenticated - load different data based on permissions
  useEffect(() => {
    if (isAuthenticated && canViewContent) {
      // All users can view announcements and events
      fetchAnnouncements()
      fetchEvents()
      
      // Only administrators can load user management data
      if (canManageUsers) {
        fetchUsers()
      }
      
      // Load teacher reminders, newsletters, feedback forms, and message boards for all authenticated users
      fetchTeacherReminders()
      fetchNewsletters()
      fetchFeedbackForms()
    }
  }, [isAuthenticated, canViewContent, canManageUsers]) // Data loading based on permission control

  // Refetch users when search/filter parameters change - only administrators can search users
  useEffect(() => {
    if (isAuthenticated && canManageUsers && (userSearchQuery || userRoleFilter || userPagination.page > 1)) {
      fetchUsers()
    }
  }, [userSearchQuery, userRoleFilter, userPagination.page, isAuthenticated, canManageUsers, fetchUsers])

  // Update stats when data changes - load statistics based on permissions
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
        ease: 'easeOut' as const,
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

  // If not authenticated, return null (redirect will happen automatically)
  if (!isAuthenticated) {
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
              {/* Mobile navigation - convenient way to return to main page */}
              <div className="md:hidden">
                <MobileNav />
              </div>
              
              {user && (
                <div className="hidden md:flex items-center gap-3">
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
              <Badge variant="outline" className="text-green-600 border-green-300 hidden md:flex">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Admin
              </Badge>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  disabled={isLoggingOut}
                  size="sm"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden md:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  <span className="md:hidden">{isLoggingOut ? '...' : 'Out'}</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <motion.aside
          className="w-full lg:w-64 bg-white/80 backdrop-blur-lg shadow-lg border-b lg:border-r lg:border-b-0 border-white/20 lg:min-h-screen"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <nav className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-2 lg:block">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                // All users can see Teachers' Corner, Parents' Corner, User Management, and Feedback
                ...(canViewContent ? [
                  { id: 'teachers', name: "Teachers' Corner", icon: GraduationCap },
                  { id: 'parents', name: "Parents' Corner", icon: Sparkles },
                  { id: 'feedback', name: 'Feedback Management', icon: MessageCircle }
                ] : []),
                // Only administrators can see content management and user management
                ...(canManageUsers ? [
                  { id: 'content', name: 'Page Content Management', icon: FileText },
                  { id: 'contacts', name: 'Contact Information', icon: Phone },
                  { id: 'navigation', name: 'Navigation Menu', icon: Navigation },
                  { id: 'users', name: 'User Management', icon: Users }
                ] : []),
                // Only administrators can see system settings
                ...(canManageSystem ? [
                  { id: 'settings', name: 'Settings', icon: Settings }
                ] : [])
              ].map((item) => (
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ) : (
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
                )
              ))}
            </div>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
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
                  
                  {/* Permission upgrade request prompt - only shown to viewer users */}
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {[
                    { title: 'Total Teachers', value: dashboardStats.totalTeachers.toString(), icon: GraduationCap, color: 'blue' },
                    { title: 'Total Parents', value: dashboardStats.totalParents.toString(), icon: Users, color: 'purple' },
                    { title: 'Total Communications', value: dashboardStats.activePosts.toString(), icon: MessageSquare, color: 'green' },
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Teachers' Corner
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
                          Manage Message Board
                        </Button>
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => window.location.href = '/teachers/reminders'}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Teacher Reminders
                        </Button>
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => window.location.href = '/admin/documents'}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Essential Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Parents' Corner
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
                          Manage Announcements
                        </Button>
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => {
                            console.log('🔥 Manage Events button clicked!')
                            window.location.href = '/admin/events'
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Manage Events
                        </Button>
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => {
                            console.log('🔥 Update Newsletter button clicked!')
                            setShowNewsletterForm(true)
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Edit Newsletter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Links */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Teachers' Corner</h4>
                            <p className="text-gray-600 text-sm">Manage teacher message board and resources</p>
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
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">User Management</h4>
                            <p className="text-gray-600 text-sm">Manage users and permissions</p>
                          </div>
                          <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <Link href="/">
                          <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open User Management
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Teachers' Corner</h2>
                  <p className="text-gray-600">🎓 Manage /teachers page content - internal communications, reminders, and resources</p>
                </div>

                <div className="grid gap-4 lg:gap-8">
                  {/* Info Alert */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Teachers' Corner Management</strong> - These functions control what teachers see on /teachers page.
                      This is for internal teacher communications and resources.
                    </AlertDescription>
                  </Alert>
                  

                  {/* Essential Documents Management - aligned with Google Sites */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Essential Documents and Sites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Academic Affairs */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Academic Affairs
                          </h4>
                          <p className="text-sm text-blue-600 mb-3">學務相關文件與資源</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                            onClick={() => window.open('https://sites.google.com/kcislk.ntpc.edu.tw/esid-teachers/academic-affairs', '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View on Google Sites
                          </Button>
                        </div>

                        {/* Foreign Affairs */}
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            Foreign Affairs
                          </h4>
                          <p className="text-sm text-green-600 mb-3">外務相關文件與資源</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => window.open('https://sites.google.com/kcislk.ntpc.edu.tw/esid-teachers/foreign-affairs', '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View on Google Sites
                          </Button>
                        </div>

                        {/* Classroom Affairs */}
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Classroom Affairs
                          </h4>
                          <p className="text-sm text-purple-600 mb-3">班級事務相關文件</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                            onClick={() => window.open('https://sites.google.com/kcislk.ntpc.edu.tw/esid-teachers/classroom-affairs', '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View on Google Sites
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ESID Feedback Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-orange-600" />
                        ESID Feedback
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => setShowFeedbackForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        View Feedback
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                        <p className="text-gray-600 mb-2">Teacher Feedback System</p>
                        <p className="text-sm text-gray-500">Collect and manage feedback from teaching staff</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Teacher Reminders Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        Teacher Reminders
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
                                        ? 'info'
                                        : reminder.status === 'completed'
                                        ? 'success'
                                        : reminder.status === 'pending'
                                        ? 'warning'
                                        : reminder.status === 'cancelled'
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
                                        ? 'warning'
                                        : reminder.priority === 'medium'
                                        ? 'info'
                                        : 'success'
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Parents' Corner</h2>
                  <p className="text-gray-600">🏠 Manage homepage content for parents - announcements, newsletters, and settings</p>
                </div>

                <div className="grid gap-4 lg:gap-8">
                  {/* Info Alert */}
                  <Alert className="bg-purple-50 border-purple-200">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>Parents' Corner Management</strong> - These functions control what parents see on the homepage (/).
                      Changes here directly affect the main website that families visit.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Homepage Settings Management */}
                  <HomepageSettingsManager />
                  {/* Parent Announcements Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-600" />
                        Homepage Announcements (Parents)
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          setShowAnnouncementForm(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Announcement
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
                        ) : announcements.filter(a => a.targetAudience === 'parents' || a.targetAudience === 'all').length > 0 ? (
                          announcements
                            .filter(a => a.targetAudience === 'parents' || a.targetAudience === 'all')
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
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAnnouncement(announcement)
                                      setShowAnnouncementForm(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAnnouncement(announcement)
                                      setShowAnnouncementForm(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleAnnouncementDelete(announcement.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No parent announcements found</p>
                            <p className="text-sm">Create your first announcement to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Newsletter Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Homepage Newsletter (Parents)
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setShowNewsletterForm(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Newsletter
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {newsletters.length > 0 ? (
                          newsletters.slice(0, 3).map((newsletter) => (
                            <div
                              key={newsletter.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{newsletter.title}</h4>
                                <p className="text-sm text-gray-600">Issue #{newsletter.issueNumber} - {newsletter.downloadCount} downloads</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">
                                    {newsletter.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{formatDate(newsletter.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingNewsletter(newsletter)
                                    setShowNewsletterForm(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleNewsletterDelete(newsletter.id)}
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
                </div>
              </motion.div>
            )}

            {activeTab === 'parent-content' && (
              <motion.div
                key="parents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600">Manage users, roles, and permissions</p>
                </div>

                <div className="grid gap-4 lg:gap-8">
                  {/* Newsletter Management */}
                  <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Newsletters
                      </CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          console.log('🔥 Create Newsletter button clicked!')
                          setShowNewsletterForm(true)
                        }}
                      >
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingNewsletter(newsletter)
                                    setShowNewsletterForm(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditNewsletter(newsletter)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => alert(`Downloading newsletter: ${newsletter.title}`)}
                                >
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
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          console.log('🔥 Add Event button clicked!')
                          setShowEventForm(true)
                        }}
                      >
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
                                    event.status === 'published' ? 'success' :
                                    event.status === 'completed' ? 'success' :
                                    event.status === 'draft' ? 'warning' :
                                    event.status === 'in_progress' ? 'info' :
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingEvent(event)
                                    setShowEventForm(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingEvent(event)
                                    setShowEventForm(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEventDelete(event.id)}
                                >
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

                <div className="grid gap-4 lg:gap-8">
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

            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Content Management</h2>
                  <p className="text-gray-600">Manage static text content across various pages</p>
                </div>
                <PageContentManager className="w-full" />
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Information Management</h2>
                  <p className="text-gray-600">Manage contact information displayed across the website</p>
                </div>
                <ContactInfoManager className="w-full" />
              </motion.div>
            )}

            {activeTab === 'navigation' && (
              <motion.div
                key="navigation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Navigation Menu Management</h2>
                  <p className="text-gray-600">Manage navigation menu items and their display order</p>
                </div>
                <NavigationMenuManager className="w-full" />
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

                <div className="grid gap-4 lg:gap-6">
                  {/* Hero image management */}
                  <HeroImageManager showPreview={true} />
                  
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
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            console.log('🔥 Save Settings button clicked!')
                            alert('Settings saved successfully!')
                          }}
                        >
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
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            console.log('🔥 Update Security button clicked!')
                            alert('Security settings updated successfully!')
                          }}
                        >
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

        {/* Global Modals - Outside AnimatePresence */}
        <AnimatePresence>
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
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
              >
                <CommunicationForm
                  communication={editingAnnouncement || undefined}
                  mode={editingAnnouncement ? 'edit' : 'create'}
                  defaultType="announcement"
                  onCancel={() => {
                    setShowAnnouncementForm(false)
                    setEditingAnnouncement(null)
                  }}
                  onSubmit={async (data: Communication) => {
                    const endpoint = editingAnnouncement 
                      ? `/api/admin/announcements/${editingAnnouncement.id}`
                      : '/api/admin/announcements'
                    const method = editingAnnouncement ? 'PUT' : 'POST'
                    
                    const response = await fetch(endpoint, {
                      method,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    })
                    
                    if (response.ok) {
                      alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!')
                      fetchAnnouncements()
                      setShowAnnouncementForm(false)
                      setEditingAnnouncement(null)
                    } else {
                      throw new Error('Failed to save announcement')
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Event Form Modal */}
          {showEventForm && (
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
                <EventForm
                  event={editingEvent || undefined}
                  onSubmit={async (data) => {
                    const endpoint = editingEvent 
                      ? `/api/admin/events/${editingEvent.id}`
                      : '/api/admin/events'
                    const method = editingEvent ? 'PUT' : 'POST'
                    
                    const response = await fetch(endpoint, {
                      method,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    })
                    
                    if (response.ok) {
                      alert(editingEvent ? 'Event updated!' : 'Event created!')
                      setShowEventForm(false)
                      setEditingEvent(null)
                      fetchEvents()
                    } else {
                      throw new Error('Failed to save event')
                    }
                  }}
                  onCancel={() => {
                    setShowEventForm(false)
                    setEditingEvent(null)
                  }}
                  loading={false}
                  error=""
                  mode={editingEvent ? 'edit' : 'create'}
                />
              </motion.div>
            </motion.div>
          )}

          {/* User Form Modal */}
          {showUserForm && (
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
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
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

          {/* Reminder Form Modal */}
          {showReminderForm && (
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

          {/* Newsletter Form Modal */}
          {showNewsletterForm && (
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

          {/* Feedback Form Modal */}
          {showFeedbackForm && (
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

        </AnimatePresence>
      </div>
    </div>
  )
}