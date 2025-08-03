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

// 報名狀態類型
export type EventRegistrationStatus = 'confirmed' | 'waiting_list' | 'cancelled'

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
  participantName?: string
  participantEmail?: string
  participantPhone?: string
  grade?: string
  specialRequests?: string
  status: EventRegistrationStatus
  registeredAt: Date | string
  checkedIn: boolean
  checkedInAt?: Date | string
  attendanceNotes?: string
  createdAt: Date | string
  updatedAt: Date | string
}

// 報名表單資料
export interface RegistrationFormData {
  eventId: number
  participantName?: string
  participantEmail?: string
  participantPhone?: string
  grade?: string
  specialRequests?: string
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
  updateRegistrationStatus: (registrationId: number, status: EventRegistrationStatus) => Promise<EventRegistration>
  refetch: () => Promise<void>
}

// ========================================
// 活動通知系統類型定義 | Event Notification System Types
// ========================================

// 通知類型
export type EventNotificationType = 
  | 'reminder'              // 提醒
  | 'update'                // 更新
  | 'cancellation'          // 取消
  | 'registration_confirmed' // 報名確認
  | 'registration_waitlist'  // 候補名單
  | 'registration_cancelled' // 取消報名
  | 'event_start'           // 活動開始
  | 'event_completed'       // 活動結束

// 通知接收者類型
export type NotificationRecipientType =
  | 'all_registered'        // 所有報名者
  | 'specific_users'        // 特定用戶
  | 'target_audience'       // 目標對象
  | 'grade_level'           // 特定年級

// 通知狀態
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

// 活動通知介面
export interface EventNotification {
  id: number
  eventId: number
  type: EventNotificationType
  recipientType: NotificationRecipientType
  title: string
  message: string
  scheduledFor?: Date | string
  sentAt?: Date | string
  status: NotificationStatus
  recipientCount: number
  deliveredCount: number
  errorMessage?: string
  createdBy?: string
  creator?: {
    id: string
    displayName?: string
    firstName?: string
    lastName?: string
  }
  createdAt: Date | string
  updatedAt: Date | string
}

// 通知表單資料
export interface NotificationFormData {
  eventId: number
  type: EventNotificationType
  recipientType: NotificationRecipientType
  title: string
  message: string
  scheduledFor?: string
  targetGrades?: string[]
  specificUserIds?: string[]
}

// ========================================
// 活動日曆系統類型定義 | Event Calendar System Types
// ========================================

// 日曆活動介面
export interface CalendarEvent {
  id: number
  title: string
  start: Date | string
  end?: Date | string
  startTime?: Date | string
  endTime?: Date | string
  location?: string
  eventType: EventType
  targetGrades?: string[]
  description?: string
  creator?: string
  registrationRequired: boolean
  registrationDeadline?: Date | string
  maxParticipants?: number
  registrationCount: number
  spotsRemaining?: number
  userRegistration?: {
    id: number
    status: EventRegistrationStatus
    participantName?: string
    grade?: string
  }
  isUserRegistered: boolean
  className?: string
  color: string
  allDay: boolean
  url?: string
}

// 日曆查詢參數
export interface CalendarFilters {
  year: number
  month?: number
  eventType?: EventType | 'all'
  targetGrade?: string
  userOnly?: boolean
}

// 日曆統計資訊
export interface CalendarStats {
  totalEvents: number
  byType: Record<string, number>
  byMonth: Record<string, number>
  userRegistrations: number
}

