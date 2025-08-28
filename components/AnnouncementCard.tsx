'use client'

/**
 * AnnouncementCard Component
 * Single announcement display card component
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
import { Checkbox } from '@/components/ui/checkbox'
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
  onSelect,
  isExpanded = false,
  isSelected = false,
  showActions = true,
  enableSelection = false,
  className
}: AnnouncementCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Set<string>>(new Set())

  // Handle expand/collapse
  const handleToggleExpand = () => {
    const newExpanded = !localExpanded
    setLocalExpanded(newExpanded)
    onToggleExpand?.(announcement.id)
  }

  // Handle edit
  const handleEdit = () => {
    onEdit?.(announcement)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
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

  // Handle selection
  const handleSelect = (checked: boolean) => {
    onSelect?.(announcement.id, checked)
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'yyyy/MM/dd HH:mm', { locale: zhTW })
  }

  // Format relative time
  const formatRelativeTime = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhTW })
  }

  // Check if expired
  const isExpired = announcement.expiresAt ? 
    isAfter(new Date(), new Date(announcement.expiresAt)) : false

  // Check if expiring soon (within 7 days)
  const isExpiringSoon = announcement.expiresAt ? 
    isAfter(new Date(announcement.expiresAt), new Date()) && 
    isBefore(new Date(announcement.expiresAt), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : false

  // Get target audience icon
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

  // Get priority icon
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

  // Handle image click to enlarge
  const handleImageClick = useCallback((imageSrc: string) => {
    setLightboxImage(imageSrc)
  }, [])

  // Close image lightbox
  const handleCloseLightbox = useCallback(() => {
    setLightboxImage(null)
  }, [])

  // Handle image load error
  const handleImageError = useCallback((imageSrc: string) => {
    setImageError(prev => new Set([...prev, imageSrc]))
  }, [])

  // Check if content contains images
  const hasImages = announcement.content.includes('<img')
  
  // Extract image count
  const getImageCount = () => {
    const imgMatches = announcement.content.match(/<img[^>]*>/g)
    return imgMatches ? imgMatches.length : 0
  }

  // Handle image content rendering
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

  // Set global image click handler
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
        isSelected && "ring-2 ring-blue-500 border-blue-300 bg-blue-50/30",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Selection checkbox */}
            {enableSelection && (
              <div className="flex items-start pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelect}
                  className="mt-1"
                  aria-label={`Select announcement: ${announcement.title}`}
                />
              </div>
            )}
            
            <div className={cn(
              "flex-1 min-w-0",
              enableSelection && "ml-3"
            )}>
              <CardTitle className={cn(
                "text-lg font-semibold leading-tight mb-2",
                isExpired && "text-gray-600"
              )}>
                {announcement.title}
              </CardTitle>

              {/* Summary */}
              {announcement.summary && (
                <p className={cn(
                  "text-sm text-gray-600 mb-3 line-clamp-2",
                  isExpired && "text-gray-500"
                )}>
                  {announcement.summary}
                </p>
              )}

              {/* Tags and status */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Status badge */}
                <Badge 
                  variant={STATUS_COLORS[announcement.status] as any}
                  className="flex items-center gap-1"
                >
                  {announcement.status === 'published' && <Eye className="w-3 h-3" />}
                  {announcement.status === 'draft' && <EyeOff className="w-3 h-3" />}
                  {STATUS_LABELS[announcement.status]}
                </Badge>

                {/* Priority badge */}
                <Badge 
                  variant={PRIORITY_COLORS[announcement.priority] as any}
                  className="flex items-center gap-1"
                >
                  {getPriorityIcon(announcement.priority)}
                  {PRIORITY_LABELS[announcement.priority]}
                </Badge>

                {/* Target audience badge */}
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTargetAudienceIcon(announcement.targetAudience)}
                  {TARGET_AUDIENCE_LABELS[announcement.targetAudience]}
                </Badge>

                {/* Image badge */}
                {hasImages && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {getImageCount()} images
                  </Badge>
                )}

                {/* Expiration warning */}
                {isExpired && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expired
                  </Badge>
                )}

                {/* Expiring soon warning */}
                {isExpiringSoon && !isExpired && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
                    <Clock className="w-3 h-3" />
                    Expiring Soon
                  </Badge>
                )}
              </div>

              {/* Author and time information */}
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
                    <span>Expires: {formatDate(announcement.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Expand/collapse button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-8 w-8 p-0"
                title={localExpanded ? "Collapse content" : "Expand content"}
              >
                {localExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {/* Edit and delete buttons */}
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    title="Edit announcement"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    title="Delete announcement"
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

        {/* Expanded content */}
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
                {/* Warning messages */}
                {isExpired && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This announcement expired on {formatDate(announcement.expiresAt)}
                    </AlertDescription>
                  </Alert>
                )}

                {isExpiringSoon && !isExpired && (
                  <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      This announcement will expire on {formatDate(announcement.expiresAt)}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Full content */}
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

                {/* Detailed information */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <strong>Created:</strong> {formatDate(announcement.createdAt)}
                    </div>
                    <div>
                      <strong>Updated:</strong> {formatDate(announcement.updatedAt)}
                    </div>
                    {announcement.publishedAt && (
                      <div>
                        <strong>Published:</strong> {formatDate(announcement.publishedAt)}
                      </div>
                    )}
                    {announcement.expiresAt && (
                      <div>
                        <strong>Expires:</strong> {formatDate(announcement.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Image lightbox */}
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
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseLightbox}
                className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Download button */}
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
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </Button>

              {/* Image */}
              <img
                src={lightboxImage}
                alt="Enlarged view"
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