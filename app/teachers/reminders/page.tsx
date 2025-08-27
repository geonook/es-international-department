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
  Clock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  ArrowLeft,
  RefreshCw,
  BookOpen,
  Bell,
  Target,
  MapPin
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import MobileNav from "@/components/ui/mobile-nav"

// Define types for reminder data
interface Reminder {
  id: number
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  status: string
  dueDate?: string
  dueTime?: string
  reminderType: string
  targetAudience?: string
  isRecurring: boolean
  recurringPattern?: string
  creator: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
}

interface ReminderResponse {
  urgent: Reminder[]
  regular: Reminder[]
  total: number
  totalUrgent: number
}

const priorityColors = {
  high: "bg-red-500/10 text-red-700 border-red-200",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200", 
  low: "bg-green-500/10 text-green-700 border-green-200"
}

const reminderTypeColors = {
  assignment: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  deadline: "bg-red-100 text-red-800",
  event: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800"
}

export default function TeacherRemindersPage() {
  const [reminders, setReminders] = useState<ReminderResponse>({ urgent: [], regular: [], total: 0, totalUrgent: 0 })
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const { user, loading: authLoading } = useAuth()

  // Fetch reminders data
  const fetchReminders = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/teachers/reminders?limit=100', {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setReminders(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch reminders')
      }
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError('Failed to fetch reminders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter reminders based on search and filters
  useEffect(() => {
    const allReminders = [...reminders.urgent, ...reminders.regular]
    let filtered = allReminders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reminder => 
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(reminder => reminder.priority === selectedPriority)
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(reminder => reminder.reminderType === selectedType)
    }

    setFilteredReminders(filtered)
  }, [reminders, searchTerm, selectedPriority, selectedType])

  // Load reminders when component mounts
  useEffect(() => {
    if (user && !authLoading) {
      fetchReminders()
    } else if (!user && !authLoading) {
      setLoading(false)
      setError('Please log in to view reminders')
    }
  }, [user, authLoading])

  // Format date display
  const formatDate = (dateString?: string, timeString?: string) => {
    if (!dateString) return null
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let dateDisplay = date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 || diffDays < -365 ? 'numeric' : undefined
    })
    
    if (timeString) {
      dateDisplay += ` ${timeString}`
    }
    
    // Add relative time indicator
    if (diffDays === 0) {
      dateDisplay += " (今天)"
    } else if (diffDays === 1) {
      dateDisplay += " (明天)"
    } else if (diffDays > 0 && diffDays <= 7) {
      dateDisplay += ` (${diffDays} 天後)`
    } else if (diffDays < 0 && diffDays >= -7) {
      dateDisplay += ` (${Math.abs(diffDays)} 天前)`
    }
    
    return dateDisplay
  }

  // Get creator display name
  const getCreatorName = (creator: Reminder['creator']) => {
    return creator.displayName || 
           `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || 
           '未知'
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
          <p className="text-gray-600">正在驗證身份...</p>
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
            <h2 className="text-xl font-semibold mb-2">需要登入</h2>
            <p className="text-gray-600 mb-4">請先登入以查看教師提醒</p>
            <Link href="/login">
              <Button className="w-full">前往登入</Button>
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
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"
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
                  返回教師頁面
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    教師提醒
                  </h1>
                  <p className="text-xs text-gray-500">Teacher Reminders</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/teachers" className="text-gray-600 hover:text-green-600 transition-colors">
                  首頁
                </Link>
                <Link href="/teachers/reminders" className="text-green-600 font-medium">
                  提醒
                </Link>
                <Link href="/teachers/calendar" className="text-gray-600 hover:text-green-600 transition-colors">
                  行事曆
                </Link>
                <Link href="/teachers/messages" className="text-gray-600 hover:text-green-600 transition-colors">
                  留言板
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
        {/* Stats and Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">總提醒數</p>
                    <p className="text-2xl font-bold text-gray-900">{reminders.total}</p>
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
                    <p className="text-sm text-gray-600">緊急提醒</p>
                    <p className="text-2xl font-bold text-red-600">{reminders.totalUrgent}</p>
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
                    <p className="text-sm text-gray-600">篩選結果</p>
                    <p className="text-2xl font-bold text-green-600">{filteredReminders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋提醒標題或內容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Priority Filter */}
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="優先級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有優先級</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有類型</SelectItem>
                    <SelectItem value="assignment">作業</SelectItem>
                    <SelectItem value="meeting">會議</SelectItem>
                    <SelectItem value="deadline">截止日期</SelectItem>
                    <SelectItem value="event">活動</SelectItem>
                    <SelectItem value="general">一般</SelectItem>
                  </SelectContent>
                </Select>

                {/* Refresh Button */}
                <Button
                  onClick={fetchReminders}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  重新整理
                </Button>
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

        {/* Reminders List */}
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
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : filteredReminders.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reminders.total === 0 ? '暫無提醒' : '沒有符合條件的提醒'}
                  </h3>
                  <p className="text-gray-600">
                    {reminders.total === 0 
                      ? '目前沒有任何提醒事項。' 
                      : '請嘗試調整搜尋條件或篩選設定。'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    reminder.priority === 'high' ? 'ring-2 ring-red-200' : ''
                  }`}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {reminder.title}
                            </h3>
                            {reminder.priority === 'high' && (
                              <Bell className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>建立者：{getCreatorName(reminder.creator)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${priorityColors[reminder.priority]} font-medium`}>
                            {reminder.priority === 'high' ? '高' : 
                             reminder.priority === 'medium' ? '中' : '低'} 優先級
                          </Badge>
                          <Badge className={reminderTypeColors[reminder.reminderType as keyof typeof reminderTypeColors] || reminderTypeColors.general}>
                            {reminder.reminderType === 'assignment' ? '作業' :
                             reminder.reminderType === 'meeting' ? '會議' :
                             reminder.reminderType === 'deadline' ? '截止日期' :
                             reminder.reminderType === 'event' ? '活動' : '一般'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {reminder.content}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {reminder.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>到期：{formatDate(reminder.dueDate, reminder.dueTime)}</span>
                            </div>
                          )}
                          {reminder.targetAudience && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>對象：{reminder.targetAudience}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          建立於 {new Date(reminder.createdAt).toLocaleDateString('zh-TW')}
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
    </div>
  )
}