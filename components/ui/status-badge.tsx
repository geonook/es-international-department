/**
 * Unified StatusBadge Component
 * 統一狀態徽章組件 - 標準化所有狀態指示器
 * 
 * Features:
 * - Consistent status visualization
 * - Professional educational color scheme
 * - Support for priority, status, and custom types
 * - Animated state transitions
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'
import {
  AlertTriangle,
  CheckCircle, 
  Clock,
  Eye,
  EyeOff,
  Pin,
  Star,
  Archive,
  X,
  Zap,
  Shield
} from 'lucide-react'

// 📋 Badge Types
export type BadgeType = 
  | 'status'
  | 'priority'
  | 'role'
  | 'type'
  | 'flag'
  | 'custom'

// 📋 Status Values
export type StatusValue = 'draft' | 'published' | 'archived' | 'closed' | 'active' | 'inactive'

// 📋 Priority Values  
export type PriorityValue = 'low' | 'medium' | 'high' | 'critical'

// 📋 Role Values
export type RoleValue = 'viewer' | 'office_member' | 'admin'

// 📋 Communication Types
export type CommunicationType = 'announcement' | 'message' | 'reminder' | 'newsletter' | 'document' | 'event'

// 📋 Flag Types
export type FlagType = 'pinned' | 'important' | 'featured' | 'new' | 'hot' | 'archived'

// 📋 StatusBadge Props
export interface StatusBadgeProps {
  // Core Configuration
  type: BadgeType
  value: string
  
  // Display Options
  label?: string
  showIcon?: boolean
  showDot?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'ghost'
  
  // Animation
  animated?: boolean
  pulse?: boolean
  
  // Styling
  className?: string
  
  // Interaction
  onClick?: () => void
  disabled?: boolean
}

// 🎨 Badge Configurations
const badgeConfigs = {
  // Status Configurations
  status: {
    draft: {
      bg: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-400',
      icon: Clock,
      label: 'Draft'
    },
    published: {
      bg: 'bg-green-100 hover:bg-green-200',
      text: 'text-green-700', 
      border: 'border-green-300',
      dot: 'bg-green-400',
      icon: CheckCircle,
      label: 'Published'
    },
    archived: {
      bg: 'bg-amber-100 hover:bg-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-300', 
      dot: 'bg-amber-400',
      icon: Archive,
      label: 'Archived'
    },
    closed: {
      bg: 'bg-red-100 hover:bg-red-200',
      text: 'text-red-700',
      border: 'border-red-300',
      dot: 'bg-red-400', 
      icon: X,
      label: 'Closed'
    },
    active: {
      bg: 'bg-blue-100 hover:bg-blue-200',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-400',
      icon: CheckCircle,
      label: 'Active'
    },
    inactive: {
      bg: 'bg-gray-100 hover:bg-gray-200', 
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-400',
      icon: EyeOff,
      label: 'Inactive'
    }
  },
  
  // Priority Configurations
  priority: {
    low: {
      bg: 'bg-blue-100 hover:bg-blue-200',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-400',
      icon: Eye,
      label: 'Low Priority'
    },
    medium: {
      bg: 'bg-yellow-100 hover:bg-yellow-200',
      text: 'text-yellow-700', 
      border: 'border-yellow-300',
      dot: 'bg-yellow-400',
      icon: Clock,
      label: 'Medium Priority'
    },
    high: {
      bg: 'bg-orange-100 hover:bg-orange-200',
      text: 'text-orange-700',
      border: 'border-orange-300',
      dot: 'bg-orange-400', 
      icon: AlertTriangle,
      label: 'High Priority'
    },
    critical: {
      bg: 'bg-red-100 hover:bg-red-200',
      text: 'text-red-700',
      border: 'border-red-300',
      dot: 'bg-red-400',
      icon: Zap,
      label: 'Critical'
    }
  },
  
  // Role Configurations
  role: {
    viewer: {
      bg: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-700', 
      border: 'border-gray-300',
      dot: 'bg-gray-400',
      icon: Eye,
      label: 'Viewer'
    },
    office_member: {
      bg: 'bg-blue-100 hover:bg-blue-200',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-400',
      icon: Star,
      label: 'Office Member'
    },
    admin: {
      bg: 'bg-purple-100 hover:bg-purple-200',
      text: 'text-purple-700',
      border: 'border-purple-300',
      dot: 'bg-purple-400',
      icon: Shield,
      label: 'Administrator'
    }
  },
  
  // Communication Type Configurations  
  type: {
    announcement: {
      bg: 'bg-blue-100 hover:bg-blue-200',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-400',
      icon: AlertTriangle,
      label: 'Announcement'
    },
    message: {
      bg: 'bg-indigo-100 hover:bg-indigo-200', 
      text: 'text-indigo-700',
      border: 'border-indigo-300',
      dot: 'bg-indigo-400',
      icon: CheckCircle,
      label: 'Message Board'
    },
    reminder: {
      bg: 'bg-amber-100 hover:bg-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-300',
      dot: 'bg-amber-400',
      icon: Clock,
      label: 'Reminder'
    },
    newsletter: {
      bg: 'bg-green-100 hover:bg-green-200',
      text: 'text-green-700',
      border: 'border-green-300', 
      dot: 'bg-green-400',
      icon: Star,
      label: 'Newsletter'
    },
    document: {
      bg: 'bg-emerald-100 hover:bg-emerald-200',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      dot: 'bg-emerald-400',
      icon: CheckCircle,
      label: 'Document'
    },
    event: {
      bg: 'bg-cyan-100 hover:bg-cyan-200',
      text: 'text-cyan-700',
      border: 'border-cyan-300',
      dot: 'bg-cyan-400',
      icon: Star,
      label: 'Event'
    }
  },
  
  // Flag Configurations
  flag: {
    pinned: {
      bg: 'bg-amber-100 hover:bg-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-300',
      dot: 'bg-amber-400',
      icon: Pin,
      label: 'Pinned'
    },
    important: {
      bg: 'bg-red-100 hover:bg-red-200', 
      text: 'text-red-700',
      border: 'border-red-300',
      dot: 'bg-red-400',
      icon: AlertTriangle,
      label: 'Important'
    },
    featured: {
      bg: 'bg-purple-100 hover:bg-purple-200',
      text: 'text-purple-700',
      border: 'border-purple-300',
      dot: 'bg-purple-400',
      icon: Star,
      label: 'Featured'
    },
    new: {
      bg: 'bg-green-100 hover:bg-green-200',
      text: 'text-green-700',
      border: 'border-green-300',
      dot: 'bg-green-400',
      icon: Zap,
      label: 'New'
    },
    hot: {
      bg: 'bg-orange-100 hover:bg-orange-200',
      text: 'text-orange-700', 
      border: 'border-orange-300',
      dot: 'bg-orange-400',
      icon: Zap,
      label: 'Hot'
    },
    archived: {
      bg: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-400',
      icon: Archive,
      label: 'Archived'
    }
  }
}

// 🎨 Size Configurations
const sizeConfigs = {
  xs: {
    text: 'text-xs',
    padding: 'px-2 py-0.5',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5'
  },
  sm: {
    text: 'text-sm',
    padding: 'px-2.5 py-1',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2 h-2'
  },
  md: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    dot: 'w-2.5 h-2.5'
  },
  lg: {
    text: 'text-base',
    padding: 'px-4 py-2',
    icon: 'w-5 h-5', 
    dot: 'w-3 h-3'
  }
}

export function StatusBadge({
  type,
  value,
  label,
  showIcon = true,
  showDot = false,
  size = 'sm',
  variant = 'solid',
  animated = false,
  pulse = false,
  className,
  onClick,
  disabled = false
}: StatusBadgeProps) {
  
  // Get configuration
  const config = (badgeConfigs[type] as any)?.[value]
  const sizeConfig = sizeConfigs[size]
  
  if (!config) {
    // Fallback for unknown values
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5',
          sizeConfig.text,
          sizeConfig.padding,
          className
        )}
      >
        {label || value}
      </Badge>
    )
  }
  
  const Icon = config.icon
  const displayLabel = label || config.label
  
  // Build className based on variant
  const badgeClassName = cn(
    'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200',
    sizeConfig.text,
    sizeConfig.padding,
    
    // Variant styles
    variant === 'solid' && config.bg && config.text,
    variant === 'outline' && `border ${config.border} ${config.text} bg-transparent hover:${config.bg}`,
    variant === 'ghost' && `${config.text} bg-transparent hover:${config.bg}`,
    
    // Interactive styles
    onClick && 'cursor-pointer select-none',
    disabled && 'opacity-50 cursor-not-allowed',
    
    // Animation
    pulse && 'animate-pulse',
    
    className
  )
  
  const content = (
    <>
      {/* Status Dot */}
      {showDot && (
        <div
          className={cn(
            'rounded-full',
            sizeConfig.dot,
            config.dot
          )}
        />
      )}
      
      {/* Icon */}
      {showIcon && Icon && (
        <Icon className={cn(sizeConfig.icon, 'flex-shrink-0')} />
      )}
      
      {/* Label */}
      {displayLabel && (
        <span className="truncate">
          {displayLabel}
        </span>
      )}
    </>
  )
  
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={badgeClassName}
        onClick={onClick}
      >
        {content}
      </motion.div>
    )
  }
  
  return (
    <div 
      className={badgeClassName}
      onClick={onClick}
    >
      {content}
    </div>
  )
}

// 🎯 Preset Components for Common Use Cases
export const StatusPresets = {
  // Status badges
  Status: ({ value, ...props }: { value: StatusValue } & Partial<StatusBadgeProps>) => (
    <StatusBadge type="status" value={value} {...props} />
  ),
  
  // Priority badges  
  Priority: ({ value, ...props }: { value: PriorityValue } & Partial<StatusBadgeProps>) => (
    <StatusBadge type="priority" value={value} {...props} />
  ),
  
  // Role badges
  Role: ({ value, ...props }: { value: RoleValue } & Partial<StatusBadgeProps>) => (
    <StatusBadge type="role" value={value} {...props} />
  ),
  
  // Type badges
  CommunicationType: ({ value, ...props }: { value: CommunicationType } & Partial<StatusBadgeProps>) => (
    <StatusBadge type="type" value={value} {...props} />
  ),
  
  // Flag badges
  Flag: ({ value, ...props }: { value: FlagType } & Partial<StatusBadgeProps>) => (
    <StatusBadge type="flag" value={value} {...props} />
  )
}

export default StatusBadge