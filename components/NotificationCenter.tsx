'use client'

/**
 * Notification Center Component
 * Notification Center Component
 * 
 * @description Complete notification center UI component, providing notification list, real-time updates, category filtering and other functions
 * @features Notification display, real-time updates, category filtering, bulk operations, read status management
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Filter, 
  Search, 
  Settings, 
  Trash2, 
  Archive,
  Circle,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Wrench,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import useRealTimeNotifications from '@/hooks/useRealTimeNotifications'

// Notification data interface
interface Notification {
  id: number
  title: string
  message: string
  type: 'system' | 'announcement' | 'event' | 'registration' | 'resource' | 'newsletter' | 'maintenance' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  readAt?: string
  expiresAt?: string
  relatedId?: number
  relatedType?: string
  metadata?: any
}

interface NotificationCenterProps {
  className?: string
  maxHeight?: string
  showHeader?: boolean
  compactMode?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function NotificationCenter({
  className,
  maxHeight = 'max-h-96',
  showHeader = true,
  compactMode = false,
  autoRefresh = true,
  refreshInterval = 30000
}: NotificationCenterProps) {
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notification data
  const fetchNotifications = useCallback(async () => {
    try {
      setError('')
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.data || [])
          setUnreadCount(data.stats?.unread || 0)
        } else {
          setError(data.message || 'Failed to load notifications')
        }
      } else if (response.status === 401) {
        setError('Please login first')
        setNotifications([])
        setUnreadCount(0)
      } else {
        setError('Failed to load notifications')
      }
    } catch (error) {
      console.error('Fetch notifications error:', error)
      setError('Network error, please try again later')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial loading and auto refresh
  useEffect(() => {
    fetchNotifications()
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchNotifications, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchNotifications, autoRefresh, refreshInterval])

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter)
    }

    // Read status filter
    if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (readFilter === 'read') {
      filtered = filtered.filter(n => n.isRead)
    }

    // Sort by time (unread first, then by creation time descending)
    filtered.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, typeFilter, priorityFilter, readFilter])

  // Mark as read
  const markAsRead = async (notificationIds: number[]) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(prev => 
            prev.map(n => 
              notificationIds.includes(n.id) 
                ? { ...n, isRead: true, readAt: new Date().toISOString() }
                : n
            )
          )
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        }
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  // Mark as unread
  const markAsUnread = async (notificationIds: number[]) => {
    try {
      const response = await fetch('/api/notifications/mark-unread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(prev => 
            prev.map(n => 
              notificationIds.includes(n.id) 
                ? { ...n, isRead: false, readAt: undefined }
                : n
            )
          )
          setUnreadCount(prev => prev + notificationIds.length)
        }
      }
    } catch (error) {
      console.error('Mark as unread error:', error)
    }
  }

  // Delete notifications
  const deleteNotifications = async (notificationIds: number[]) => {
    if (!confirm('Are you sure you want to delete the selected notifications? This operation cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/notifications/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(prev => 
            prev.filter(n => !notificationIds.includes(n.id))
          )
          setSelectedIds(prev => prev.filter(id => !notificationIds.includes(id)))
        }
      }
    } catch (error) {
      console.error('Delete notifications error:', error)
    }
  }

  // Select all/deselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id))
    }
  }

  // Mark all as read
  const markAllAsRead = () => {
    const unreadIds = filteredNotifications.filter(n => !n.isRead).map(n => n.id)
    if (unreadIds.length > 0) {
      markAsRead(unreadIds)
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement': return MessageSquare
      case 'event': return Calendar
      case 'registration': return Users
      case 'resource': return FileText
      case 'maintenance': return Wrench
      case 'newsletter': return FileText
      case 'reminder': return Clock
      case 'system': 
      default: return Bell
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': 
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Get type name
  const getTypeName = (type: string) => {
    switch (type) {
      case 'announcement': return 'Announcement'
      case 'event': return 'Event'
      case 'registration': return 'Registration'
      case 'resource': return 'Resource'
      case 'maintenance': return 'Maintenance'
      case 'newsletter': return 'Newsletter'
      case 'reminder': return 'Reminder'
      case 'system': return 'System'
      default: return type
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`
    return date.toLocaleDateString('zh-TW')
  }

  // 動畫變體
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border", className)}>
      {/* 標題欄 */}
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
              >
                <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* 展開狀態的搜尋和篩選 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b p-4"
            >
              <div className="space-y-4">
                {/* 搜尋欄 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋通知..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 篩選選項 */}
                <div className="grid grid-cols-3 gap-3">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有類型</SelectItem>
                      <SelectItem value="announcement">公告</SelectItem>
                      <SelectItem value="event">活動</SelectItem>
                      <SelectItem value="registration">報名</SelectItem>
                      <SelectItem value="resource">資源</SelectItem>
                      <SelectItem value="reminder">提醒</SelectItem>
                      <SelectItem value="system">系統</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="優先級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有優先級</SelectItem>
                      <SelectItem value="urgent">緊急</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={readFilter} onValueChange={setReadFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有狀態</SelectItem>
                      <SelectItem value="unread">未讀</SelectItem>
                      <SelectItem value="read">已讀</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 批量操作 */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">
                      已選中 {selectedIds.length} 個通知
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(selectedIds)}
                        className="h-7 px-2 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        標記已讀
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsUnread(selectedIds)}
                        className="h-7 px-2 text-xs"
                      >
                        <Circle className="w-3 h-3 mr-1" />
                        標記未讀
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotifications(selectedIds)}
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        刪除
                      </Button>
                    </div>
                  </div>
                )}

                {/* 快速操作 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-gray-600">全選</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={filteredNotifications.filter(n => !n.isRead).length === 0}
                    className="h-7 px-2 text-xs"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    全部標記已讀
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 通知列表 */}
        <div className={cn("overflow-y-auto", maxHeight)}>
          {error && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">載入中...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' || readFilter !== 'all'
                  ? '沒有符合條件的通知'
                  : '暫無通知'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y"
            >
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type)
                const isSelected = selectedIds.includes(notification.id)
                
                return (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                      !notification.isRead && "bg-blue-50/50",
                      isSelected && "bg-blue-100"
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead([notification.id])
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* 選擇框 */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(prev => [...prev, notification.id])
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== notification.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* 通知圖標 */}
                      <div className={cn(
                        "p-2 rounded-full",
                        getPriorityColor(notification.priority)
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* 通知內容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={cn(
                            "font-medium text-sm",
                            !notification.isRead && "text-gray-900",
                            notification.isRead && "text-gray-600"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p className={cn(
                          "text-sm mb-2",
                          !notification.isRead && "text-gray-700",
                          notification.isRead && "text-gray-500"
                        )}>
                          {compactMode && notification.message.length > 60
                            ? `${notification.message.substring(0, 60)}...`
                            : notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeName(notification.type)}
                            </Badge>
                            {notification.priority !== 'low' && (
                              <Badge
                                variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.priority === 'urgent' ? '緊急' 
                                  : notification.priority === 'high' ? '高優先級' 
                                  : '中優先級'}
                              </Badge>
                            )}
                          </div>

                          {/* 操作按鈕 */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.relatedId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // 處理跳轉邏輯
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </CardContent>
    </div>
  )
}