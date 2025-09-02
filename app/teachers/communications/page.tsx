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
  MessageSquare,
  Search,
  Filter,
  Pin,
  MessageCircle,
  User,
  ArrowLeft,
  RefreshCw,
  Eye,
  Calendar,
  Hash,
  Users,
  BookOpen,
  AlertTriangle,
  Star,
  Reply,
  Target,
  Plus,
  FileText,
  Bell,
  Mail
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import MobileNav from "@/components/ui/mobile-nav"
// TODO: Refactor to use separated Teachers' Corner architecture instead of unified communications

// Temporary local type definitions to fix compilation errors
type CommunicationType = 'announcement' | 'message' | 'reminder' | 'newsletter'

interface Communication {
  id?: number
  title: string
  content: string
  summary?: string
  type: CommunicationType
  targetAudience: 'teachers' | 'parents' | 'all'
  boardType: 'teachers' | 'parents' | 'general'
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'published' | 'archived'
}

// Define types for unified communication data (legacy)
interface CommunicationAuthor {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email?: string
}

interface CommunicationReply {
  id: number
  communicationId: number
  authorId: string
  content: string
  parentReplyId?: number
  author: CommunicationAuthor
  createdAt: string
  updatedAt: string
}

interface CommunicationItem {
  id: number
  title: string
  content: string
  summary?: string
  type: CommunicationType
  sourceGroup?: string
  targetAudience: 'teachers' | 'parents' | 'all'
  boardType: 'teachers' | 'parents' | 'general'
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'published' | 'archived' | 'closed'
  isImportant: boolean
  isPinned: boolean
  isFeatured: boolean
  viewCount: number
  replyCount: number
  author: CommunicationAuthor
  replies?: CommunicationReply[]
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface CommunicationResponse {
  success: boolean
  data: {
    communications: CommunicationItem[]
    stats: {
      total: number
      byType: Record<CommunicationType, number>
      byStatus: Record<string, number>
      byPriority: Record<string, number>
    }
    pagination: {
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  error?: string
}

const typeColors = {
  announcement: "bg-blue-100 text-blue-800 border-blue-200",
  message: "bg-green-100 text-green-800 border-green-200",
  reminder: "bg-amber-100 text-amber-800 border-amber-200",
  newsletter: "bg-purple-100 text-purple-800 border-purple-200"
}

const typeNames = {
  announcement: "Announcement",
  message: "Message", 
  reminder: "Reminder",
  newsletter: "Newsletter"
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200"
}

export default function TeacherCommunicationsPage() {
  const [communications, setCommunications] = useState<CommunicationItem[]>([])
  const [filteredCommunications, setFilteredCommunications] = useState<CommunicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [showImportantOnly, setShowImportantOnly] = useState(false)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCommunication, setEditingCommunication] = useState<CommunicationItem | null>(null)
  const { user, loading: authLoading } = useAuth()

  // Fetch communications data from unified API
  const fetchCommunications = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        limit: '100',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      // Add filters
      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }
      if (selectedPriority !== 'all') {
        params.append('priority', selectedPriority)
      }
      
      const response = await fetch(`/api/v1/communications?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: CommunicationResponse = await response.json()
      
      if (result.success) {
        setCommunications(result.data.communications || [])
        setStats(result.data.stats)
      } else {
        throw new Error(result.error || 'Failed to fetch communications')
      }
    } catch (err) {
      console.error('Error fetching communications:', err)
      setError('Failed to fetch communications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter communications based on search and filters
  useEffect(() => {
    let filtered = communications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(comm => 
        comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAuthorName(comm.author).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comm.sourceGroup && comm.sourceGroup.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Important only filter
    if (showImportantOnly) {
      filtered = filtered.filter(comm => comm.isImportant)
    }

    // Pinned only filter
    if (showPinnedOnly) {
      filtered = filtered.filter(comm => comm.isPinned)
    }

    // Sort by pinned status first, then by importance, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredCommunications(filtered)
  }, [communications, searchTerm, showImportantOnly, showPinnedOnly])

  // Load communications when component mounts or filters change
  useEffect(() => {
    if (user && !authLoading) {
      fetchCommunications()
    } else if (!user && !authLoading) {
      setLoading(false)
      setError('Please log in to view communications')
    }
  }, [user, authLoading, selectedType, selectedPriority])

  // Get author display name
  const getAuthorName = (author: CommunicationAuthor) => {
    return author.displayName || 
           `${author.firstName || ''} ${author.lastName || ''}`.trim() || 
           author.email || 
           'Unknown User'
  }

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    
    if (diffMinutes < 1) {
      return "Just now"
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Get type icon
  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'announcement': return <FileText className="w-4 h-4" />
      case 'message': return <MessageSquare className="w-4 h-4" />
      case 'reminder': return <Bell className="w-4 h-4" />
      case 'newsletter': return <Mail className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data: Communication) => {
    try {
      const method = editingCommunication ? 'PUT' : 'POST'
      const url = editingCommunication 
        ? `/api/v1/communications/${editingCommunication.id}`
        : '/api/v1/communications'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingCommunication ? 'update' : 'create'} communication`)
      }

