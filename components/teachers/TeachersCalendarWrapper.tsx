'use client'

/**
 * Teachers Calendar Wrapper Component
 * 
 * @description Wrapper component for Teachers calendar using FullCalendar integration
 * @features Calendar grid view, event management, filtering, responsive design
 * @author Claude Code | Generated for KCISLK ESID Info Hub Teachers Module
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Filter,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Calendar,
  Search,
  X,
  Eye,
  EyeOff
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
import { format, parseISO } from 'date-fns'
import { 
  TEACHERS_CALENDAR_CONFIG,
  TEACHERS_EVENT_TYPES,
  TEACHERS_EVENT_STATUS,
  TEACHERS_CALENDAR_VIEWS,
  transformTeachersEventForCalendar,
  DEFAULT_TEACHERS_FILTERS,
  TEACHERS_CALENDAR_THEME
} from '@/lib/teachers-calendar-config'

// View mode type
export type ViewMode = 'calendar' | 'list'

interface TeachersCalendarWrapperProps {
  events?: any[]
  loading?: boolean
  error?: string
  className?: string
  onRefresh?: () => void
}

export default function TeachersCalendarWrapper({
  events = [],
  loading = false,
  error,
  className,
  onRefresh
}: TeachersCalendarWrapperProps) {
  // Component state
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const [filters, setFilters] = useState(DEFAULT_TEACHERS_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)

  // Calendar ref
  const calendarRef = useRef<FullCalendar>(null)

  // Transform events for FullCalendar
  const calendarEvents = useMemo(() => {
    return events.map(transformTeachersEventForCalendar)
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      const originalEvent = event.extendedProps?.originalEvent
      if (!originalEvent) return true

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchTitle = event.title.toLowerCase().includes(searchTerm)
        const matchDescription = originalEvent.description?.toLowerCase().includes(searchTerm) || false
        const matchLocation = originalEvent.location?.toLowerCase().includes(searchTerm) || false
        
        if (!matchTitle && !matchDescription && !matchLocation) return false
      }

      // Event type filter
      if (filters.eventType && filters.eventType !== 'all') {
        if (originalEvent.eventType !== filters.eventType) return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (originalEvent.status !== filters.status) return false
      }

      // Grade filter
      if (filters.grade && filters.grade !== 'all') {
        if (!originalEvent.targetGrades?.includes(filters.grade)) return false
      }

      return true
    })
  }, [calendarEvents, filters])

  // Handle event click
  const handleEventClick = useCallback((info: any) => {
    const event = info.event.extendedProps?.originalEvent
    if (event) {
      setSelectedEvent(event)
      setShowEventDialog(true)
    }
  }, [])

  // Handle date click
  const handleDateClick = useCallback((info: any) => {
    if (calendarView === 'dayGridMonth') {
      // Switch to day view on date click in month view
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi) {
        calendarApi.changeView('timeGridDay', info.date)
        setCalendarView('timeGridDay')
      }
    }
  }, [calendarView])

  // Handle view change
  const handleViewChange = useCallback((newView: string) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(newView)
      setCalendarView(newView)
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

  const handleTodayClick = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.today()
    }
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_TEACHERS_FILTERS)
  }, [])

  // Force calendar re-render
  const refreshCalendar = useCallback(() => {
    setCalendarKey(prev => prev + 1)
    onRefresh?.()
  }, [onRefresh])

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl" aria-describedby="event-details">
            <DialogHeader>
              <DialogTitle id="event-title">{selectedEvent?.title}</DialogTitle>
              <DialogDescription id="event-details">
                {selectedEvent && `Event scheduled for ${format(parseISO(selectedEvent.startDate), 'PPP')}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedEvent.startTime || 'All Day'} 
                        {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                      </span>
                    </div>
                    
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedEvent.location}</span>
                      </div>
                    )}
                    
                    {selectedEvent.targetGrades && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedEvent.targetGrades.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {TEACHERS_EVENT_TYPES[selectedEvent.eventType as keyof typeof TEACHERS_EVENT_TYPES]?.label || selectedEvent.eventType}
                    </Badge>
                    
                    <Badge variant="outline">
                      {TEACHERS_EVENT_STATUS[selectedEvent.status as keyof typeof TEACHERS_EVENT_STATUS]?.label || selectedEvent.status}
                    </Badge>
                    
                    {selectedEvent.registrationCount !== undefined && (
                      <div className="text-sm text-gray-600">
                        Registered: {selectedEvent.registrationCount} / {selectedEvent.maxParticipants}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Calendar View
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border bg-background p-1">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCalendar}
                  disabled={loading}
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Calendar Navigation (only for calendar view) */}
            {viewMode === 'calendar' && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevClick}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTodayClick}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextClick}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={calendarView} onValueChange={handleViewChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEACHERS_CALENDAR_VIEWS.map(view => (
                      <SelectItem key={view.value} value={view.value}>
                        {view.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Input
                        placeholder="Search events..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <Select
                      value={filters.eventType}
                      onValueChange={(value) => handleFilterChange('eventType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(TEACHERS_EVENT_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(TEACHERS_EVENT_STATUS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filters.grade}
                      onValueChange={(value) => handleFilterChange('grade', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="G1">Grade 1</SelectItem>
                        <SelectItem value="G2">Grade 2</SelectItem>
                        <SelectItem value="G3">Grade 3</SelectItem>
                        <SelectItem value="G4">Grade 4</SelectItem>
                        <SelectItem value="G5">Grade 5</SelectItem>
                        <SelectItem value="G6">Grade 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Calendar Content */}
        {viewMode === 'calendar' ? (
          <Card>
            <CardContent className="p-0">
              <div className="fullcalendar-container">
                <FullCalendar
                  key={calendarKey}
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  {...TEACHERS_CALENDAR_CONFIG}
                  initialView={calendarView}
                  events={filteredEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          // List View (existing functionality)
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(event.start), 'PPP')}
                        </p>
                        {event.extendedProps?.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {event.extendedProps.location}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">
                          {TEACHERS_EVENT_TYPES[event.extendedProps?.eventType as keyof typeof TEACHERS_EVENT_TYPES]?.label || 'Event'}
                        </Badge>
                        {event.extendedProps?.registrationCount !== undefined && (
                          <span className="text-xs text-gray-500">
                            {event.extendedProps.registrationCount}/{event.extendedProps.maxParticipants} registered
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events match your criteria
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar Styles */}
      <style jsx global>{`
        .fullcalendar-container .fc {
          font-family: inherit;
        }
        
        .fullcalendar-container .fc-event {
          border-radius: ${TEACHERS_CALENDAR_THEME.eventRadius};
          font-size: ${TEACHERS_CALENDAR_THEME.fontSize};
          padding: ${TEACHERS_CALENDAR_THEME.eventPadding};
          margin-bottom: 1px;
        }
        
        .fullcalendar-container .fc-event:hover {
          opacity: 0.9;
          cursor: pointer;
        }
        
        .fullcalendar-container .fc-day-today {
          background-color: ${TEACHERS_CALENDAR_THEME.todayColor} !important;
        }
        
        .fullcalendar-container .fc-day-sat,
        .fullcalendar-container .fc-day-sun {
          background-color: ${TEACHERS_CALENDAR_THEME.weekendColor};
        }
        
        .fullcalendar-container .fc-col-header-cell {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .fullcalendar-container .fc-daygrid-day {
          min-height: 100px;
          border: 1px solid #e2e8f0;
        }
        
        .fullcalendar-container .fc-daygrid-day-number {
          padding: 4px;
          font-weight: 500;
        }
      `}</style>
    </TooltipProvider>
  )
}