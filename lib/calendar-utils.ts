/**
 * Calendar Utilities
 * 日曆工具函式
 * 
 * @description 日曆相關的工具函式和助手方法
 * @features 事件轉換、日期處理、衝突檢測、顏色管理
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { format, parseISO, startOfDay, endOfDay, isSameDay, isWithinInterval } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { 
  Event, 
  CalendarEvent, 
  EventConflict, 
  EventType, 
  EventStatus,
  DEFAULT_CALENDAR_THEME
} from '@/lib/types'

/**
 * 將 Event 轉換為 FullCalendar 事件格式
 */
export function convertEventToCalendarEvent(event: Event): CalendarEvent {
  const theme = DEFAULT_CALENDAR_THEME.eventColors[event.eventType] || DEFAULT_CALENDAR_THEME.eventColors.other
  const statusTheme = DEFAULT_CALENDAR_THEME.statusColors[event.status]
  
  // 根據狀態調整顏色
  let backgroundColor = theme.backgroundColor
  let borderColor = theme.borderColor
  let textColor = theme.textColor
  
  if (event.status === 'cancelled') {
    backgroundColor = statusTheme.backgroundColor
    borderColor = statusTheme.borderColor
  } else if (event.status === 'draft') {
    backgroundColor = statusTheme.backgroundColor
    borderColor = statusTheme.borderColor
  }

  // 處理全天事件
  const isAllDay = !event.startTime && !event.endTime
  
  // 組合日期和時間
  let startDateTime: Date | string = event.startDate
  let endDateTime: Date | string = event.endDate || event.startDate

  if (!isAllDay && event.startTime) {
    startDateTime = `${event.startDate}T${event.startTime}`
  }
  
  if (!isAllDay && event.endTime) {
    endDateTime = `${event.endDate || event.startDate}T${event.endTime}`
  }

  return {
    id: event.id.toString(),
    title: event.title,
    start: startDateTime,
    end: endDateTime,
    allDay: isAllDay,
    backgroundColor,
    borderColor,
    textColor,
    classNames: [
      `event-type-${event.eventType}`,
      `event-status-${event.status}`,
      event.registrationRequired ? 'registration-required' : '',
      event.registrationCount === event.maxParticipants ? 'event-full' : '',
      event.status === 'cancelled' ? 'event-cancelled' : '',
      event.status === 'draft' ? 'event-draft' : ''
    ].filter(Boolean),
    extendedProps: {
      event,
      eventType: event.eventType,
      status: event.status,
      location: event.location,
      description: event.description,
      registrationCount: event.registrationCount || 0,
      maxParticipants: event.maxParticipants,
      registrationRequired: event.registrationRequired
    }
  }
}

/**
 * 批量轉換事件
 */
export function convertEventsToCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map(convertEventToCalendarEvent)
}

/**
 * 檢測事件時間衝突
 */
export function detectEventConflicts(events: Event[]): EventConflict[] {
  const conflicts: EventConflict[] = []
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i]
      const event2 = events[j]
      
      // 檢查時間重疊
      const conflict = checkTimeOverlap(event1, event2)
      if (conflict) {
        conflicts.push(conflict)
      }
      
      // 檢查地點衝突（如果有地點且相同）
      if (event1.location && event2.location && event1.location === event2.location) {
        const locationConflict = checkTimeOverlap(event1, event2)
        if (locationConflict) {
          conflicts.push({
            ...locationConflict,
            type: 'location_conflict',
            description: `活動在相同地點「${event1.location}」有時間重疊`
          })
        }
      }
    }
  }
  
  return conflicts
}

/**
 * 檢查兩個事件是否有時間重疊
 */
function checkTimeOverlap(event1: Event, event2: Event): EventConflict | null {
  try {
    const start1 = parseISO(event1.startDate)
    const end1 = parseISO(event1.endDate || event1.startDate)
    const start2 = parseISO(event2.startDate)
    const end2 = parseISO(event2.endDate || event2.startDate)
    
    // 檢查是否有重疊
    const hasOverlap = start1 < end2 && start2 < end1
    
    if (hasOverlap) {
      // 確定衝突嚴重程度
      const severity = (
        event1.status === 'published' && event2.status === 'published'
      ) ? 'error' : 'warning'
      
      return {
        event1,
        event2,
        type: 'time_overlap',
        description: `活動「${event1.title}」與「${event2.title}」時間重疊`,
        severity
      }
    }
    
    return null
  } catch (error) {
    console.error('Error checking time overlap:', error)
    return null
  }
}

/**
 * 格式化事件時間顯示
 */
