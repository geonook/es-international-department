/**
 * KCISLK ESID Info Hub - Terminology Standards
 * 
 * This file defines consistent terminology used throughout the application
 * to ensure uniform user experience and professional presentation.
 * 
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 * @version 1.0.0
 * @date 2025-08-28
 */

// Core System Modules
export const MODULES = {
  REMINDERS: 'Reminders',
  MESSAGES: 'Messages', 
  ANNOUNCEMENTS: 'Announcements',
  RESOURCES: 'Resources',
  EVENTS: 'Events',
  NOTIFICATIONS: 'Notifications',
  CALENDAR: 'Calendar'
} as const

// User Interface Sections
export const UI_SECTIONS = {
  TEACHERS_DASHBOARD: 'Teachers Dashboard',
  PARENTS_CORNER: 'Parents\' Corner',
  TEACHERS_CORNER: 'Teachers\' Corner',
  ADMIN_PANEL: 'Admin Panel',
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings'
} as const

// Common Actions
export const ACTIONS = {
  VIEW: 'View',
  CREATE: 'Create',
  EDIT: 'Edit', 
  DELETE: 'Delete',
  MANAGE: 'Manage',
  BROWSE: 'Browse',
  SEARCH: 'Search',
  FILTER: 'Filter',
  SORT: 'Sort',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  SUBMIT: 'Submit',
  OPEN: 'Open',
  CLOSE: 'Close'
} as const

// Status and Priority Terms
export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived'
} as const

export const PRIORITY = {
  HIGH: 'High Priority',
  MEDIUM: 'Medium Priority', 
  LOW: 'Low Priority',
  URGENT: 'Urgent',
  NORMAL: 'Normal'
} as const

// User Roles
export const ROLES = {
  ADMIN: 'Administrator',
  OFFICE_MEMBER: 'Office Member',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  VIEWER: 'Viewer'
} as const

// Content Types
export const CONTENT_TYPES = {
  ANNOUNCEMENT: 'Announcement',
  REMINDER: 'Reminder',
  MESSAGE: 'Message',
  EVENT: 'Event', 
  RESOURCE: 'Resource',
  DOCUMENT: 'Document',
  IMAGE: 'Image',
  VIDEO: 'Video',
  LINK: 'External Link'
} as const

// Time-related Terms
export const TIME_TERMS = {
  DUE_DATE: 'Due Date',
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  CREATED_AT: 'Created',
  UPDATED_AT: 'Last Updated',
  PUBLISHED_AT: 'Published',
  EXPIRES_AT: 'Expires'
} as const

// Navigation and UI Elements
export const NAVIGATION = {
  DASHBOARD: 'Dashboard',
  OVERVIEW: 'Overview', 
  INBOX: 'Inbox',
  ARCHIVE: 'Archive',
  SETTINGS: 'Settings',
  HELP: 'Help',
  LOGOUT: 'Sign Out',
  LOGIN: 'Sign In',
  PROFILE: 'Profile',
  PREFERENCES: 'Preferences'
} as const

// Common UI Text
export const UI_TEXT = {
  WELCOME: 'Welcome',
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR: 'Something went wrong',
  SUCCESS: 'Operation completed successfully',
  CONFIRM: 'Are you sure?',
  REQUIRED_FIELD: 'This field is required',
  OPTIONAL_FIELD: 'Optional',
  SEARCH_PLACEHOLDER: 'Search...',
  SELECT_ALL: 'Select All',
  CLEAR_ALL: 'Clear All'
} as const

// Feature-specific Terms
export const FEATURES = {
  GRADE_LEVELS: 'Grade Levels',
  SQUADS: 'KCFSID Squads',
  INTERNATIONAL_CULTURE: 'International Culture Day',
  ASSESSMENT_WEEK: 'Assessment Week',
  PARENT_TEACHER_CONFERENCE: 'Parent-Teacher Conference',
  NEWSLETTER: 'Monthly Newsletter',
  MESSAGE_BOARD: 'Message Board'
} as const

// Export unified terminology object
export const TERMINOLOGY = {
  MODULES,
  UI_SECTIONS, 
  ACTIONS,
  STATUS,
  PRIORITY,
  ROLES,
  CONTENT_TYPES,
  TIME_TERMS,
  NAVIGATION,
  UI_TEXT,
  FEATURES
} as const

// Helper function to get consistent button text
export const getActionButtonText = (action: keyof typeof ACTIONS, module: keyof typeof MODULES): string => {
  return `${ACTIONS[action]} ${MODULES[module]}`
}

// Helper function to get page titles
export const getPageTitle = (section: keyof typeof UI_SECTIONS): string => {
  return `KCISLK ESID - ${UI_SECTIONS[section]}`
}