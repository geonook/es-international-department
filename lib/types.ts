/**
 * TypeScript Type Definitions
 * TypeScript 類型定義
 */

// 基礎用戶類型（擴展自 useAuth.ts）
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
  avatar?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  preferences?: any
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

// 公告相關類型
export type AnnouncementTargetAudience = 'teachers' | 'parents' | 'all'
export type AnnouncementPriority = 'low' | 'medium' | 'high'
export type AnnouncementStatus = 'draft' | 'published' | 'archived'

// 公告介面
export interface Announcement {
  id: number
  title: string
  content: string
  summary?: string
  authorId: string
  author?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    displayName?: string
  }
  targetAudience: AnnouncementTargetAudience
  priority: AnnouncementPriority
  status: AnnouncementStatus
  publishedAt?: Date | string
  expiresAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

// 公告表單資料
export interface AnnouncementFormData {
  title: string
  content: string
  summary?: string
  targetAudience: AnnouncementTargetAudience
  priority: AnnouncementPriority
  status: AnnouncementStatus
  publishedAt?: string
  expiresAt?: string
}

// 公告篩選參數
export interface AnnouncementFilters {
  targetAudience?: AnnouncementTargetAudience | 'all'
  priority?: AnnouncementPriority
  status?: AnnouncementStatus
  search?: string
}

// 分頁資訊
export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// API 回應類型
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

// 公告列表 API 回應
export interface AnnouncementListResponse extends ApiResponse {
  data: Announcement[]
  pagination: PaginationInfo
  filters: AnnouncementFilters
}

// 單一公告 API 回應
export interface AnnouncementResponse extends ApiResponse {
  data: Announcement
}

// 組件 Props 類型
export interface AnnouncementCardProps {
  announcement: Announcement
  onEdit?: (announcement: Announcement) => void
  onDelete?: (announcementId: number) => void
  onToggleExpand?: (announcementId: number) => void
  isExpanded?: boolean
  showActions?: boolean
  className?: string
}

export interface AnnouncementListProps {
  announcements?: Announcement[]
  loading?: boolean
  error?: string
  onEdit?: (announcement: Announcement) => void
  onDelete?: (announcementId: number) => void
  onFiltersChange?: (filters: AnnouncementFilters) => void
  onPageChange?: (page: number) => void
  pagination?: PaginationInfo
  filters?: AnnouncementFilters
  showActions?: boolean
  className?: string
}

export interface AnnouncementFormProps {
  announcement?: Announcement
  onSubmit: (data: AnnouncementFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string
  mode?: 'create' | 'edit'
  className?: string
}

export interface AnnouncementManagerProps {
  className?: string
}

// 表單驗證錯誤
export interface FormValidationErrors {
  title?: string
  content?: string
  summary?: string
  targetAudience?: string
  priority?: string
  status?: string
  publishedAt?: string
  expiresAt?: string
}

// 統計資訊
export interface AnnouncementStats {
  total: number
  published: number
  draft: number
  archived: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
  byTargetAudience: {
    teachers: number
    parents: number
    all: number
  }
}

// 載入狀態
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 操作狀態
export interface OperationState {
  loading: boolean
  error?: string
  success?: string
}

// 表單狀態
export interface FormState extends OperationState {
  data: AnnouncementFormData
  errors: FormValidationErrors
  isDirty: boolean
  isValid: boolean
}

// 搜尋和篩選狀態
export interface FilterState {
  search: string
  targetAudience: AnnouncementTargetAudience | 'all'
  priority: AnnouncementPriority | ''
  status: AnnouncementStatus | ''
}

// 排序選項
export type SortOption = 'newest' | 'oldest' | 'priority' | 'title'

export interface SortState {
  sortBy: SortOption
  sortOrder: 'asc' | 'desc'
}

// Hook 回傳類型
export interface UseAnnouncementsReturn {
  announcements: Announcement[]
  loading: boolean
  error?: string
  pagination: PaginationInfo
  filters: AnnouncementFilters
  stats?: AnnouncementStats
  fetchAnnouncements: (filters?: AnnouncementFilters, page?: number) => Promise<void>
  createAnnouncement: (data: AnnouncementFormData) => Promise<Announcement>
  updateAnnouncement: (id: number, data: Partial<AnnouncementFormData>) => Promise<Announcement>
  deleteAnnouncement: (id: number) => Promise<void>
  refetch: () => Promise<void>
}

// 主題相關類型
export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
}

// 優先級顏色映射
export const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  high: 'destructive',
  medium: 'default', 
  low: 'secondary'
}

// 狀態顏色映射
export const STATUS_COLORS: Record<AnnouncementStatus, string> = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline'
}

// 目標對象標籤映射
export const TARGET_AUDIENCE_LABELS: Record<AnnouncementTargetAudience | 'all', string> = {
  teachers: '教師',
  parents: '家長',
  all: '所有人'
}

// 優先級標籤映射
export const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  high: '高優先級',
  medium: '一般',
  low: '低優先級'
}

// 狀態標籤映射
export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  published: '已發布',
  draft: '草稿',
  archived: '已封存'
}