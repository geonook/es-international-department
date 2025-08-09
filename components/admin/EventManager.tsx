'use client'

/**
 * Event Manager Component
 * Event Manager Component
 * 
 * @description Main event management component with list, search, filter and operation functions
 * @features Event CRUD, filtering, search, pagination, batch operations
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import EventForm from '@/components/admin/EventForm'
import EventList from '@/components/admin/EventList'
import { 
  Event,
  EventFormData,
  EventFilters,
  PaginationInfo,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  GRADE_OPTIONS,
  ApiResponse
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface EventManagerProps {
  events?: Event[]
  loading?: boolean
  error?: string
  onFiltersChange?: (filters: EventFilters) => void
  onPageChange?: (page: number) => void
  onRefresh?: () => void
  pagination?: PaginationInfo
  filters?: EventFilters
  className?: string
}

export default function EventManager({
  events = [],
  loading = false,
  error,
  onFiltersChange,
  onPageChange,
  onRefresh,
  pagination,
  filters,
  className
}: EventManagerProps) {
  // Form state
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')

  // Local filter state
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters || {
    eventType: 'all',
    status: 'all',
    search: ''
  })

  // Create event
  const createEvent = async (data: EventFormData) => {
    setFormLoading(true)
    setFormError('')
    
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
      
      const result: ApiResponse<Event> = await response.json()
      
      if (result.success) {
        setShowEventForm(false)
        setEditingEvent(null)
        onRefresh?.() // Reload list
      } else {
        throw new Error(result.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('Create event error:', error)
      setFormError(error instanceof Error ? error.message : 'Error occurred while creating event')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Update event
  const updateEvent = async (data: EventFormData) => {
    if (!editingEvent) return
    
    setFormLoading(true)
    setFormError('')
    
    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Event> = await response.json()
      
      if (result.success) {
        setShowEventForm(false)
        setEditingEvent(null)
        onRefresh?.() // Reload list
      } else {
        throw new Error(result.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Update event error:', error)
      setFormError(error instanceof Error ? error.message : 'Error occurred while updating event')
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  // Delete event
  const deleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This operation cannot be undone.')) {
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
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        onRefresh?.() // Reload list
      } else {
        throw new Error(result.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Delete event error:', error)
      // Error message can be displayed here
    }
  }

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
    setFormError('')
  }

  // Handle create event
  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
    setFormError('')
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    setFormError('')
  }

  // Handle form submit
  const handleFormSubmit = async (data: EventFormData) => {
    if (editingEvent) {
      await updateEvent(data)
    } else {
      await createEvent(data)
    }
  }

  // Handle search
  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // Handle filter change
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    const newFilters: EventFilters = {
      eventType: 'all',
      status: 'all',
      search: ''
    }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Event form modal */}
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
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={formLoading}
              error={formError}
              mode={editingEvent ? 'edit' : 'create'}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Title and actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Event Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear Filters
              </Button>
              <Button 
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-purple-600 to-purple-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={localFilters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Event type filter */}
            <Select
              value={localFilters.eventType || 'all'}
              onValueChange={(value) => handleFilterChange('eventType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grade filter */}
            <Select
              value={localFilters.targetGrade || 'all'}
              onValueChange={(value) => handleFilterChange('targetGrade', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇年級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有年級</SelectItem>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 篩選器摘要 */}
          {(localFilters.eventType && localFilters.eventType !== 'all') ||
           (localFilters.status && localFilters.status !== 'all') ||
           (localFilters.targetGrade && localFilters.targetGrade !== 'all') ||
           localFilters.search ? (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-600">已套用篩選器:</span>
              {localFilters.eventType && localFilters.eventType !== 'all' && (
                <Badge variant="secondary">
                  類型: {EVENT_TYPE_LABELS[localFilters.eventType as keyof typeof EVENT_TYPE_LABELS]}
                </Badge>
              )}
              {localFilters.status && localFilters.status !== 'all' && (
                <Badge variant="secondary">
                  狀態: {EVENT_STATUS_LABELS[localFilters.status as keyof typeof EVENT_STATUS_LABELS]}
                </Badge>
              )}
              {localFilters.targetGrade && localFilters.targetGrade !== 'all' && (
                <Badge variant="secondary">
                  年級: {GRADE_OPTIONS.find(g => g.value === localFilters.targetGrade)?.label}
                </Badge>
              )}
              {localFilters.search && (
                <Badge variant="secondary">
                  搜尋: "{localFilters.search}"
                </Badge>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 活動列表 */}
      <EventList
        events={events}
        loading={loading}
        error={error}
        onEdit={handleEditEvent}
        onDelete={deleteEvent}
        onPageChange={onPageChange}
        pagination={pagination}
        showActions={true}
      />

      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}