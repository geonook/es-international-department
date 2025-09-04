'use client'

/**
 * Notification Toast Component
 * Real-time notification toast component
 * 
 * @description Used to display real-time notification toasts with multiple styles and auto-dismiss functionality
 * @features Multiple notification types, auto-dismiss, manual close, animations, stacked display
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  Bell,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Wrench,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'notification'
export type NotificationType = 'system' | 'announcement' | 'event' | 'registration' | 'resource' | 'newsletter' | 'maintenance' | 'reminder'

export interface ToastNotification {
  id: string
  title: string
  message?: string
  type?: ToastType
  notificationType?: NotificationType
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  duration?: number
  persistent?: boolean
  relatedId?: number
  relatedType?: string
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
}

interface NotificationToastProps extends ToastNotification {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

export default function NotificationToast({
  id,
  title,
  message,
  type = 'notification',
  notificationType = 'system',
  priority = 'medium',
  duration = 5000,
  persistent = false,
  relatedId,
  relatedType,
  actionLabel,
  onAction,
  onClose,
  position = 'top-right',
  className
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-dismiss logic
  useEffect(() => {
    if (persistent || isHovered) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for exit animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, persistent, isHovered, onClose])

  // Manual close
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  // Get notification icon
  const getNotificationIcon = () => {
    if (type !== 'notification') {
      switch (type) {
        case 'success': return Check
        case 'error': return AlertTriangle
        case 'warning': return AlertTriangle
        case 'info': return Info
        default: return Bell
      }
    }

    switch (notificationType) {
      case 'announcement': return MessageSquare
      case 'event': return Calendar
      case 'registration': return Users
      case 'resource': return FileText
      case 'maintenance': return Wrench
      case 'newsletter': return FileText
      case 'reminder': return Clock
      case 'system':
      default: return Bell
    }
  }

  // Get style classes
  const getToastStyles = () => {
    if (type !== 'notification') {
      switch (type) {
        case 'success': 
          return 'bg-green-50 border-green-200 text-green-800'
        case 'error': 
          return 'bg-red-50 border-red-200 text-red-800'
        case 'warning': 
          return 'bg-yellow-50 border-yellow-200 text-yellow-800'
        case 'info': 
          return 'bg-blue-50 border-blue-200 text-blue-800'
      }
    }

    // Style based on priority level
    switch (priority) {
      case 'urgent': 
        return 'bg-red-50 border-red-200 text-red-800'
      case 'high': 
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'medium': 
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'low':
      default: 
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  // Get icon color
  const getIconColor = () => {
    if (type !== 'notification') {
      switch (type) {
        case 'success': return 'text-green-600'
        case 'error': return 'text-red-600'
        case 'warning': return 'text-yellow-600'
        case 'info': return 'text-blue-600'
        default: return 'text-gray-600'
      }
    }

    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-blue-600'
      case 'low':
      default: return 'text-gray-600'
    }
  }

  // Get priority badge
  const getPriorityBadge = () => {
    if (type !== 'notification' || priority === 'low') return null

    const badgeText = priority === 'urgent' ? 'Urgent' 
      : priority === 'high' ? 'High Priority' 
      : 'Medium Priority'

    const badgeVariant = priority === 'urgent' ? 'destructive' : 'secondary'

    return (
      <Badge variant={badgeVariant} className="text-xs ml-2">
        {badgeText}
      </Badge>
    )
  }

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const IconComponent = getNotificationIcon()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5 }}
          transition={{ 
            type: "spring" as const, 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={cn(
            "fixed z-50 max-w-sm",
            getPositionStyles(),
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={cn(
            "rounded-lg border shadow-lg backdrop-blur-sm p-4",
            getToastStyles()
          )}>
            <div className="flex items-start gap-3">
              {/* Notification icon */}
              <div className={cn(
                "flex-shrink-0 p-1 rounded-full",
                getIconColor()
              )}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Notification content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm leading-5 flex items-center">
                    {title}
                    {getPriorityBadge()}
                  </h4>
                  
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-5 w-5 p-0 opacity-70 hover:opacity-100 ml-2 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Notification message */}
                {message && (
                  <p className="text-sm text-current/80 mb-3 leading-5">
                    {message}
                  </p>
                )}

                {/* Action buttons area */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Custom action button */}
                    {actionLabel && onAction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAction()
                          handleClose()
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        {actionLabel}
                      </Button>
                    )}

                    {/* Related content link */}
                    {relatedId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Handle navigation logic
                          const baseUrl = relatedType === 'event' ? '/events' 
                            : relatedType === 'announcement' ? '/announcements'
                            : relatedType === 'resource' ? '/resources'
                            : '#'
                          window.open(`${baseUrl}/${relatedId}`, '_blank')
                          handleClose()
                        }}
                        className="h-6 w-6 p-0 text-current/60 hover:text-current"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {/* Progress bar (non-persistent notifications) */}
                  {!persistent && (
                    <div className="flex-1 max-w-16 ml-3">
                      <motion.div
                        className="h-1 bg-current/20 rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-current/40 rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ 
                            duration: duration / 1000, 
                            ease: 'linear' 
                          }}
                        />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification type label */}
            {type === 'notification' && (
              <div className="mt-2 pt-2 border-t border-current/10">
                <Badge variant="outline" className="text-xs">
                  {notificationType === 'announcement' ? 'Announcement' 
                    : notificationType === 'event' ? 'Event Notification'
                    : notificationType === 'registration' ? 'Registration Notice'
                    : notificationType === 'resource' ? 'Resource Update'
                    : notificationType === 'maintenance' ? 'System Maintenance'
                    : notificationType === 'newsletter' ? 'Newsletter'
                    : notificationType === 'reminder' ? 'Reminder'
                    : 'System Notification'}
                </Badge>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Notification manager hook
export function useNotificationToasts() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = {
      ...toast,
      id,
      onClose: () => removeToast(id)
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const removeAllToasts = () => {
    setToasts([])
  }

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts
  }
}

// Toast container component
export function NotificationToastContainer({ 
  toasts, 
  position = 'top-right' 
}: { 
  toasts: ToastNotification[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              zIndex: 1000 + index
            }}
          >
            <NotificationToast
              {...toast}
              position={position}
              className="pointer-events-auto"
              style={{ 
                marginBottom: index > 0 ? '8px' : '0' 
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}