export function formatEventTime(event: Event): string {
  try {
    const startDate = parseISO(event.startDate)
    const endDate = event.endDate ? parseISO(event.endDate) : null
    
    if (!event.startTime && !event.endTime) {
      // 全天事件
      if (endDate && !isSameDay(startDate, endDate)) {
        return `${format(startDate, 'MM/dd', { locale: zhTW })} - ${format(endDate, 'MM/dd', { locale: zhTW })}`
      }
      return format(startDate, 'MM月dd日 (E)', { locale: zhTW })
    }
    
    // 有時間的事件
    let timeStr = format(startDate, 'MM月dd日 (E)', { locale: zhTW })
    
    if (event.startTime) {
      timeStr += ` ${event.startTime}`
    }
    
    if (event.endTime && event.endTime !== event.startTime) {
      if (endDate && !isSameDay(startDate, endDate)) {
        timeStr += ` - ${format(endDate, 'MM月dd日 (E)', { locale: zhTW })} ${event.endTime}`
      } else {
        timeStr += ` - ${event.endTime}`
      }
    }
    
    return timeStr
  } catch (error) {
    console.error('Error formatting event time:', error)
    return event.startDate
  }
}

/**
 * 獲取事件顏色配置
 */
export function getEventColors(eventType: EventType, status: EventStatus) {
  const typeColors = DEFAULT_CALENDAR_THEME.eventColors[eventType] || DEFAULT_CALENDAR_THEME.eventColors.other
  const statusColors = DEFAULT_CALENDAR_THEME.statusColors[status]
  
  // 根據狀態調整顏色
  if (status === 'cancelled' || status === 'draft') {
    return statusColors
  }
  
  return typeColors
}

/**
 * 生成事件工具提示內容
 */
export function generateEventTooltip(event: Event): string {
  const lines = [
    `<strong>${event.title}</strong>`,
    formatEventTime(event)
  ]
  
  if (event.location) {
    lines.push(`📍 ${event.location}`)
  }
  
  if (event.registrationRequired && event.maxParticipants) {
    const registrationCount = event.registrationCount || 0
    lines.push(`👥 ${registrationCount}/${event.maxParticipants} 人`)
  }
  
  if (event.description) {
    const shortDesc = event.description.length > 100 
      ? event.description.substring(0, 100) + '...'
      : event.description
    lines.push(shortDesc)
  }
  
  return lines.join('<br>')
}

/**
 * 獲取日曆檢視的建議高度
 */
export function getCalendarHeight(view: string, containerHeight?: number): number | string {
  if (containerHeight) {
    return containerHeight - 200 // 保留空間給工具列和其他元素
  }
  
  switch (view) {
    case 'dayGridMonth':
      return 600
    case 'timeGridWeek':
      return 700
    case 'timeGridDay':
      return 800
    case 'listWeek':
      return 400
    default:
      return 'auto'
  }
}

/**
 * 檢查事件是否在指定日期範圍內
 */
export function isEventInDateRange(
  event: Event, 
  startDate: Date, 
  endDate: Date
): boolean {
  try {
    const eventStart = parseISO(event.startDate)
    const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart
    
    return isWithinInterval(eventStart, { start: startDate, end: endDate }) ||
           isWithinInterval(eventEnd, { start: startDate, end: endDate }) ||
           (eventStart <= startDate && eventEnd >= endDate)
  } catch (error) {
    console.error('Error checking event date range:', error)
    return false
  }
}

/**
 * 生成日曆事件的 CSS 類名
 */
export function generateEventClassNames(event: Event): string[] {
  const classNames = [
    `event-type-${event.eventType}`,
    `event-status-${event.status}`
  ]
  
  if (event.registrationRequired) {
    classNames.push('registration-required')
  }
  
  if (event.registrationCount === event.maxParticipants) {
    classNames.push('event-full')
  }
  
  if (event.status === 'cancelled') {
    classNames.push('event-cancelled')
  }
  
  if (event.status === 'draft') {
    classNames.push('event-draft')
  }
  
  return classNames
}

/**
 * 獲取事件狀態指示器
 */
export function getEventStatusIndicator(event: Event): {
  icon: string
  color: string
  label: string
} {
  switch (event.status) {
    case 'published':
      return { icon: '✅', color: 'green', label: '已發布' }
    case 'draft':
      return { icon: '📝', color: 'gray', label: '草稿' }
    case 'in_progress':
      return { icon: '🟡', color: 'blue', label: '進行中' }
    case 'completed':
      return { icon: '✅', color: 'emerald', label: '已完成' }
    case 'cancelled':
      return { icon: '❌', color: 'red', label: '已取消' }
    case 'postponed':
      return { icon: '⏸️', color: 'yellow', label: '已延期' }
    default:
      return { icon: '❓', color: 'gray', label: '未知' }
  }
}