"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Eye,
  UserCheck,
  Target
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import MobileNav from "@/components/ui/mobile-nav"
import TeachersCalendarWrapper from "@/components/teachers/TeachersCalendarWrapper"

// Define types for event data
interface Event {
  id: string
  title: string
  start: string
  end: string
  startTime?: string
  endTime?: string
  location?: string
  eventType: string
  targetGrades?: string[]
  description?: string
  creator?: string
  registrationRequired: boolean
  registrationDeadline?: string
  maxParticipants?: number
  registrationCount: number
  spotsRemaining?: number
  userRegistration?: {
    id: string
    status: 'confirmed' | 'waiting_list' | 'cancelled'
    participantName: string
    grade?: string
  }
  isUserRegistered: boolean
  className: string
  color: string
  allDay: boolean
}

interface CalendarResponse {
  events: Event[]
  period: {
    year: number
    month?: number
    startDate: string
    endDate: string
  }
  stats: {
    totalEvents: number
    byType: Record<string, number>
    byMonth: Record<string, number>
    userRegistrations: number
  }
}

// View mode for calendar
type ViewMode = 'list' | 'calendar'

const eventTypeColors = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  sports: "bg-green-100 text-green-800 border-green-200",
  cultural: "bg-purple-100 text-purple-800 border-purple-200",
  parent_meeting: "bg-orange-100 text-orange-800 border-orange-200",
  professional_development: "bg-red-100 text-red-800 border-red-200",
  administrative: "bg-gray-100 text-gray-800 border-gray-200",
  meeting: "bg-slate-100 text-slate-800 border-slate-200",
  celebration: "bg-pink-100 text-pink-800 border-pink-200",
  workshop: "bg-indigo-100 text-indigo-800 border-indigo-200",
  performance: "bg-violet-100 text-violet-800 border-violet-200",
  coffee_session: "bg-teal-100 text-teal-800 border-teal-200",
  other: "bg-stone-100 text-stone-800 border-stone-200"
}

const eventTypeNames = {
  academic: "Academic Activity",
  sports: "Sports Activity", 
  cultural: "Cultural Event",
  parent_meeting: "Parent Meeting",
  professional_development: "Professional Development",
  administrative: "Administrative",
  meeting: "Meeting",
  celebration: "Celebration",
  workshop: "Workshop",
  performance: "Performance",
  coffee_session: "Coffee Session",
  other: "Other"
}

const registrationStatusColors = {
  confirmed: "bg-green-100 text-green-800",
  waiting_list: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800"
}

const registrationStatusNames = {
  confirmed: "Confirmed",
  waiting_list: "Waiting List",
  cancelled: "Cancelled"
}

