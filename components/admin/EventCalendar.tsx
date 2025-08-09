'use client'

/**
 * Event Calendar Component
 * Event Calendar Component
 * 
 * @description FullCalendar-based event management calendar component
 * @features Multiple view modes, drag-and-drop editing, quick creation, event color coding, conflict detection
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import EventForm from '@/components/admin/EventForm'
import { 
  convertEventsToCalendarEvents,
  detectEventConflicts,
  formatEventTime,
  getEventColors,
  generateEventTooltip
} from '@/lib/calendar-utils'
import { 
  Event,
  EventFormData,
  CalendarEvent,
  CalendarView,
  CalendarFilters,
  CalendarConfig,
  EventCalendarProps,
  EventType,
  EventStatus,
  DEFAULT_CALENDAR_THEME,
  CALENDAR_LOCALE_CONFIG,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_COLORS,
  EVENT_STATUS_COLORS
} from '@/lib/types'

// Default calendar configuration
const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  height: 'auto',
  locale: 'zh-tw',
  firstDay: 0, // Sunday
  weekends: true,
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00',
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  moreLinkClick: 'popover',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false
  },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false
  }
}

export default function EventCalendar({
  events = [],
  loading = false,
  error,
  view = 'dayGridMonth',
  filters,
  config = {},
  actions = {},
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onViewChange,
  onFiltersChange,
  showCreateModal = false,
  showEditModal = false,
  selectedEvent = null,
  className
}: EventCalendarProps) {
  // Component state
  const [currentView, setCurrentView] = useState<CalendarView>(view)
  const [currentFilters, setCurrentFilters] = useState<CalendarFilters>(filters || {})
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0) // Used to force re-rendering

  // Calendar ref
  const calendarRef = useRef<FullCalendar>(null)

  // Merge configurations
  const calendarConfig = useMemo(() => ({
    ...DEFAULT_CALENDAR_CONFIG,
    ...config
  }), [config])

  // Convert events to FullCalendar format
  const calendarEvents = useMemo((): CalendarEvent[] => {
    return convertEventsToCalendarEvents(events)
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!currentFilters) return calendarEvents

    return calendarEvents.filter(calEvent => {
      const event = calEvent.extendedProps?.event
      if (!event) return true

      // Activity type filtering
      if (currentFilters.eventTypes && currentFilters.eventTypes.length > 0) {
        if (!currentFilters.eventTypes.includes(event.eventType)) return false
      }

      // Status filtering
      if (currentFilters.statuses && currentFilters.statuses.length > 0) {
        if (!currentFilters.statuses.includes(event.status)) return false
      }

      // Search filtering
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase()
        const titleMatch = event.title.toLowerCase().includes(searchTerm)
        const locationMatch = event.location?.toLowerCase().includes(searchTerm)
        const descriptionMatch = event.description?.toLowerCase().includes(searchTerm)
        
        if (!titleMatch && !locationMatch && !descriptionMatch) return false
      }

      return true
    })
  }, [calendarEvents, currentFilters])

  // Handle event click
  const handleEventClick = useCallback((info: any) => {
    const event = info.event.extendedProps?.event
    if (event) {
      setEditingEvent(event)
      setShowEventForm(true)
    }
    actions.onEventClick?.(info)
  }, [actions])

  // Handle event drag
  const handleEventDrop = useCallback(async (info: any) => {
    const event = info.event.extendedProps?.event
    if (!event || !onEventUpdate) {
      info.revert()
      return
    }

    try {
      const newStartDate = info.event.start
      const newEndDate = info.event.end || newStartDate
      
      await onEventUpdate(event.id, {
        startDate: format(newStartDate, 'yyyy-MM-dd'),
        endDate: format(newEndDate, 'yyyy-MM-dd'),
        startTime: event.startTime ? format(newStartDate, 'HH:mm') : undefined,
        endTime: event.endTime ? format(newEndDate, 'HH:mm') : undefined
      })
    } catch (error) {
      console.error('Update event failed:', error)
      info.revert()
    }

    actions.onEventDrop?.(info)
  }, [onEventUpdate, actions])

  // Handle event resize
  const handleEventResize = useCallback(async (info: any) => {
    const event = info.event.extendedProps?.event
    if (!event || !onEventUpdate) {
      info.revert()
      return
    }

    try {
      const newEndDate = info.event.end || info.event.start
      
      await onEventUpdate(event.id, {
        endDate: format(newEndDate, 'yyyy-MM-dd'),
        endTime: event.endTime ? format(newEndDate, 'HH:mm') : undefined
      })
    } catch (error) {
      console.error('Update event failed:', error)
      info.revert()
    }

    actions.onEventResize?.(info)
  }, [onEventUpdate, actions])

  // Handle date selection
  const handleDateSelect = useCallback((info: any) => {
    setSelectedDate(info.start)
    setEditingEvent(null)
    setShowEventForm(true)
    actions.onSelect?.(info)
  }, [actions])

  // Handle date click
  const handleDateClick = useCallback((info: any) => {
    if (currentView === 'dayGridMonth') {
      // In month view, clicking date switches to day view
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi) {
        calendarApi.changeView('timeGridDay', info.date)
        setCurrentView('timeGridDay')
        onViewChange?.('timeGridDay')
      }
    }
    actions.onDateClick?.(info)
  }, [currentView, onViewChange, actions])

  // Handle view change
  const handleViewChange = useCallback((newView: CalendarView) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(newView)
      setCurrentView(newView)
      onViewChange?.(newView)
    }
  }, [onViewChange])

  // Handle today button
  const handleTodayClick = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.today()
    }
  }, [])

  // Handle navigation
  const handlePrevClick = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.prev()
    }
  }, [])

  const handleNextClick = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.next()
    }
  }, [])

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: EventFormData) => {
    setFormLoading(true)
    setFormError('')

    try {
      if (selectedDate && !editingEvent) {
        // Create new event using selected date
        const eventData = {
          ...data,
          startDate: format(selectedDate, 'yyyy-MM-dd')
        }
        await onEventCreate?.(eventData)
      } else if (editingEvent) {
        // Update existing event
        await onEventUpdate?.(editingEvent.id, data)
      }
      
      setShowEventForm(false)
      setEditingEvent(null)
      setSelectedDate(null)
    } catch (error) {
      console.error('Form submit error:', error)
      setFormError(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }, [selectedDate, editingEvent, onEventCreate, onEventUpdate])

  // Handle form cancellation
  const handleFormCancel = useCallback(() => {
    setShowEventForm(false)
    setEditingEvent(null)
    setSelectedDate(null)
    setFormError('')
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: CalendarFilters) => {
    setCurrentFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [onFiltersChange])

  // Force calendar re-render
  const refreshCalendar = useCallback(() => {
    setCalendarKey(prev => prev + 1)
  }, [])

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Event form modal */}
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Modify event information' : 'Create a new event'}
                {selectedDate && !editingEvent && (
                  <span className="text-blue-600 ml-2">
                    - {format(selectedDate, 'MMM dd, yyyy')}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <EventForm
              event={editingEvent || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={formLoading}
              error={formError}
              mode={editingEvent ? 'edit' : 'create'}
              defaultStartDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Calendar control toolbar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Event Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshCalendar}
                      disabled={loading}
                    >
                      <RefreshCw className={cn(
                        "w-4 h-4",
                        loading && "animate-spin"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reload</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* View switching and navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevClick}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTodayClick}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextClick}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Select value={currentView} onValueChange={handleViewChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dayGridMonth">Month View</SelectItem>
                    <SelectItem value="timeGridWeek">Week View</SelectItem>
                    <SelectItem value="timeGridDay">Day View</SelectItem>
                    <SelectItem value="listWeek">List View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Type</label>
                      <Select
                        value={currentFilters.eventType || 'all'}
                        onValueChange={(value) => handleFiltersChange({
                          ...currentFilters,
                          eventType: value === 'all' ? undefined : value as EventType
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Status</label>
                      <Select
                        value={currentFilters.status || 'all'}
                        onValueChange={(value) => handleFiltersChange({
                          ...currentFilters,
                          status: value === 'all' ? undefined : value as EventStatus
                        })}
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
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Weekend Display</label>
                      <Select
                        value={currentFilters.showWeekends ? 'true' : 'false'}
                        onValueChange={(value) => handleFiltersChange({
                          ...currentFilters,
                          showWeekends: value === 'true'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Show Weekends</SelectItem>
                          <SelectItem value="false">Hide Weekends</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Event Types:</span>
                {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => {
                  const color = DEFAULT_CALENDAR_THEME.eventColors[type as EventType]
                  return (
                    <div key={type} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color.backgroundColor }}
                      />
                      <span className="text-xs">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading events...</span>
          </div>
        )}

        {/* FullCalendar */}
        <Card>
          <CardContent className="p-0">
            <div className="fullcalendar-container">
              <FullCalendar
                key={calendarKey}
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                  multiMonthPlugin
                ]}
                initialView={calendarConfig.initialView}
                headerToolbar={false} // We use custom toolbar
                height={calendarConfig.height}
                locale={calendarConfig.locale}
                firstDay={calendarConfig.firstDay}
                weekends={currentFilters.showWeekends !== false}
                slotMinTime={calendarConfig.slotMinTime}
                slotMaxTime={calendarConfig.slotMaxTime}
                slotDuration={calendarConfig.slotDuration}
                selectable={calendarConfig.selectable}
                selectMirror={calendarConfig.selectMirror}
                dayMaxEvents={calendarConfig.dayMaxEvents}
                moreLinkClick={calendarConfig.moreLinkClick}
                eventTimeFormat={calendarConfig.eventTimeFormat}
                slotLabelFormat={calendarConfig.slotLabelFormat}
                events={filteredEvents}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                select={handleDateSelect}
                dateClick={handleDateClick}
                eventMouseEnter={actions.onEventMouseEnter}
                eventMouseLeave={actions.onEventMouseLeave}
                nowIndicator={true}
                editable={true}
                droppable={false}
                eventResizableFromStart={true}
                eventDurationEditable={true}
                selectOverlap={false}
                eventOverlap={false}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                  startTime: '08:00',
                  endTime: '17:00'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .fullcalendar-container .fc {
          font-family: inherit;
        }
        
        .fullcalendar-container .fc-event {
          border-radius: 4px;
          border-width: 1px;
          font-size: 0.875rem;
          padding: 2px 4px;
        }
        
        .fullcalendar-container .fc-event:hover {
          opacity: 0.9;
          cursor: pointer;
        }
        
        .fullcalendar-container .fc-event.event-full {
          border-style: dashed;
        }
        
        .fullcalendar-container .fc-day-today {
          background-color: #f0f9ff !important;
        }
        
        .fullcalendar-container .fc-button {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .fullcalendar-container .fc-button:hover {
          background: #f9fafb;
        }
        
        .fullcalendar-container .fc-button-active {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }
        
        .fullcalendar-container .fc-col-header-cell {
          background: #f8fafc;
          border-color: #e2e8f0;
          font-weight: 600;
          color: #475569;
        }
        
        .fullcalendar-container .fc-daygrid-day {
          border-color: #e2e8f0;
        }
        
        .fullcalendar-container .fc-timegrid-slot {
          border-color: #e2e8f0;
        }
        
        .fullcalendar-container .fc-list-event:hover td {
          background: #f8fafc;
        }
      `}</style>
    </TooltipProvider>
  )
}