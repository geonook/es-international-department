/**
 * ESID Info Hub - Unified Design System
 * 統一設計系統 - 與 Google Sites 對齊的專業教育風格
 * 
 * Based on UI Designer agent recommendations:
 * - Professional blue-gray color scheme
 * - 8px grid spacing system
 * - Educational-focused visual hierarchy
 */

// 🎨 Professional Educational Color Palette
export const colors = {
  // Primary Colors (Professional Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main primary
    600: '#1e40af',  // Primary dark
    700: '#1e3a8a',
    800: '#1e3a8a',
    900: '#1e3a8a'
  },
  
  // Secondary Colors (Neutral Gray)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0', 
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Accent Colors
  accent: {
    warning: '#f59e0b',   // Attention/Warning
    success: '#10b981',   // Success states
    error: '#ef4444',     // Error states
    info: '#3b82f6'       // Information
  },
  
  // Functional Colors (aligned with Google Sites)
  functional: {
    feedback: { primary: '#f59e0b', secondary: '#fbbf24' },      // Orange for feedback
    information: { primary: '#1e40af', secondary: '#3b82f6' },   // Blue for information  
    documents: { primary: '#10b981', secondary: '#34d399' },     // Green for documents
    parents: { primary: '#8b5cf6', secondary: '#a78bfa' }        // Purple for parents
  }
} as const

// 📏 Spacing System (8px grid)
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px  
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  '2xl': '4rem',  // 64px
  '3xl': '6rem',  // 96px
  '4xl': '8rem'   // 128px
} as const

// 🔤 Typography Scale
export const typography = {
  hero: '3rem',      // 48px - Main headlines
  h1: '2.25rem',     // 36px - Section headers
  h2: '1.875rem',    // 30px - Subsection headers  
  h3: '1.5rem',      // 24px - Card titles
  h4: '1.25rem',     // 20px - Smaller headings
  body: '1rem',      // 16px - Default text
  small: '0.875rem', // 14px - Secondary text
  caption: '0.75rem' // 12px - Metadata
} as const

// 🎯 Component Variants
export const componentVariants = {
  // Card Types
  card: {
    announcement: {
      bg: 'bg-blue-50',
      border: 'border-blue-200', 
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    message: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800', 
      icon: 'text-indigo-600'
    },
    reminder: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600'
    },
    document: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-600'
    }
  },

  // Priority Levels  
  priority: {
    low: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300'
    },
    medium: {
      bg: 'bg-blue-100', 
      text: 'text-blue-700',
      border: 'border-blue-300'
    },
    high: {
      bg: 'bg-red-100',
      text: 'text-red-700', 
      border: 'border-red-300'
    }
  },

  // Status States
  status: {
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-400'
    },
    published: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-400'
    },
    archived: {
      bg: 'bg-amber-100', 
      text: 'text-amber-700',
      dot: 'bg-amber-400'
    },
    closed: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-400'
    }
  }
} as const

// 🎭 Animation Constants
export const animations = {
  // Respect reduced motion preference
  duration: {
    fast: '150ms',
    normal: '250ms', 
    slow: '350ms'
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const

// 📱 Breakpoints
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet  
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
} as const

// 🎯 Component Sizes
export const componentSizes = {
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base', 
    lg: 'px-6 py-3 text-lg'
  },
  input: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  },
  icon: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
} as const

// 🏗️ Layout Constants
export const layout = {
  // Container max widths
  container: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px'
  },
  // Common dimensions
  header: {
    height: '4rem',    // 64px
    mobileHeight: '3.5rem' // 56px
  },
  sidebar: {
    width: '16rem',    // 256px
    collapsedWidth: '4rem' // 64px
  }
} as const

// 🎨 Gradient Definitions (Professional Educational Style)
export const gradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-700',
  secondary: 'bg-gradient-to-r from-gray-600 to-gray-700',
  accent: 'bg-gradient-to-r from-amber-500 to-orange-600',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  background: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
} as const

// 📋 Utility Functions
export const utils = {
  // Generate consistent class names
  cn: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ')
  },
  
  // Get color variant
  getColorVariant: (type: keyof typeof componentVariants.card) => {
    return componentVariants.card[type] || componentVariants.card.announcement
  },
  
  // Get priority styling
  getPriorityVariant: (priority: 'low' | 'medium' | 'high') => {
    return componentVariants.priority[priority] || componentVariants.priority.medium
  },
  
  // Get status styling  
  getStatusVariant: (status: 'draft' | 'published' | 'archived' | 'closed') => {
    return componentVariants.status[status] || componentVariants.status.draft
  }
} as const

// 🎯 Export all design system tokens
export const designSystem = {
  colors,
  spacing,
  typography,
  componentVariants,
  animations,
  breakpoints,
  componentSizes,
  layout,
  gradients,
  utils
} as const

// Default export for convenient importing
export default designSystem