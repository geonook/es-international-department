/**
 * Unified Communication Data Model
 * 統一通訊資料模型 - 整合 Announcements 和 MessageBoard
 * 
 * Based on Backend Architect recommendations:
 * - Single source of truth for all communication features
 * - Consistent field naming and validation
 * - Optimized for query performance
 */

import { z } from 'zod'

// 📋 Communication Types
export const CommunicationTypes = {
  ANNOUNCEMENT: 'announcement',
  MESSAGE: 'message', 
  REMINDER: 'reminder',
  NEWSLETTER: 'newsletter'
} as const

export type CommunicationType = typeof CommunicationTypes[keyof typeof CommunicationTypes]

// 📋 Priority Levels
export const PriorityLevels = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high'
} as const

export type PriorityLevel = typeof PriorityLevels[keyof typeof PriorityLevels]

// 📋 Status Values
export const StatusValues = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  CLOSED: 'closed'
} as const

export type StatusValue = typeof StatusValues[keyof typeof StatusValues]

// 📋 Target Audiences
export const TargetAudiences = {
  TEACHERS: 'teachers',
  PARENTS: 'parents', 
  ALL: 'all'
} as const

export type TargetAudience = typeof TargetAudiences[keyof typeof TargetAudiences]

// 📋 Board Types
export const BoardTypes = {
  TEACHERS: 'teachers',
  PARENTS: 'parents',
  GENERAL: 'general'
} as const

export type BoardType = typeof BoardTypes[keyof typeof BoardTypes]

// 📋 Source Groups (aligned with existing system)
export const SourceGroups = {
  VICKIE: 'Vickie',
  MATTHEW: 'Matthew',
  ACADEMIC_TEAM: 'Academic Team',
  CURRICULUM_TEAM: 'Curriculum Team', 
  INSTRUCTIONAL_TEAM: 'Instructional Team',
  GENERAL: 'general'
} as const

export type SourceGroup = typeof SourceGroups[keyof typeof SourceGroups]

// 🏗️ Base Communication Interface
export interface Communication {
  id: number
  title: string
  content: string
  summary?: string
  
  // Categorization
  type: CommunicationType
  sourceGroup?: SourceGroup
  
  // Audience targeting
  targetAudience: TargetAudience
  boardType: BoardType
  
  // Status and priority
  status: StatusValue
  priority: PriorityLevel
  
  // Flags
  isImportant: boolean
  isPinned: boolean
  isFeatured: boolean
  
  // Timing
  publishedAt?: Date
  expiresAt?: Date
  
  // Metadata
  authorId?: string
  viewCount: number
  replyCount: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Relations (populated when needed)
  author?: CommunicationAuthor
  replies?: CommunicationReply[]
}

// 👤 Author Interface
export interface CommunicationAuthor {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
}

// 💬 Reply Interface  
export interface CommunicationReply {
  id: number
  communicationId: number
  authorId?: string
  content: string
  parentReplyId?: number
  createdAt: Date
  updatedAt: Date
  
  // Relations
  author?: CommunicationAuthor
  parentReply?: CommunicationReply
  childReplies?: CommunicationReply[]
}

// ✅ Validation Schemas
export const createCommunicationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
    
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50,000 characters'),
    
  summary: z.string()
    .max(500, 'Summary must not exceed 500 characters')
    .optional(),
    
  type: z.enum([
    CommunicationTypes.ANNOUNCEMENT,
    CommunicationTypes.MESSAGE,
    CommunicationTypes.REMINDER,
    CommunicationTypes.NEWSLETTER
  ]),
  
  sourceGroup: z.enum([
    SourceGroups.VICKIE,
    SourceGroups.MATTHEW, 
    SourceGroups.ACADEMIC_TEAM,
    SourceGroups.CURRICULUM_TEAM,
    SourceGroups.INSTRUCTIONAL_TEAM,
    SourceGroups.GENERAL
  ]).optional(),
  
  targetAudience: z.enum([
    TargetAudiences.TEACHERS,
    TargetAudiences.PARENTS,
    TargetAudiences.ALL
  ]).default(TargetAudiences.ALL),
  
  boardType: z.enum([
    BoardTypes.TEACHERS,
    BoardTypes.PARENTS,
    BoardTypes.GENERAL
  ]).default(BoardTypes.GENERAL),
  
  priority: z.enum([
    PriorityLevels.LOW,
    PriorityLevels.MEDIUM,
    PriorityLevels.HIGH
  ]).default(PriorityLevels.MEDIUM),
  
  status: z.enum([
    StatusValues.DRAFT,
    StatusValues.PUBLISHED,
    StatusValues.ARCHIVED,
    StatusValues.CLOSED
  ]).default(StatusValues.DRAFT),
  
  isImportant: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  
  authorId: z.string().optional()
})

export const updateCommunicationSchema = createCommunicationSchema.partial()

// 💬 Reply validation
export const createReplySchema = z.object({
  content: z.string()
    .min(1, 'Reply content is required')
    .max(10000, 'Reply must not exceed 10,000 characters'),
    
  parentReplyId: z.number().optional(),
  authorId: z.string().optional()
})

