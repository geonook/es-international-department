'use client'

/**
 * Notification Toast Component
 * 通知彈窗組件
 * 
 * @description 用於顯示實時通知彈窗，支持多種樣式和自動消失
 * @features 多種通知類型、自動消失、手動關閉、動畫效果、堆疊顯示
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

// 通知類型
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

  // 自動消失邏輯
  useEffect(() => {
    if (persistent || isHovered) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // 等待退出動畫完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, persistent, isHovered, onClose])

  // 手動關閉
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  // 獲取通知圖標
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

  // 獲取樣式類別
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

    // 根據優先級決定樣式
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

  // 獲取圖標顏色
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

  // 獲取優先級徽章
  const getPriorityBadge = () => {
    if (type !== 'notification' || priority === 'low') return null

    const badgeText = priority === 'urgent' ? '緊急' 
      : priority === 'high' ? '高優先級' 
      : '中優先級'

    const badgeVariant = priority === 'urgent' ? 'destructive' : 'secondary'

    return (
      <Badge variant={badgeVariant} className="text-xs ml-2">
        {badgeText}
      </Badge>
    )
  }

  // 獲取位置樣式
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
            type: "spring", 
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
              {/* 通知圖標 */}
              <div className={cn(
                "flex-shrink-0 p-1 rounded-full",
                getIconColor()
              )}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* 通知內容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm leading-5 flex items-center">
                    {title}
                    {getPriorityBadge()}
                  </h4>
                  
                  {/* 關閉按鈕 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-5 w-5 p-0 opacity-70 hover:opacity-100 ml-2 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* 通知訊息 */}
                {message && (
                  <p className="text-sm text-current/80 mb-3 leading-5">
                    {message}
                  </p>
                )}

                {/* 操作按鈕區域 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* 自定義操作按鈕 */}
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

                    {/* 相關內容鏈接 */}
                    {relatedId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // 處理跳轉邏輯
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

                  {/* 進度條（非持久化通知） */}
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

            {/* 通知類型標籤 */}
            {type === 'notification' && (
              <div className="mt-2 pt-2 border-t border-current/10">
                <Badge variant="outline" className="text-xs">
                  {notificationType === 'announcement' ? '公告通知' 
                    : notificationType === 'event' ? '活動通知'
                    : notificationType === 'registration' ? '報名通知'
                    : notificationType === 'resource' ? '資源更新'
                    : notificationType === 'maintenance' ? '系統維護'
                    : notificationType === 'newsletter' ? '電子報'
                    : notificationType === 'reminder' ? '提醒'
                    : '系統通知'}
                </Badge>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 通知管理器 Hook
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

// Toast 容器組件
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