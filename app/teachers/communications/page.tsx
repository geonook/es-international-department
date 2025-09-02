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
  Pin,
  MessageCircle,
  User,
  ArrowLeft,
  RefreshCw,
  Eye,
  Calendar,
  Hash,
  BookOpen,
  AlertTriangle,
  Star,
  Reply,
  Target,
  FileText,
  Bell,
  Megaphone,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import MobileNav from "@/components/ui/mobile-nav"

// Define types for Teachers Corner message board system
interface MessageAuthor {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email?: string
}

interface MessageReply {
  id: number
  messageId: number
  authorId: string
  content: string
  parentReplyId?: number
  author: MessageAuthor
  createdAt: string
  updatedAt: string
}

interface MessageBoardPost {
  id: number
  title: string
  content: string
  boardType: 'teachers' | 'parents' | 'general'
  sourceGroup?: string // 主任Vickie, 副主任Matthew, Academic Team, Curriculum Team, Instructional Team
  isImportant: boolean
  isPinned: boolean
  isFeatured: boolean
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  replyCount: number
  author: MessageAuthor
  replies?: MessageReply[]
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface TeachersMessagesResponse {
  success: boolean
  data: {
    important: MessageBoardPost[]
    pinned: MessageBoardPost[]
    regular: MessageBoardPost[]
    byGroup: Record<string, MessageBoardPost[]>
    total: number
    totalImportant: number
    pagination?: {
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  message?: string
}

// Group colors for Teachers Corner organization
const groupColors: Record<string, { bg: string, text: string, label: string }> = {
  'Vickie': { bg: 'bg-purple-100', text: 'text-purple-700', label: '👩‍💼 主任 Vickie' },
  'Matthew': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '👨‍💼 副主任 Matthew' },
  'Academic Team': { bg: 'bg-blue-100', text: 'text-blue-700', label: '📚 Academic Team' },
  'Curriculum Team': { bg: 'bg-green-100', text: 'text-green-700', label: '📖 Curriculum Team' },
  'Instructional Team': { bg: 'bg-orange-100', text: 'text-orange-700', label: '🎯 Instructional Team' },
  'general': { bg: 'bg-gray-100', text: 'text-gray-700', label: '📢 General' }
}

const statusColors = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200"
}

export default function TeacherCommunicationsPage() {
  const [messages, setMessages] = useState<MessageBoardPost[]>([])
  const [filteredMessages, setFilteredMessages] = useState<MessageBoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showImportantOnly, setShowImportantOnly] = useState(false)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [messageData, setMessageData] = useState<any>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const { user, loading: authLoading } = useAuth()

  // Fetch teachers messages data from Teachers Corner API
  const fetchMessages = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        limit: '100',
        boardType: 'teachers',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      // Add filters
      if (selectedGroup !== 'all') {
        params.append('sourceGroup', selectedGroup)
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }
      
