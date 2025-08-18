"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Search, 
  Sparkles, 
  ChevronDown,
  Filter,
  Plus,
  AlertCircle,
  User,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"

/**
 * Events Page Component - KCISLK ESID Events
 * 
 * @description Complete events page with event listings, filtering, search, and registration features
 * @features Dynamic event loading, event filtering, search, registration functionality, responsive design
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface Event {
  id: number
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
  isFeatured: boolean
  status: string
  createdAt: string
  creator?: {
    displayName: string
  }
  registrations?: any[]
}

export default function EventsPage() {
  // Scroll parallax effect
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])

  // State management
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('all')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  
  // Load events data
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Build query parameters
      const params = new URLSearchParams()
      params.set('status', 'published')
      params.set('limit', '50')
      
      const response = await fetch(`/api/events?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.data || [])
      } else {
        setError('Failed to load events data')
      }
    } catch (error) {
      console.error('Fetch events error:', error)
      setError('Network error, please try again later')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query))
      
      if (!matchesSearch) return false
    }
    
    // Event type filter
    if (selectedEventType !== 'all' && event.eventType !== selectedEventType) {
      return false
    }
    
    // Featured events filter
    if (showFeaturedOnly && !event.isFeatured) {
      return false
    }
    
    return true
  })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Check if registration is available
  const canRegister = (event: Event) => {
    if (!event.registrationRequired) return false
    
    const now = new Date()
    const eventDate = new Date(event.startDate)
    const registrationDeadline = event.registrationDeadline 
      ? new Date(event.registrationDeadline) 
      : eventDate
    
    return now < registrationDeadline
  }

  // Get registration status
  const getRegistrationStatus = (event: Event) => {
    const registrationCount = event.registrations?.length || 0
    
    if (event.maxParticipants && registrationCount >= event.maxParticipants) {
      return { status: 'full', text: 'Registration Full', color: 'bg-red-500' }
    }
    
    if (!canRegister(event)) {
      return { status: 'closed', text: 'Registration Closed', color: 'bg-gray-500' }
    }
    
    return { status: 'open', text: 'Registration Open', color: 'bg-green-500' }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Animated Background */}
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
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  KCISLK ESID Info Hub
                </h1>
                <p className="text-xs text-gray-500">KCISLK Elementary School International Department</p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Events", href: "/events", active: true },
                { name: "Resources", href: "/resources", hasDropdown: true },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-1 ${
                      item.active
                        ? "text-purple-600 bg-purple-100/50"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                    }`}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
                    {item.active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full"
                        layoutId="activeTab"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          style={{ y: y1 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            School Events
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Participate in our rich and colorful school activities, building closer connections with teachers, parents and classmates
          </motion.p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search event name, description or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Event Type Filter */}
                <div className="w-full md:w-48">
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Featured Events Toggle */}
                <div className="flex items-center">
                  <Button
                    variant={showFeaturedOnly ? "default" : "outline"}
                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                    className="whitespace-nowrap"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Featured Events
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Event List */}
        {!isLoading && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const registrationStatus = getRegistrationStatus(event)
                
                return (
                  <motion.div key={event.id} variants={itemVariants}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                      {event.isFeatured && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Featured Event
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                              {event.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.eventType}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col">
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          {/* Date and Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          
                          {/* Time */}
                          {event.startTime && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(event.startTime)}
                                {event.endTime && ` - ${formatTime(event.endTime)}`}
                              </span>
                            </div>
                          )}
                          
                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {/* Registration Count */}
                          {event.registrationRequired && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {event.registrations?.length || 0}
                                {event.maxParticipants && `/${event.maxParticipants}`} registered
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Registration Status and Button */}
                        <div className="mt-auto">
                          {event.registrationRequired && (
                            <div className="flex items-center justify-between">
                              <Badge 
                                className={`${registrationStatus.color} text-white text-xs`}
                              >
                                {registrationStatus.text}
                              </Badge>
                              
                              {registrationStatus.status === 'open' && (
                                <Button size="sm" variant="outline" className="group-hover:bg-purple-50">
                                  Register Now
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {/* Event Creator */}
                          {event.creator && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>Organized by: {event.creator.displayName}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              // Display when no events
              <motion.div
                variants={itemVariants}
                className="col-span-full text-center py-12"
              >
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery || selectedEventType !== 'all' || showFeaturedOnly 
                    ? 'No events found matching criteria' 
                    : 'No events currently available'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || selectedEventType !== 'all' || showFeaturedOnly 
                    ? 'Please try adjusting search criteria' 
                    : 'Please look forward to more exciting events'}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-gradient-to-r from-purple-800 to-purple-900 text-white py-12 relative overflow-hidden mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            &copy; 2025 KCISLK Elementary School International Department. All rights reserved.
          </motion.p>
          <motion.p
            className="text-purple-300 text-sm mt-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Kang Chiao International School | Excellence in International Education
          </motion.p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </motion.footer>
    </div>
  )
}