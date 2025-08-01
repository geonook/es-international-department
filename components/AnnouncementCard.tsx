'use client'

/**
 * AnnouncementCard Component
 * 單一公告顯示卡片組件
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  GraduationCap,
  Globe
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  Announcement,
  AnnouncementCardProps,
  PRIORITY_COLORS,
  STATUS_COLORS,
  TARGET_AUDIENCE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '@/lib/types'

export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  onToggleExpand,
  isExpanded = false,
  showActions = true,
  className
}: AnnouncementCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded)
  const [isDeleting, setIsDeleting] = useState(false)

  // 處理展開/收合
  const handleToggleExpand = () => {
    const newExpanded = !localExpanded
    setLocalExpanded(newExpanded)
    onToggleExpand?.(announcement.id)
  }

  // 處理編輯
  const handleEdit = () => {
    onEdit?.(announcement)
  }

  // 處理刪除
  const handleDelete = async () => {
    if (!confirm('確定要刪除這個公告嗎？此操作無法復原。')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete?.(announcement.id)
    } catch (error) {
      console.error('Delete announcement error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'yyyy/MM/dd HH:mm', { locale: zhTW })
  }

  // 格式化相對時間
  const formatRelativeTime = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhTW })
  }

  // 檢查是否過期
  const isExpired = announcement.expiresAt ? 
    isAfter(new Date(), new Date(announcement.expiresAt)) : false

  // 檢查是否即將到期（7天內）
  const isExpiringSoon = announcement.expiresAt ? 
    isAfter(new Date(announcement.expiresAt), new Date()) && 
    isBefore(new Date(announcement.expiresAt), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : false

  // 取得目標對象圖示
  const getTargetAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'teachers':
        return <GraduationCap className="w-4 h-4" />
      case 'parents':
        return <Users className="w-4 h-4" />
      case 'all':
        return <Globe className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  // 取得優先級圖示
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Info className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const contentVariants = {
    collapsed: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    expanded: { 
      height: 'auto', 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        isExpired && "opacity-75 border-red-200 bg-red-50/30",
        isExpiringSoon && "border-orange-200 bg-orange-50/30",
        announcement.priority === 'high' && !isExpired && "border-red-200 bg-red-50/20",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "text-lg font-semibold leading-tight mb-2",
                isExpired && "text-gray-600"
              )}>
                {announcement.title}
              </CardTitle>

              {/* 摘要 */}
              {announcement.summary && (
                <p className={cn(
                  "text-sm text-gray-600 mb-3 line-clamp-2",
                  isExpired && "text-gray-500"
                )}>
                  {announcement.summary}
                </p>
              )}

              {/* 標籤和狀態 */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* 狀態標籤 */}
                <Badge 
                  variant={STATUS_COLORS[announcement.status] as any}
                  className="flex items-center gap-1"
                >
                  {announcement.status === 'published' && <Eye className="w-3 h-3" />}
                  {announcement.status === 'draft' && <EyeOff className="w-3 h-3" />}
                  {STATUS_LABELS[announcement.status]}
                </Badge>

                {/* 優先級標籤 */}
                <Badge 
                  variant={PRIORITY_COLORS[announcement.priority] as any}
                  className="flex items-center gap-1"
                >
                  {getPriorityIcon(announcement.priority)}
                  {PRIORITY_LABELS[announcement.priority]}
                </Badge>

                {/* 目標對象標籤 */}
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTargetAudienceIcon(announcement.targetAudience)}
                  {TARGET_AUDIENCE_LABELS[announcement.targetAudience]}
                </Badge>

                {/* 過期警告 */}
                {isExpired && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    已過期
                  </Badge>
                )}

                {/* 即將到期警告 */}
                {isExpiringSoon && !isExpired && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
                    <Clock className="w-3 h-3" />
                    即將到期
                  </Badge>
                )}
              </div>

              {/* 作者和時間資訊 */}
              <div className="flex items-center text-xs text-gray-500 gap-4">
                {announcement.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>
                      {announcement.author.displayName || 
                       `${announcement.author.firstName} ${announcement.author.lastName}`.trim() ||
                       announcement.author.email}
                    </span>
                  </div>
                )}

                {announcement.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatRelativeTime(announcement.publishedAt)}</span>
                  </div>
                )}

                {announcement.expiresAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>到期: {formatDate(announcement.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center gap-1">
              {/* 展開/收合按鈕 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-8 w-8 p-0"
              >
                {localExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {/* 編輯和刪除按鈕 */}
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className={cn(
                      "w-4 h-4",
                      isDeleting && "animate-pulse"
                    )} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 展開的內容 */}
        <AnimatePresence>
          {localExpanded && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="pt-0">
                {/* 警告訊息 */}
                {isExpired && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      此公告已於 {formatDate(announcement.expiresAt)} 過期
                    </AlertDescription>
                  </Alert>
                )}

                {isExpiringSoon && !isExpired && (
                  <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      此公告將於 {formatDate(announcement.expiresAt)} 到期
                    </AlertDescription>
                  </Alert>
                )}

                {/* 完整內容 */}
                <div className={cn(
                  "prose prose-sm max-w-none",
                  isExpired && "text-gray-600"
                )}>
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: announcement.content.replace(/\n/g, '<br />') 
                    }}
                  />
                </div>

                {/* 詳細資訊 */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <strong>建立時間:</strong> {formatDate(announcement.createdAt)}
                    </div>
                    <div>
                      <strong>更新時間:</strong> {formatDate(announcement.updatedAt)}
                    </div>
                    {announcement.publishedAt && (
                      <div>
                        <strong>發布時間:</strong> {formatDate(announcement.publishedAt)}
                      </div>
                    )}
                    {announcement.expiresAt && (
                      <div>
                        <strong>到期時間:</strong> {formatDate(announcement.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}