      const response = await fetch(`/api/teachers/messages?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: TeachersMessagesResponse = await response.json()
      
      if (result.success) {
        // Flatten all messages from different categories
        const allMessages = [
          ...result.data.important,
          ...result.data.pinned,
          ...result.data.regular
        ]
        setMessages(allMessages)
        setMessageData(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to fetch teachers messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter messages based on search and filters
  useEffect(() => {
    let filtered = messages

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAuthorName(msg.author).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.sourceGroup && msg.sourceGroup.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(msg => msg.sourceGroup === selectedGroup)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(msg => msg.status === selectedStatus)
    }

    // Important only filter
    if (showImportantOnly) {
      filtered = filtered.filter(msg => msg.isImportant)
    }

    // Pinned only filter
    if (showPinnedOnly) {
      filtered = filtered.filter(msg => msg.isPinned)
    }

    // Sort by pinned status first, then by importance, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredMessages(filtered)
  }, [messages, searchTerm, selectedGroup, selectedStatus, showImportantOnly, showPinnedOnly])

  // Load messages when component mounts or filters change
  useEffect(() => {
    if (user && !authLoading) {
      fetchMessages()
    } else if (!user && !authLoading) {
      setLoading(false)
      setError('Please log in to view teachers messages')
    }
  }, [user, authLoading, selectedGroup, selectedStatus])

  // Get author display name
  const getAuthorName = (author: MessageAuthor) => {
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

  // Get group icon and color
  const getGroupInfo = (sourceGroup?: string) => {
    if (!sourceGroup) return { icon: <MessageSquare className="w-4 h-4" />, color: groupColors.general }
    const groupInfo = groupColors[sourceGroup] || groupColors.general
    
    switch (sourceGroup) {
      case 'Vickie': return { icon: <Star className="w-4 h-4" />, color: groupInfo }
      case 'Matthew': return { icon: <Star className="w-4 h-4" />, color: groupInfo }
      case 'Academic Team': return { icon: <BookOpen className="w-4 h-4" />, color: groupInfo }
      case 'Curriculum Team': return { icon: <FileText className="w-4 h-4" />, color: groupInfo }
      case 'Instructional Team': return { icon: <Target className="w-4 h-4" />, color: groupInfo }
      default: return { icon: <MessageSquare className="w-4 h-4" />, color: groupInfo }
    }
  }

  // Handle creating new message (redirect to message board)
  const handleCreateMessage = () => {
    // Stay on current page with create parameter
    window.location.href = '/teachers/communications?create=true'
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchMessages()
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Teachers' Message Board
                  </h1>
                  <p className="text-xs text-gray-500">25-26 School Year Communication Center</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              {/* Create Message Button */}
              <Button
                onClick={handleCreateMessage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Message Board
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
                  Message Board
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
        {messageData && (
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
                    <p className="text-sm text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{messageData.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Important</p>
                    <p className="text-2xl font-bold text-red-600">
                      {messageData.totalImportant}
                    </p>
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
                    <p className="text-sm text-gray-600">Pinned</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {messageData.pinned.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filtered Results</p>
                    <p className="text-2xl font-bold text-green-600">{filteredMessages.length}</p>
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
                    placeholder="Search messages, content, authors, or groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {/* Group Filter */}
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {Object.entries(groupColors).map(([key, group]) => (
                        <SelectItem key={key} value={key}>{group.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">📢 Published</SelectItem>
                      <SelectItem value="draft">📝 Draft</SelectItem>
                      <SelectItem value="archived">📦 Archived</SelectItem>
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
                    onClick={handleRefresh}
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
                      setSelectedGroup('all')
                      setSelectedStatus('all')
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
          ) : filteredMessages.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {messages.length === 0 ? 'No messages yet' : 'No matching messages'}
                  </h3>
                  <p className="text-gray-600">
                    {messages.length === 0 
                      ? 'No messages available in the Teachers\' Message Board.' 
                      : 'Please try adjusting your search criteria or filter settings.'
                    }
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    message.isPinned ? 'ring-2 ring-amber-200' : ''
                  } ${
                    message.isImportant ? 'ring-2 ring-red-200' : ''
                  }`}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            {message.isPinned && (
                              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                            {message.isImportant && (
                              <Star className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 truncate">
                              {message.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{getAuthorName(message.author)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{message.viewCount} views</span>
                            </div>
                            {message.sourceGroup && (
                              <div className="flex items-center gap-1">
                                {getGroupInfo(message.sourceGroup).icon}
                                <span className="font-medium">{getGroupInfo(message.sourceGroup).color.label}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2 flex-wrap">
                            {message.sourceGroup && (
                              <Badge className={`${getGroupInfo(message.sourceGroup).color.bg} ${getGroupInfo(message.sourceGroup).color.text} border-${getGroupInfo(message.sourceGroup).color.bg.split('-')[1]}-200`}>
                                <div className="flex items-center gap-1">
                                  {getGroupInfo(message.sourceGroup).icon}
                                  {message.sourceGroup}
                                </div>
                              </Badge>
                            )}
                            <Badge className={statusColors[message.status]}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </Badge>
                          </div>
                          {message.replyCount > 0 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {message.replyCount} replies
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {truncateContent(message.content)}
                        </p>
                      </div>

                      {/* Recent Replies Preview */}
                      {message.replies && message.replies.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Recent Replies</span>
                          </div>
                          <div className="space-y-2">
                            {message.replies.slice(0, 2).map((reply) => (
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
                            {message.replyCount > 2 && (
                              <div className="text-sm text-gray-500">
                                {message.replyCount - 2} more replies...
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
                            <span>#{message.id}</span>
                          </div>
                          {message.updatedAt !== message.createdAt && (
                            <div className="flex items-center gap-1">
                              <span>Updated {formatDate(message.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Expand message details inline
                              console.log('Show message details:', message.id)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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

      {/* Removed: Legacy system notice - users are now on the unified page */}
    </div>
  )
}