      // Refresh the communications list
      await fetchCommunications()
      setShowCreateForm(false)
      setEditingCommunication(null)
    } catch (error) {
      console.error('Form submission error:', error)
      setError('Failed to save communication. Please try again.')
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
            <p className="text-gray-600 mb-4">Please log in to view communications</p>
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
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
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
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent">
                    Communications Hub
                  </h1>
                  <p className="text-xs text-gray-500">Unified Communication Center</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              {/* Create Communication Button */}
              <Button
                onClick={() => {
                  setEditingCommunication(null)
                  setShowCreateForm(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </Button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/teachers" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  Home
                </Link>
                <Link href="/teachers/reminders" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  Reminders
                </Link>
                <Link href="/teachers/calendar" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  Calendar
                </Link>
                <Link href="/teachers/communications" className="text-cyan-600 font-medium">
                  Communications
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
        {/* Stats Cards */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Communications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Pin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Important Items</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {filteredCommunications.filter(c => c.isImportant).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filtered Results</p>
                    <p className="text-2xl font-bold text-cyan-600">{filteredCommunications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Replies</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredCommunications.reduce((sum, comm) => sum + comm.replyCount, 0)}
                    </p>
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
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search communications, content, authors, or source groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {/* Type Filter */}
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(typeNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">🔴 High Priority</SelectItem>
                      <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="low">🟢 Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Important Filter */}
                  <Button
                    variant={showImportantOnly ? "default" : "outline"}
                    onClick={() => setShowImportantOnly(!showImportantOnly)}
                    className="justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Important Only
                  </Button>

                  {/* Pinned Filter */}
                  <Button
                    variant={showPinnedOnly ? "default" : "outline"}
                    onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                    className="justify-start"
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    Pinned Only
                  </Button>

                  {/* Refresh Button */}
                  <Button
                    onClick={fetchCommunications}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                      setSelectedPriority('all')
                      setShowImportantOnly(false)
                      setShowPinnedOnly(false)
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

        {/* Communications List */}
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
                      <Skeleton className="h-20 w-full" />
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
          ) : filteredCommunications.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {communications.length === 0 ? 'No communications yet' : 'No matching communications'}
                  </h3>
                  <p className="text-gray-600">
                    {communications.length === 0 
                      ? 'Currently no communication content available.' 
                      : 'Please try adjusting your search criteria or filter settings.'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredCommunications.map((communication, index) => (
                <motion.div
                  key={communication.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    communication.isPinned ? 'ring-2 ring-amber-200' : ''
                  } ${
                    communication.isImportant ? 'ring-2 ring-red-200' : ''
                  }`}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            {communication.isPinned && (
                              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                            {communication.isImportant && (
                              <Star className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 truncate">
                              {communication.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{getAuthorName(communication.author)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(communication.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{communication.viewCount} views</span>
                            </div>
                            {communication.sourceGroup && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Source: {communication.sourceGroup}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={typeColors[communication.type]}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(communication.type)}
                                {typeNames[communication.type]}
                              </div>
                            </Badge>
                            <Badge className={priorityColors[communication.priority]}>
                              {communication.priority.charAt(0).toUpperCase() + communication.priority.slice(1)} Priority
                            </Badge>
                          </div>
                          {communication.replyCount > 0 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {communication.replyCount} replies
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Summary or Content Preview */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {truncateContent(communication.summary || communication.content)}
                        </p>
                      </div>

                      {/* Recent Replies Preview */}
                      {communication.replies && communication.replies.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Recent Replies</span>
                          </div>
                          <div className="space-y-2">
                            {communication.replies.slice(0, 2).map((reply) => (
                              <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {getAuthorName(reply.author)}
                                  </span>
                                  <span className="text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700">
                                  {truncateContent(reply.content, 100)}
                                </p>
                              </div>
                            ))}
                            {communication.replyCount > 2 && (
                              <div className="text-sm text-gray-500">
                                {communication.replyCount - 2} more replies...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            <span>#{communication.id}</span>
                          </div>
                          {communication.updatedAt !== communication.createdAt && (
                            <div className="flex items-center gap-1">
                              <span>Updated {formatDate(communication.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingCommunication(communication)
                              setShowCreateForm(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </main>

      {/* Communication Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto"
            >
              <CommunicationForm
                communication={editingCommunication || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowCreateForm(false)
                  setEditingCommunication(null)
                }}
                mode={editingCommunication ? 'edit' : 'create'}
                defaultType="message"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}