// 日曆回應資料
export interface CalendarResponse extends ApiResponse {
  data: {
    events: CalendarEvent[]
    groupedByMonth?: Record<string, CalendarEvent[]>
    period: {
      year: number
      month?: number
      startDate: Date | string
      endDate: Date | string
    }
    stats: CalendarStats
  }
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

// ========================================
// 日曆管理系統類型定義 | Calendar Management System Types
// ========================================

import { EventInput } from '@fullcalendar/core'

// 日曆檢視模式
export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' | 'multiMonthYear'

// FullCalendar 事件介面（基於 Event 介面）
export interface CalendarEvent extends EventInput {
  id: string | number
  title: string
  start: Date | string
  end?: Date | string
  allDay?: boolean
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  classNames?: string[]
  extendedProps?: {
    event: Event
    eventType: EventType
    status: EventStatus
    location?: string
    description?: string
    registrationCount?: number
    maxParticipants?: number
    registrationRequired?: boolean
  }
}

// 日曆配置
export interface CalendarConfig {
  initialView: CalendarView
  headerToolbar: {
    left: string
    center: string
    right: string
  }
  height: string | number
  locale: string
  firstDay: number
  weekends: boolean
  slotMinTime: string
  slotMaxTime: string
  slotDuration: string
  selectable: boolean
  selectMirror: boolean
  dayMaxEvents: boolean | number
  moreLinkClick: string
  eventTimeFormat: {
    hour: 'numeric' | '2-digit'
    minute: '2-digit'
    meridiem: boolean
  }
  slotLabelFormat: {
    hour: 'numeric' | '2-digit'
    minute: '2-digit'
    meridiem: boolean
  }
}

// 日曆事件操作
export interface CalendarEventActions {
  onEventClick?: (info: any) => void
  onEventDrop?: (info: any) => void
  onEventResize?: (info: any) => void
  onSelect?: (info: any) => void
  onDateClick?: (info: any) => void
  onEventMouseEnter?: (info: any) => void
  onEventMouseLeave?: (info: any) => void
}

// 日曆事件衝突檢測
export interface EventConflict {
  event1: Event
  event2: Event
  type: 'time_overlap' | 'resource_conflict' | 'location_conflict'
  description: string
  severity: 'warning' | 'error'
}

// 日曆篩選器
export interface CalendarFilters extends EventFilters {
  viewType?: CalendarView
  showWeekends?: boolean
  eventTypes?: EventType[]
  statuses?: EventStatus[]
}

// 日曆組件 Props
export interface EventCalendarProps {
  events?: Event[]
  loading?: boolean
  error?: string
  view?: CalendarView
  filters?: CalendarFilters
  config?: Partial<CalendarConfig>
  actions?: CalendarEventActions
  onEventCreate?: (eventData: Partial<EventFormData>) => void
  onEventUpdate?: (eventId: number, eventData: Partial<EventFormData>) => void
  onEventDelete?: (eventId: number) => void
  onViewChange?: (view: CalendarView) => void
  onFiltersChange?: (filters: CalendarFilters) => void
  showCreateModal?: boolean
  showEditModal?: boolean
  selectedEvent?: Event | null
  className?: string
}

// 日曆工具列配置
export interface CalendarToolbarConfig {
  showViewButtons?: boolean
  showTodayButton?: boolean
  showPrevNext?: boolean
  showTitle?: boolean
  customButtons?: Record<string, {
    text: string
    click: () => void
  }>
}

// 日曆主題配置
export interface CalendarTheme {
  eventColors: Record<EventType, {
    backgroundColor: string
    borderColor: string
    textColor: string
  }>
  statusColors: Record<EventStatus, {
    backgroundColor: string
    borderColor: string
    textColor: string
  }>
}

// 默認日曆主題
export const DEFAULT_CALENDAR_THEME: CalendarTheme = {
  eventColors: {
    meeting: {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF'
    },
    celebration: {
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      textColor: '#FFFFFF'
    },
    academic: {
      backgroundColor: '#10B981',
      borderColor: '#059669',
      textColor: '#FFFFFF'
    },
    sports: {
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      textColor: '#FFFFFF'
    },
    cultural: {
      backgroundColor: '#EC4899',
      borderColor: '#DB2777',
      textColor: '#FFFFFF'
    },
    workshop: {
      backgroundColor: '#06B6D4',
      borderColor: '#0891B2',
      textColor: '#FFFFFF'
    },
    performance: {
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      textColor: '#FFFFFF'
    },
    parent_meeting: {
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      textColor: '#FFFFFF'
    },
    coffee_session: {
      backgroundColor: '#14B8A6',
      borderColor: '#0D9488',
      textColor: '#FFFFFF'
    },
    other: {
      backgroundColor: '#6B7280',
      borderColor: '#4B5563',
      textColor: '#FFFFFF'
    }
  },
  statusColors: {
    draft: {
      backgroundColor: '#9CA3AF',
      borderColor: '#6B7280',
      textColor: '#FFFFFF'
    },
    published: {
      backgroundColor: '#10B981',
      borderColor: '#059669',
      textColor: '#FFFFFF'
    },
    in_progress: {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF'
    },
    completed: {
      backgroundColor: '#059669',
      borderColor: '#047857',
      textColor: '#FFFFFF'
    },
    cancelled: {
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF'
    },
    postponed: {
      backgroundColor: '#EAB308',
      borderColor: '#CA8A04',
      textColor: '#FFFFFF'
    }
  }
}

// 日曆本地化配置
export const CALENDAR_LOCALE_CONFIG = {
  code: 'zh-tw',
  week: {
    dow: 0, // Sunday = 0
    doy: 4  // The week that contains Jan 4th is the first week of the year
  },
  buttonText: {
    prev: '上一頁',
    next: '下一頁',
    today: '今天',
    month: '月檢視',
    week: '週檢視',
    day: '日檢視',
    list: '列表檢視'
  },
  weekText: '週',
  allDayText: '全天',
  moreLinkText: '顯示更多',
  noEventsText: '沒有活動'
}