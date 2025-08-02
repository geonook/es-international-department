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

// ========================================
// 活動管理系統類型定義 | Event Management System Types
// ========================================

// 活動類型
export type EventType = 
  | 'meeting'         // 會議
  | 'celebration'     // 慶典
  | 'academic'        // 學術活動
  | 'sports'          // 體育活動
  | 'cultural'        // 文化活動
  | 'workshop'        // 工作坊
  | 'performance'     // 表演
  | 'parent_meeting'  // 家長會
  | 'coffee_session'  // 校長有約
  | 'other'           // 其他

// 活動狀態
export type EventStatus = 
  | 'draft'           // 草稿
  | 'published'       // 已發布
  | 'in_progress'     // 進行中
  | 'completed'       // 已完成
  | 'cancelled'       // 已取消
  | 'postponed'       // 已延期

// 報名狀態
export type RegistrationStatus = 
  | 'open'            // 開放報名
  | 'closed'          // 報名截止
  | 'full'            // 名額已滿
  | 'cancelled'       // 已取消

// 活動介面
export interface Event {
  id: number
  title: string
  description?: string
  eventType: EventType
  startDate: Date | string
  endDate?: Date | string
  startTime?: Date | string
  endTime?: Date | string
  location?: string
  maxParticipants?: number
  registrationRequired: boolean
  registrationDeadline?: Date | string
  targetGrades?: string[] // JSON array from Prisma
  createdBy: string
  creator?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    displayName?: string
  }
  status: EventStatus
  createdAt: Date | string
  updatedAt: Date | string
  // 計算欄位
  registrationCount?: number
  availableSlots?: number
  isRegistrationOpen?: boolean
  daysUntilEvent?: number
}

// 活動表單資料
export interface EventFormData {
  title: string
  description?: string
  eventType: EventType
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  location?: string
  maxParticipants?: number
  registrationRequired: boolean
  registrationDeadline?: string
  targetGrades?: string[]
  status: EventStatus
}

// 活動篩選參數
export interface EventFilters {
  eventType?: EventType | 'all'
  status?: EventStatus | 'all'
  targetGrade?: string
  registrationRequired?: boolean
  dateRange?: {
    start?: string
    end?: string
  }
  search?: string
}

// 活動統計資訊
export interface EventStats {
  total: number
  published: number
  draft: number
  inProgress: number
  completed: number
  cancelled: number
  byType: Record<EventType, number>
  byMonth: Record<string, number>
  totalRegistrations: number
  averageParticipants: number
}

// 報名管理介面
export interface EventRegistration {
  id: number
  eventId: number
  userId: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    displayName?: string
    phone?: string
  }
  status: 'registered' | 'waiting' | 'cancelled'
  registeredAt: Date | string
  notes?: string
  priority?: number // For waiting list ordering
}

// 報名表單資料
export interface RegistrationFormData {
  eventId: number
  notes?: string
}

// 活動組件 Props
export interface EventCardProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (eventId: number) => void
  onView?: (event: Event) => void
  onManageRegistrations?: (event: Event) => void
  showActions?: boolean
  showRegistrationInfo?: boolean
  className?: string
}

export interface EventListProps {
  events?: Event[]
  loading?: boolean
  error?: string
  onEdit?: (event: Event) => void
  onDelete?: (eventId: number) => void
  onView?: (event: Event) => void
  onManageRegistrations?: (event: Event) => void
  onFiltersChange?: (filters: EventFilters) => void
  onPageChange?: (page: number) => void
  pagination?: PaginationInfo
  filters?: EventFilters
  showActions?: boolean
  className?: string
}

export interface EventFormProps {
  event?: Event
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string
  mode?: 'create' | 'edit'
  className?: string
}

export interface EventManagerProps {
  className?: string
}

// 活動 API 回應類型
export interface EventListResponse extends ApiResponse {
  data: Event[]
  pagination: PaginationInfo
  filters: EventFilters
  stats?: EventStats
}

export interface EventResponse extends ApiResponse {
  data: Event
}

export interface RegistrationListResponse extends ApiResponse {
  data: EventRegistration[]
  pagination: PaginationInfo
  event: Event
}

// Hook 回傳類型
export interface UseEventsReturn {
  events: Event[]
  loading: boolean
  error?: string
  pagination: PaginationInfo
  filters: EventFilters
  stats?: EventStats
  fetchEvents: (filters?: EventFilters, page?: number) => Promise<void>
  createEvent: (data: EventFormData) => Promise<Event>
  updateEvent: (id: number, data: Partial<EventFormData>) => Promise<Event>
  deleteEvent: (id: number) => Promise<void>
  refetch: () => Promise<void>
}

export interface UseEventRegistrationsReturn {
  registrations: EventRegistration[]
  loading: boolean
  error?: string
  pagination: PaginationInfo
  event?: Event
  fetchRegistrations: (eventId: number, page?: number) => Promise<void>
  registerForEvent: (data: RegistrationFormData) => Promise<EventRegistration>
  cancelRegistration: (registrationId: number) => Promise<void>
  updateRegistrationStatus: (registrationId: number, status: string) => Promise<EventRegistration>
  refetch: () => Promise<void>
}

// 活動類型標籤映射
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: '會議',
  celebration: '慶典',
  academic: '學術活動',
  sports: '體育活動',
  cultural: '文化活動',
  workshop: '工作坊',
  performance: '表演',
  parent_meeting: '家長會',
  coffee_session: '校長有約',
  other: '其他'
}

// 活動狀態標籤映射
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: '草稿',
  published: '已發布',
  in_progress: '進行中',
  completed: '已完成',
  cancelled: '已取消',
  postponed: '已延期'
}

// 活動類型顏色映射
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  meeting: 'blue',
  celebration: 'purple',
  academic: 'green',
  sports: 'orange',
  cultural: 'pink',
  workshop: 'cyan',
  performance: 'violet',
  parent_meeting: 'amber',
  coffee_session: 'teal',
  other: 'gray'
}

// 活動狀態顏色映射
export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'gray',
  published: 'green',
  in_progress: 'blue',
  completed: 'emerald',
  cancelled: 'red',
  postponed: 'yellow'
}

// 年級選項
export const GRADE_OPTIONS = [
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '1-2', label: 'Grades 1-2' },
  { value: '3-4', label: 'Grades 3-4' },
  { value: '5-6', label: 'Grades 5-6' },
  { value: 'all', label: 'All Grades' }
]