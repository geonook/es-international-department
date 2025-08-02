'use client'

/**
 * AnnouncementCard Component
 * 單一公告顯示卡片組件
 */

import { useState, useCallback } from 'react'
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
  Globe,
  Image,
  Maximize2,
  X,
  Download,
  ExternalLink
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Set<string>>(new Set())

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

  // 處理圖片點擊放大
  const handleImageClick = useCallback((imageSrc: string) => {
    setLightboxImage(imageSrc)
  }, [])

  // 關閉圖片燈箱
  const handleCloseLightbox = useCallback(() => {
    setLightboxImage(null)
  }, [])

  // 處理圖片載入錯誤
  const handleImageError = useCallback((imageSrc: string) => {
    setImageError(prev => new Set([...prev, imageSrc]))
  }, [])

  // 檢查內容是否包含圖片
  const hasImages = announcement.content.includes('<img')
  
  // 提取圖片數量
  const getImageCount = () => {
    const imgMatches = announcement.content.match(/<img[^>]*>/g)
    return imgMatches ? imgMatches.length : 0
  }

  // 處理圖片內容渲染
  const renderContentWithClickableImages = (content: string) => {
    return content.replace(
      /<img([^>]*?)src=["']([^"']*)["']([^>]*?)>/g,
      (match, beforeSrc, src, afterSrc) => {
        const alt = match.match(/alt=["']([^"']*)["']/)?.[1] || ''
        const style = 'max-width: 100%; height: auto; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease; hover:transform: scale(1.02);'
        return `<img${beforeSrc}src="${src}"${afterSrc} alt="${alt}" style="${style}" onclick="window.handleAnnouncementImageClick && window.handleAnnouncementImageClick('${src}')" />`
      }
    )
  }

  // 設置全局圖片點擊處理器
  if (typeof window !== 'undefined') {
    (window as any).handleAnnouncementImageClick = handleImageClick
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

                {/* 圖片標籤 */}
                {hasImages && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {getImageCount()} 張圖片
                  </Badge>
                )}

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
                  "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:cursor-pointer",
                  "[&_img:hover]:shadow-md [&_img:hover]:scale-[1.02] [&_img]:transition-all [&_img]:duration-200",
                  "[&_p]:mb-3 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-2",
                  "[&_ul]:mb-3 [&_ol]:mb-3 [&_blockquote]:mb-3",
                  isExpired && "text-gray-600"
                )}>
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: hasImages ? 
                        renderContentWithClickableImages(announcement.content) : 
                        announcement.content.replace(/\n/g, '<br />') 
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

      {/* 圖片燈箱 */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleCloseLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 關閉按鈕 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseLightbox}
                className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* 下載按鈕 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = lightboxImage
                  link.download = 'announcement-image'
                  link.click()
                }}
                className="absolute -top-2 -right-12 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                title="下載圖片"
              >
                <Download className="w-4 h-4" />
              </Button>

              {/* 圖片 */}
              <img
                src={lightboxImage}
                alt="放大檢視"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={() => handleImageError(lightboxImage)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}