export default function TeacherCalendarPage() {
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [showUserRegistered, setShowUserRegistered] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number | null>(new Date().getMonth() + 1)
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const [displayMode, setDisplayMode] = useState<ViewMode>('calendar')
  const { user, loading: authLoading } = useAuth()

  // Fetch calendar data
  const fetchCalendarData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        year: currentYear.toString(),
        ...(viewMode === 'month' && currentMonth && { month: currentMonth.toString() }),
        ...(selectedEventType !== 'all' && { eventType: selectedEventType }),
        ...(selectedGrade !== 'all' && { targetGrade: selectedGrade }),
        ...(showUserRegistered && { userOnly: 'true' })
      })
      
      const response = await fetch(`/api/events/calendar?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setCalendarData(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch calendar data')
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError('Failed to fetch calendar data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter events based on search
  useEffect(() => {
    if (!calendarData) return
    
    let filtered = calendarData.events

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredEvents(filtered)
  }, [calendarData, searchTerm])

  // Load calendar data when parameters change
  useEffect(() => {
    if (user && !authLoading) {
      fetchCalendarData()
    } else if (!user && !authLoading) {
      setLoading(false)
      setError('Please log in to view calendar')
    }
  }, [user, authLoading, currentYear, currentMonth, viewMode, selectedEventType, selectedGrade, showUserRegistered])

  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (viewMode === 'year') {
      setCurrentYear(prev => direction === 'next' ? prev + 1 : prev - 1)
    } else {
      if (direction === 'next') {
        if (currentMonth === 12) {
          setCurrentMonth(1)
          setCurrentYear(prev => prev + 1)
        } else {
          setCurrentMonth(prev => (prev || 0) + 1)
        }
      } else {
        if (currentMonth === 1) {
          setCurrentMonth(12)
          setCurrentYear(prev => prev - 1)
        } else {
          setCurrentMonth(prev => (prev || 0) - 1)
        }
      }
    }
  }

  // Format date display
  const formatEventDate = (startDate: string, endDate: string, startTime?: string, endTime?: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    let dateStr = start.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    })
    
    if (start.toDateString() !== end.toDateString()) {
      dateStr += ` - ${end.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`
    }
    
    if (startTime) {
      dateStr += ` ${startTime}`
      if (endTime && endTime !== startTime) {
        dateStr += ` - ${endTime}`
      }
    }
    
    return dateStr
  }

  // Get current period display
  const getPeriodDisplay = () => {
    if (viewMode === 'year') {
      return `Year ${currentYear}`
    } else {
      const monthName = new Date(currentYear, (currentMonth || 1) - 1).toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: 'long' 
      })
      return monthName
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
    visible: { y: 0, opacity: 1 },
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view the calendar</p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/teachers">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Teachers
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Teachers Calendar
                  </h1>
                  <p className="text-xs text-gray-500">Teacher Calendar</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/teachers" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Home
                </Link>
                <Link href="/teachers/reminders" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Reminders
                </Link>
                <Link href="/teachers/calendar" className="text-purple-600 font-medium">
                  Calendar
                </Link>
                <Link href="/teachers/messages" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Messages
                </Link>
              </nav>

              {/* Mobile Navigation */}
              <MobileNav />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Calendar Header with Navigation */}
        <motion.div
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Period Navigation */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <h2 className="text-2xl font-bold text-gray-900 min-w-fit">
                    {getPeriodDisplay()}
                  </h2>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <div className="h-6 w-px bg-gray-300" />
                  
                  {/* Display Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={displayMode === 'calendar' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('calendar')}
                      className="h-8"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Calendar View
                    </Button>
                    <Button
                      variant={displayMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('list')}
                      className="h-8"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      List View
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentYear(new Date().getFullYear())
                      setCurrentMonth(new Date().getMonth() + 1)
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    onClick={fetchCalendarData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        {calendarData && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{calendarData.stats.totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered Events</p>
                    <p className="text-2xl font-bold text-green-600">{calendarData.stats.userRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filter Results</p>
                    <p className="text-2xl font-bold text-purple-600">{filteredEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Event Types</p>
                    <p className="text-2xl font-bold text-orange-600">{Object.keys(calendarData.stats.byType).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search event titles, descriptions, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Event Type Filter */}
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(eventTypeNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Grade Filter */}
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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

                  {/* User Registration Filter */}
                  <Button
                    variant={showUserRegistered ? "default" : "outline"}
                    onClick={() => setShowUserRegistered(!showUserRegistered)}
                    className="justify-start"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    My Registrations
                  </Button>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedEventType('all')
                      setSelectedGrade('all')
                      setShowUserRegistered(false)
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Calendar/List Content */}
        {displayMode === 'calendar' ? (
          <TeachersCalendarWrapper
            events={calendarData?.events || []}
            loading={loading}
            error={error}
            onRefresh={fetchCalendarData}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : filteredEvents.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {calendarData?.stats.totalEvents === 0 ? 'No events available' : 'No events match your criteria'}
                    </h3>
                    <p className="text-gray-600">
                      {calendarData?.stats.totalEvents === 0 
                        ? 'No events are scheduled for this period.' 
                        : 'Try adjusting your search terms or filter settings.'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    event.isUserRegistered ? 'ring-2 ring-green-200' : ''
                  }`}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            {event.isUserRegistered && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatEventDate(event.start, event.end, event.startTime, event.endTime)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.other}>
                            {eventTypeNames[event.eventType as keyof typeof eventTypeNames] || 'Other'}
                          </Badge>
                          {event.isUserRegistered && event.userRegistration && (
                            <Badge className={registrationStatusColors[event.userRegistration.status]}>
                              {registrationStatusNames[event.userRegistration.status]}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      )}

                      {/* Registration Info */}
                      {event.registrationRequired && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Registration Info</span>
                            </div>
                            <div className="text-sm text-blue-700">
                              {event.maxParticipants ? (
                                <>
                                  Registered: {event.registrationCount} / {event.maxParticipants}
                                  {event.spotsRemaining !== null && event.spotsRemaining > 0 && (
                                    <span className="ml-2 text-green-600">
                                      ({event.spotsRemaining} spots remaining)
                                    </span>
                                  )}
                                  {event.spotsRemaining === 0 && (
                                    <span className="ml-2 text-red-600">(Full)</span>
                                  )}
                                </>
                              ) : (
                                `Registered: ${event.registrationCount} people`
                              )}
                            </div>
                          </div>
                          {event.registrationDeadline && (
                            <div className="mt-2 text-sm text-blue-600">
                              Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-US')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {event.creator && (
                            <div className="flex items-center gap-1">
                              <span>Organizer: {event.creator}</span>
                            </div>
                          )}
                          {event.targetGrades && event.targetGrades.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>Target: {event.targetGrades.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}