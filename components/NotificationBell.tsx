'use client'

/**
 * Notification Bell Component
 * Notification Bell Component
 * 
 * @description Notification bell icon for the navigation bar, displays unread notification count, click to expand notification center
 * @features Real-time notification count, animated effects, popup notification center, responsive design
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import NotificationCenter from './NotificationCenter'
import useRealTimeNotifications from '@/hooks/useRealTimeNotifications'

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
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  
  // Use real-time notification Hook
  const {
    unreadCount,
    notifications,
    connectionStatus,
    isConnected,
    isConnecting,
    hasError,
    reconnect,
    requestNotificationPermission,
    connectionUptime,
    lastPing
  } = useRealTimeNotifications({
    enableSSE: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    heartbeatTimeout: 90000
  })

  // Listen for new notification events
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      setHasNewNotifications(true)
      setTimeout(() => setHasNewNotifications(false), 3000)
    }
    
    const handleBroadcastNotification = (event: CustomEvent) => {
      setHasNewNotifications(true)
      setTimeout(() => setHasNewNotifications(false), 5000)
    }

    window.addEventListener('newNotification', handleNewNotification as EventListener)
    window.addEventListener('broadcastNotification', handleBroadcastNotification as EventListener)

    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener)
      window.removeEventListener('broadcastNotification', handleBroadcastNotification as EventListener)
    }
  }, [])

  // Initialize browser notification permissions
  useEffect(() => {
    requestNotificationPermission()
  }, [])
  
  // Handle connection status changes
  useEffect(() => {
    if (hasError && !isConnecting) {
      setShowConnectionStatus(true)
      setTimeout(() => setShowConnectionStatus(false), 5000)
    }
  }, [hasError, isConnecting])

  // Click outside to close panel
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

  // Format connection time
  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }
  
  // Get connection status display
  const getConnectionStatusDisplay = () => {
    if (isConnecting) {
      return { icon: Wifi, color: 'text-yellow-500', text: 'Connecting...' }
    } else if (isConnected) {
      return { icon: Wifi, color: 'text-green-500', text: 'Connected' }
    } else {
      return { icon: WifiOff, color: 'text-red-500', text: 'Connection Lost' }
    }
  }

  // Get button size
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8'
      case 'lg': return 'h-12 w-12'
      case 'md':
      default: return 'h-10 w-10'
    }
  }

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'lg': return 'w-6 h-6'
      case 'md':
      default: return 'w-5 h-5'
    }
  }

  // Get panel position class
  const getPanelPosition = () => {
    switch (position) {
      case 'top-left': return 'bottom-full left-0 mb-2'
      case 'top-right': return 'bottom-full right-0 mb-2'
      case 'bottom-left': return 'top-full left-0 mt-2'
      case 'bottom-right':
      default: return 'top-full right-0 mt-2'
    }
  }

  // Bell animation effects
  const bellVariants = {
    idle: { rotate: 0 },
    ring: { 
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.6 }
    }
  }

  // Badge bounce animation
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
      {/* Notification bell button */}
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
        disabled={isConnecting}
      >
        <motion.div
          variants={bellVariants}
          animate={hasNewNotifications ? 'ring' : 'idle'}
        >
          <Bell className={cn(
            getIconSize(),
            isConnecting && "opacity-50",
            hasNewNotifications && "text-blue-600",
            !isConnected && !isConnecting && "text-gray-400"
          )} />
        </motion.div>

        {/* Unread notification badge */}
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

        {/* New notification indicator */}
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

      {/* Notification center panel */}
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
              {/* Panel header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notification Center
                    {unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </h3>
                  
                  {/* Connection status indicator */}
                  {(() => {
                    const status = getConnectionStatusDisplay()
                    return (
                      <div 
                        className="flex items-center gap-1 text-xs"
                        title={`Status: ${status.text}${connectionUptime > 0 ? ` | Uptime: ${formatUptime(connectionUptime)}` : ''}${lastPing ? ` | Last ping: ${new Date(lastPing).toLocaleTimeString()}` : ''}`}
                      >
                        <status.icon className={cn('w-3 h-3', status.color)} />
                        {(showConnectionStatus || hasError) && (
                          <span className={status.color}>{status.text}</span>
                        )}
                      </div>
                    )
                  })()}
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Reconnect button */}
                  {hasError && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={reconnect}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                      title="Reconnect"
                    >
                      <Wifi className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification center content */}
              <div className="w-80 max-h-96">
                <NotificationCenter
                  showHeader={false}
                  maxHeight="max-h-80"
                  compactMode={true}
                  autoRefresh={false}
                />
              </div>

              {/* Bottom actions */}
              <div className="p-3 border-t bg-gray-50 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setIsOpen(false)
                    // Can jump to full notification page
                    window.location.href = '/notifications'
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Export a simplified version for different scenarios
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