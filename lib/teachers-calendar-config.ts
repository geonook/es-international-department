/**
 * Teachers Calendar Configuration
 * 
 * @description Configuration settings for Teachers calendar functionality
 * @features Event types, display settings, calendar themes for teachers
 * @author Claude Code | Generated for KCISLK ESID Info Hub Teachers Module
 */

import { CalendarOptions } from '@fullcalendar/core'

// Teachers-specific event types
export const TEACHERS_EVENT_TYPES = {
  academic: {
    label: 'Academic Activity',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  sports: {
    label: 'Sports Activity', 
    color: '#10b981',
    backgroundColor: '#d1fae5',
    borderColor: '#10b981'
  },
  cultural: {
    label: 'Cultural Event',
    color: '#8b5cf6',
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6'
  },
  parent_meeting: {
    label: 'Parent Meeting',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  professional_development: {
    label: 'Professional Development',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444'
  },
  administrative: {
    label: 'Administrative',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderColor: '#6b7280'
  }
} as const

// Teachers calendar configuration
export const TEACHERS_CALENDAR_CONFIG: CalendarOptions = {
  initialView: 'dayGridMonth',
  headerToolbar: false, // We'll use custom toolbar
  height: 'auto',
  locale: 'en',
  firstDay: 1, // Monday
  weekends: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  moreLinkClick: 'popover',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false
  },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false
  },
  nowIndicator: true,
  eventDisplay: 'block',
  displayEventTime: true,
  eventMouseEnter: undefined,
  eventMouseLeave: undefined,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '08:00',
    endTime: '17:00'
  },
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00'
}

// Event status mappings for teachers
export const TEACHERS_EVENT_STATUS = {
  confirmed: {
    label: 'Confirmed',
    color: '#10b981',
    backgroundColor: '#d1fae5'
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b', 
    backgroundColor: '#fef3c7'
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
    backgroundColor: '#fee2e2'
  },
  waiting_list: {
    label: 'Waiting List',
    color: '#8b5cf6',
    backgroundColor: '#ede9fe'
  }
} as const

// Calendar view options for teachers
export const TEACHERS_CALENDAR_VIEWS = [
  {
    value: 'dayGridMonth',
    label: 'Month View',
    description: 'Monthly calendar grid view'
  },
  {
    value: 'timeGridWeek', 
    label: 'Week View',
    description: 'Weekly detailed time view'
  },
  {
    value: 'timeGridDay',
    label: 'Day View', 
    description: 'Daily detailed schedule'
  },
  {
    value: 'listWeek',
    label: 'List View',
    description: 'Event list format'
  }
] as const

// Transform teachers event data for FullCalendar
export function transformTeachersEventForCalendar(event: any) {
  const eventType = event.eventType || 'administrative'
  const eventStatus = event.status || 'confirmed'
  
  const typeConfig = TEACHERS_EVENT_TYPES[eventType as keyof typeof TEACHERS_EVENT_TYPES] || TEACHERS_EVENT_TYPES.administrative
  const statusConfig = TEACHERS_EVENT_STATUS[eventStatus as keyof typeof TEACHERS_EVENT_STATUS] || TEACHERS_EVENT_STATUS.confirmed
  
  return {
    id: event.id,
    title: event.title,
    start: event.startDate + (event.startTime ? `T${event.startTime}` : ''),
    end: event.endDate + (event.endTime ? `T${event.endTime}` : ''),
    allDay: !event.startTime && !event.endTime,
    backgroundColor: typeConfig.backgroundColor,
    borderColor: typeConfig.borderColor,
    textColor: typeConfig.color,
    extendedProps: {
      description: event.description,
      location: event.location,
      eventType: event.eventType,
      status: event.status,
      registrationCount: event.registrationCount,
      maxParticipants: event.maxParticipants,
      registrationDeadline: event.registrationDeadline,
      targetGrades: event.targetGrades,
      creator: event.creator,
      originalEvent: event
    },
    classNames: [
      `event-type-${eventType}`,
      `event-status-${eventStatus}`,
      event.registrationCount >= event.maxParticipants ? 'event-full' : ''
    ].filter(Boolean)
  }
}

// Default filter settings for teachers
export const DEFAULT_TEACHERS_FILTERS = {
  search: '',
  eventType: 'all',
  status: 'all',
  grade: 'all',
  showMyRegistrations: false,
  showWeekends: true
}

// Teachers calendar theme
export const TEACHERS_CALENDAR_THEME = {
  todayColor: '#f0f9ff',
  weekendColor: '#fafafa',
  eventRadius: '4px',
  eventPadding: '2px 4px',
  fontSize: '0.875rem'
}