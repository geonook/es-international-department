/**
 * Unified InfoCard Component
 * 統一資訊卡片組件 - 替代所有現有卡片變體
 * 
 * Based on UI Designer recommendations:
 * - Single component for all card types
 * - Consistent styling and behavior
 * - Professional educational design
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Calendar,
  User, 
  Eye,
  MessageCircle,
  Pin,
  AlertTriangle,
  FileText,
  Bell,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from './badge'
import { Button } from './button'
import { designSystem } from '@/lib/design-system'
import { cn } from '@/lib/utils'

// 📋 InfoCard Types
export type InfoCardType = 'announcement' | 'message' | 'reminder' | 'document' | 'event'
export type InfoCardPriority = 'low' | 'medium' | 'high'
export type InfoCardStatus = 'draft' | 'published' | 'archived' | 'closed'

export interface InfoCardAction {
  label: string
  href?: string
  onClick?: () => void
  external?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
}

export interface InfoCardAuthor {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
}

export interface InfoCardProps {
  // Core Content
  id: string | number
  title: string
  content: string
  summary?: string
  
  // Categorization
  type: InfoCardType
  priority?: InfoCardPriority
  status?: InfoCardStatus
  sourceGroup?: string
  
  // Flags
  isPinned?: boolean
  isImportant?: boolean
  isFeatured?: boolean
  
  // Metadata
  author?: InfoCardAuthor
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  expiresAt?: string
  
  // Interaction Data
  viewCount?: number
  replyCount?: number
  
  // Actions
  primaryAction?: InfoCardAction
  secondaryActions?: InfoCardAction[]
  
  // Display Options
  showMetadata?: boolean
  showAuthor?: boolean
  showStats?: boolean
  truncateContent?: number
  
  // Styling
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

// 🎨 Get appropriate icon for card type
const getTypeIcon = (type: InfoCardType) => {
  switch (type) {
    case 'announcement': return FileText
    case 'message': return MessageCircle
    case 'reminder': return Bell
    case 'document': return FileText
    case 'event': return Calendar
    default: return FileText
  }
}

// 👤 Format author display name
const getAuthorName = (author?: InfoCardAuthor): string => {
  if (!author) return 'Unknown Author'
  return author.displayName || 
         `${author.firstName || ''} ${author.lastName || ''}`.trim() || 
         'Unknown Author'
}

// 📅 Format date display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ✂️ Truncate content
const truncateContent = (content: string, maxLength: number): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

export function InfoCard({
  id,
  title,
  content,
  summary,
  type,
  priority = 'medium',
  status = 'published',
  sourceGroup,
  isPinned = false,
  isImportant = false,
  isFeatured = false,
  author,
  createdAt,
  updatedAt,
  publishedAt,
  expiresAt,
  viewCount = 0,
  replyCount = 0,
  primaryAction,
  secondaryActions = [],
  showMetadata = true,
  showAuthor = true,
  showStats = true,
  truncateContent: truncateLength = 200,
  className,
  variant = 'default'
}: InfoCardProps) {
  
  // 🎨 Get styling variants
  const typeVariant = designSystem.utils.getColorVariant(type)
  const priorityVariant = designSystem.utils.getPriorityVariant(priority)
  const statusVariant = designSystem.utils.getStatusVariant(status)
  
  // 🔧 Component configuration
  const TypeIcon = getTypeIcon(type)
  const displayContent = summary || content
  const finalContent = truncateLength ? truncateContent(displayContent, truncateLength) : displayContent
  
  // 🎭 Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn(
        // Base styling
        'bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-lg overflow-hidden',
        'hover:shadow-xl transition-all duration-300',
        
        // Priority-based styling
        isPinned && 'ring-2 ring-amber-200',
        isImportant && 'ring-2 ring-red-200',
        isFeatured && 'ring-2 ring-blue-300',
        
        // Variant-specific styling
        variant === 'compact' && 'p-4',
        variant === 'featured' && 'bg-gradient-to-br from-blue-50 to-indigo-50',
        
        className
      )}
    >
      {/* 📌 Status Indicators */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* Type Icon */}
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            typeVariant.bg
          )}>
            <TypeIcon className={cn('w-4 h-4', typeVariant.icon)} />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          
          {/* Flags */}
          {isPinned && <Pin className="w-4 h-4 text-amber-500" />}
          {isImportant && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
        
        {/* Status Badge */}
        <Badge className={cn(
          'text-xs',
          statusVariant.bg,
          statusVariant.text
        )}>
          <div className={cn('w-2 h-2 rounded-full mr-1', statusVariant.dot)} />
          {status}
        </Badge>
      </div>

      {/* 📄 Content */}
      <div className="p-4">
        {/* Main Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {finalContent}
          </p>
        </div>

        {/* Source Group */}
        {sourceGroup && (
          <div className="mb-3">
            <Badge className={cn(
              'text-xs',
              typeVariant.bg,
              typeVariant.text
            )}>
              {sourceGroup}
            </Badge>
          </div>
        )}

        {/* Priority Indicator */}
        {priority !== 'medium' && (
          <div className="mb-3">
            <Badge className={cn(
              'text-xs',
              priorityVariant.bg,
              priorityVariant.text,
              priorityVariant.border
            )}>
              Priority: {priority.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      {/* 📊 Metadata & Stats */}
      {showMetadata && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            {/* Author & Date */}
            <div className="flex items-center gap-4">
              {showAuthor && author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{getAuthorName(author)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            {showStats && (viewCount > 0 || replyCount > 0) && (
              <div className="flex items-center gap-4">
                {viewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{viewCount}</span>
                  </div>
                )}
                {replyCount > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{replyCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⚡ Actions */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            {/* Secondary Actions */}
            <div className="flex items-center gap-2">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  asChild={!!action.href}
                >
                  {action.href ? (
                    <Link 
                      href={action.href}
                      target={action.external ? '_blank' : undefined}
                      rel={action.external ? 'noopener noreferrer' : undefined}
                    >
                      {action.label}
                      {action.external && <ExternalLink className="w-3 h-3 ml-1" />}
                    </Link>
                  ) : (
                    <>
                      {action.label}
                    </>
                  )}
                </Button>
              ))}
            </div>

            {/* Primary Action */}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'primary'}
                size="sm"
                onClick={primaryAction.onClick}
                asChild={!!primaryAction.href}
              >
                {primaryAction.href ? (
                  <Link 
                    href={primaryAction.href}
                    target={primaryAction.external ? '_blank' : undefined}
                    rel={primaryAction.external ? 'noopener noreferrer' : undefined}
                  >
                    {primaryAction.label}
                    <ChevronRight className="w-4 h-4 ml-1" />
                    {primaryAction.external && <ExternalLink className="w-3 h-3 ml-1" />}
                  </Link>
                ) : (
                  <>
                    {primaryAction.label}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// 🎯 Preset Variants for Common Use Cases
export const InfoCardPresets = {
  // Announcement card
  announcement: (props: Partial<InfoCardProps>) => ({
    type: 'announcement' as const,
    showStats: false,
    variant: 'default' as const,
    ...props
  }),

  // Message board post
  message: (props: Partial<InfoCardProps>) => ({
    type: 'message' as const,
    showStats: true,
    variant: 'default' as const,
    ...props
  }),

  // Reminder card
  reminder: (props: Partial<InfoCardProps>) => ({
    type: 'reminder' as const,
    showAuthor: false,
    variant: 'compact' as const,
    ...props
  }),

  // Document card
  document: (props: Partial<InfoCardProps>) => ({
    type: 'document' as const,
    showStats: false,
    truncateContent: 100,
    ...props
  }),

  // Featured content
  featured: (props: Partial<InfoCardProps>) => ({
    variant: 'featured' as const,
    isFeatured: true,
    truncateContent: 300,
    ...props
  })
}

export default InfoCard