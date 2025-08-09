'use client'

/**
 * Admin Events Management Page
 * Admin Events Management Page
 * 
 * @description Main event management page with event listings, statistics and management functions
 * @features Event CRUD operations, category management, registration management, statistical analysis
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Plus,
  RefreshCw,
  Users,
  Clock,
  MapPin,
  BarChart3,
  TrendingUp,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import EventManager from '@/components/admin/EventManager'
import EventCalendar from '@/components/admin/EventCalendar'
import CalendarViewToggle, { ViewMode, useCalendarView } from '@/components/admin/CalendarViewToggle'
import { 
  Event,
  EventStats,
  EventFilters,
  PaginationInfo,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  ApiResponse,
  EventListResponse,
  EventFormData
} from '@/lib/types'

export default function AdminEventsPage() {
  const { user, isLoading, isAuthenticated, isAdmin, redirectToLogin } = useAuth()
  
  // View mode state
  const { currentView, setCurrentView } = useCalendarView('list')
  
  // Event management state
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string>('')
  const [eventStats, setEventStats] = useState<EventStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState<EventFilters>({
    eventType: 'all',
    status: 'all',
    search: ''
  })

  // Fetch events list
  const fetchEvents = useCallback(async (newFilters?: EventFilters, page?: number) => {
    setEventsLoading(true)
    setEventsError('')
    
    try {
      const currentFilters = newFilters || filters
      const currentPage = page || pagination.page
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString()
      })
      
      if (currentFilters.eventType && currentFilters.eventType !== 'all') {
        searchParams.append('eventType', currentFilters.eventType)
      }
      if (currentFilters.status && currentFilters.status !== 'all') {
        searchParams.append('status', currentFilters.status)
      }
      if (currentFilters.search) {
        searchParams.append('search', currentFilters.search)
      }
      if (currentFilters.targetGrade) {
        searchParams.append('targetGrade', currentFilters.targetGrade)
      }
      if (currentFilters.dateRange?.start) {
        searchParams.append('startDate', currentFilters.dateRange.start)
      }
      if (currentFilters.dateRange?.end) {
        searchParams.append('endDate', currentFilters.dateRange.end)
      }
      
      const response = await fetch(`/api/admin/events?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: EventListResponse = await response.json()
      
      if (data.success) {
        setEvents(data.data)
        setPagination(data.pagination)
        setFilters(currentFilters)
        
        // 設定統計資訊
        if (data.stats) {
          setEventStats(data.stats)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch events')
      }
    } catch (error) {
      console.error('Fetch events error:', error)
      setEventsError(error instanceof Error ? error.message : 'An error occurred while loading events')
    } finally {
      setEventsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Handle filter changes
  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters)
    fetchEvents(newFilters, 1) // 重置到第一頁
  }

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    fetchEvents(filters, page)
  }

  // Create event
  const handleEventCreate = async (data: Partial<EventFormData>) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
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
        fetchEvents() // Reload list
      } else {
        throw new Error(result.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('Create event error:', error)
      throw error
    }
  }

  // Update event
  const handleEventUpdate = async (eventId: number, data: Partial<EventFormData>) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
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
        fetchEvents() // Reload list
      } else {
        throw new Error(result.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Update event error:', error)
      throw error
    }
  }

  // Delete event
  const handleEventDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        fetchEvents() // Reload list
      } else {
        throw new Error(result.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Delete event error:', error)
      throw error
    }
  }

  // Initial load events
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchEvents()
    }
  }, [isAuthenticated, fetchEvents, isAdmin])

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

  // Check authentication and permissions
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      redirectToLogin('/admin/events')
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin])

  // Not logged in or no admin permissions
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Event Management Center
                </h1>
                <p className="text-xs text-gray-500">Comprehensive Event Administration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Back to Admin Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Event Management</h2>
                <p className="text-gray-600 mt-1">Manage all school events and activities</p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarViewToggle
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  size="md"
                />
                <Button
                  variant="outline"
                  onClick={() => fetchEvents()}
                  disabled={eventsLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={cn(
                    "w-4 h-4",
                    eventsLoading && "animate-spin"
                  )} />
                  Reload
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          {eventStats && (
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Events</p>
                        <p className="text-2xl font-bold text-blue-800">{eventStats.total}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Published</p>
                        <p className="text-2xl font-bold text-green-800">{eventStats.published}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">In Progress</p>
                        <p className="text-2xl font-bold text-orange-800">{eventStats.inProgress}</p>
                      </div>
                      <Play className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Total Registrations</p>
                        <p className="text-2xl font-bold text-purple-800">{eventStats.totalRegistrations}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Event Type Statistics */}
          {eventStats && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Event Type Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(eventStats.byType).map(([type, count]) => (
                      <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{count}</p>
                        <p className="text-sm text-gray-600">
                          {EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] || type}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Event Manager/Calendar Component */}
          <motion.div variants={itemVariants}>
            {currentView === 'calendar' ? (
              <EventCalendar
                events={events}
                loading={eventsLoading}
                error={eventsError}
                filters={filters}
                onEventCreate={handleEventCreate}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
                onFiltersChange={handleFiltersChange}
              />
            ) : (
              <EventManager
                events={events}
                loading={eventsLoading}
                error={eventsError}
                onFiltersChange={handleFiltersChange}
                onPageChange={handlePageChange}
                onRefresh={() => fetchEvents()}
                pagination={pagination}
                filters={filters}
              />
            )}
          </motion.div>

          {/* Error Alert */}
          {eventsError && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{eventsError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}