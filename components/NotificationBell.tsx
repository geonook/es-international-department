'use client'

/**
 * Notification Bell Component
 * 通知鈴鐺組件
 * 
 * @description 用於導航欄的通知鈴鐺圖標，顯示未讀通知數量，點擊展開通知中心
 * @features 實時通知數量、動畫效果、彈出式通知中心、響應式設計
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import NotificationCenter from './NotificationCenter'

interface NotificationBellProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'default'
  showBadge?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  maxWidth?: string
  onNotificationClick?: (notificationId: number) => void
}

export default function NotificationBell({
  className,
  size = 'md',
  variant = 'ghost',
  showBadge = true,
  position = 'bottom-right',
  maxWidth = 'max-w-sm',
  onNotificationClick
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 獲取未讀通知數量
  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const newCount = data.unreadCount || 0
          
          // 檢查是否有新通知
          if (newCount > unreadCount && unreadCount > 0) {
            setHasNewNotifications(true)
            // 3秒後重置新通知標記
            setTimeout(() => setHasNewNotifications(false), 3000)
          }
          
          setUnreadCount(newCount)
        }
      }
    } catch (error) {
      console.error('Fetch unread count error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始載入和定期刷新
  useEffect(() => {
    fetchUnreadCount()
    
    // 每 30 秒刷新一次未讀數量
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // 點擊外部關閉面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        bellRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 監聽實時通知事件 (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null

    const connectSSE = () => {
      const token = localStorage.getItem('authToken')
      if (!token) return

      eventSource = new EventSource(`/api/notifications/stream?token=${token}`)
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_notifications') {
            setUnreadCount(prev => prev + (data.count || 1))
            setHasNewNotifications(true)
            setTimeout(() => setHasNewNotifications(false), 3000)
          } else if (data.type === 'notification_read') {
            setUnreadCount(prev => Math.max(0, prev - (data.count || 1)))
          }
        } catch (error) {
          console.error('SSE message parsing error:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        eventSource?.close()
        
        // 5秒後重連
        setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      eventSource?.close()
    }
  }, [])

  // 獲取按鈕大小
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8'
      case 'lg': return 'h-12 w-12'
      case 'md':
      default: return 'h-10 w-10'
    }
  }

  // 獲取圖標大小
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'lg': return 'w-6 h-6'
      case 'md':
      default: return 'w-5 h-5'
    }
  }

  // 獲取面板位置類別
  const getPanelPosition = () => {
    switch (position) {
      case 'top-left': return 'bottom-full left-0 mb-2'
      case 'top-right': return 'bottom-full right-0 mb-2'
      case 'bottom-left': return 'top-full left-0 mt-2'
      case 'bottom-right':
      default: return 'top-full right-0 mt-2'
    }
  }

  // 鈴鐺動畫效果
  const bellVariants = {
    idle: { rotate: 0 },
    ring: { 
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.6 }
    }
  }

  // 徽章彈跳動畫
  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, repeat: 3 }
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* 通知鈴鐺按鈕 */}
      <Button
        ref={bellRef}
        variant={variant}
        size="sm"
        className={cn(
          "relative transition-all duration-200",
          getButtonSize(),
          hasNewNotifications && "bg-blue-50 border-blue-200"
        )}
        onClick={() => {
          setIsOpen(!isOpen)
          setHasNewNotifications(false)
        }}
        disabled={isLoading}
      >
        <motion.div
          variants={bellVariants}
          animate={hasNewNotifications ? 'ring' : 'idle'}
        >
          <Bell className={cn(
            getIconSize(),
            isLoading && "opacity-50",
            hasNewNotifications && "text-blue-600"
          )} />
        </motion.div>

        {/* 未讀通知徽章 */}
        <AnimatePresence>
          {showBadge && unreadCount > 0 && (
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate={hasNewNotifications ? "pulse" : "visible"}
              exit="hidden"
              className="absolute -top-1 -right-1"
            >
              <Badge className="bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 新通知指示點 */}
        <AnimatePresence>
          {hasNewNotifications && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"
            />
          )}
        </AnimatePresence>
      </Button>

      {/* 通知中心面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50",
              getPanelPosition(),
              maxWidth
            )}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              {/* 面板標題欄 */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  通知中心
                  {unreadCount > 0 && (
                    <Badge className="bg-blue-500 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 通知中心內容 */}
              <div className="w-80 max-h-96">
                <NotificationCenter
                  showHeader={false}
                  maxHeight="max-h-80"
                  compactMode={true}
                  autoRefresh={false}
                />
              </div>

              {/* 底部操作 */}
              <div className="p-3 border-t bg-gray-50 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setIsOpen(false)
                    // 可以跳轉到完整的通知頁面
                    window.location.href = '/notifications'
                  }}
                >
                  查看所有通知
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 導出一個簡化版本用於不同場景
export function SimpleNotificationBell({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <NotificationBell 
      className={className}
      size={size}
      variant="ghost"
      showBadge={true}
      position="bottom-right"
    />
  )
}