// 🔍 Filter Schemas
export const communicationFiltersSchema = z.object({
  type: z.enum([
    CommunicationTypes.ANNOUNCEMENT,
    CommunicationTypes.MESSAGE,
    CommunicationTypes.REMINDER,
    CommunicationTypes.NEWSLETTER
  ]).optional(),
  
  sourceGroup: z.enum([
    SourceGroups.VICKIE,
    SourceGroups.MATTHEW,
    SourceGroups.ACADEMIC_TEAM,
    SourceGroups.CURRICULUM_TEAM,
    SourceGroups.INSTRUCTIONAL_TEAM,
    SourceGroups.GENERAL
  ]).optional(),
  
  targetAudience: z.enum([
    TargetAudiences.TEACHERS,
    TargetAudiences.PARENTS,
    TargetAudiences.ALL
  ]).optional(),
  
  boardType: z.enum([
    BoardTypes.TEACHERS,
    BoardTypes.PARENTS,
    BoardTypes.GENERAL
  ]).optional(),
  
  status: z.enum([
    StatusValues.DRAFT,
    StatusValues.PUBLISHED,
    StatusValues.ARCHIVED,
    StatusValues.CLOSED
  ]).optional(),
  
  priority: z.enum([
    PriorityLevels.LOW,
    PriorityLevels.MEDIUM,
    PriorityLevels.HIGH
  ]).optional(),
  
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  
  search: z.string().optional(),
  authorId: z.string().optional(),
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'replyCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// 📊 Statistics Interface
export interface CommunicationStats {
  total: number
  byType: Record<CommunicationType, number>
  byStatus: Record<StatusValue, number>
  byPriority: Record<PriorityLevel, number>
  pinned: number
  important: number
  featured: number
}

// 📋 List Response Interface
export interface CommunicationListResponse {
  communications: Communication[]
  stats: CommunicationStats
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 🎯 Type-specific interfaces for better type safety

// 📢 Announcement (legacy compatibility)
export interface AnnouncementData extends Omit<Communication, 'type'> {
  type: typeof CommunicationTypes.ANNOUNCEMENT
}

// 💬 Message Board Post (legacy compatibility) 
export interface MessageBoardData extends Omit<Communication, 'type'> {
  type: typeof CommunicationTypes.MESSAGE
}

// ⏰ Reminder (legacy compatibility)
export interface ReminderData extends Omit<Communication, 'type'> {
  type: typeof CommunicationTypes.REMINDER
}

// 📰 Newsletter (legacy compatibility)
export interface NewsletterData extends Omit<Communication, 'type'> {
  type: typeof CommunicationTypes.NEWSLETTER
}

// 🔧 Utility Functions
export const CommunicationUtils = {
  // Get display name for type
  getTypeName: (type: CommunicationType): string => {
    switch (type) {
      case CommunicationTypes.ANNOUNCEMENT: return 'Announcement'
      case CommunicationTypes.MESSAGE: return 'Message Board'
      case CommunicationTypes.REMINDER: return 'Reminder' 
      case CommunicationTypes.NEWSLETTER: return 'Newsletter'
      default: return 'Communication'
    }
  },
  
  // Get display name for source group
  getSourceGroupName: (sourceGroup?: SourceGroup): string => {
    if (!sourceGroup || sourceGroup === SourceGroups.GENERAL) return 'General'
    return sourceGroup
  },
  
  // Get display name for priority
  getPriorityName: (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevels.LOW: return 'Low'
      case PriorityLevels.MEDIUM: return 'Medium'
      case PriorityLevels.HIGH: return 'High'
      default: return 'Medium'
    }
  },
  
  // Get display name for status
  getStatusName: (status: StatusValue): string => {
    switch (status) {
      case StatusValues.DRAFT: return 'Draft'
      case StatusValues.PUBLISHED: return 'Published'
      case StatusValues.ARCHIVED: return 'Archived'
      case StatusValues.CLOSED: return 'Closed'
      default: return 'Draft'
    }
  },
  
  // Check if communication is visible to user role
  isVisibleToRole: (communication: Communication, userRole: string): boolean => {
    // Admin sees everything
    if (userRole === 'admin') return true
    
    // Office members see everything except drafts from other users
    if (userRole === 'office_member') {
      return communication.status !== StatusValues.DRAFT
    }
    
    // Viewers only see published content targeted to them
    if (userRole === 'viewer') {
      return communication.status === StatusValues.PUBLISHED &&
             (communication.targetAudience === TargetAudiences.ALL ||
              communication.targetAudience === TargetAudiences.TEACHERS)
    }
    
    return false
  },
  
  // Generate search index for full-text search
  generateSearchIndex: (communication: Communication): string => {
    return [
      communication.title,
      communication.content,
      communication.summary,
      communication.sourceGroup,
      CommunicationUtils.getTypeName(communication.type)
    ].filter(Boolean).join(' ').toLowerCase()
  }
}

// 📤 Export types for external use
export type CreateCommunicationData = z.infer<typeof createCommunicationSchema>
export type UpdateCommunicationData = z.infer<typeof updateCommunicationSchema>
export type CommunicationFilters = z.infer<typeof communicationFiltersSchema>
export type CreateReplyData = z.infer<typeof createReplySchema>

// Default export
export default Communication