'use client'

/**
 * Real-time Notifications Hook
 * 即時通知 Hook
 * 
 * @description 管理 SSE 連接和即時通知狀態的自定義 Hook
 * @features SSE 連接管理、自動重連、連接狀態監控、通知狀態同步
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export interface NotificationData {
  id: number
  title: string
  message: string
  type: string
  priority: string
  isRead: boolean
  createdAt: string
}

export interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  error?: string
  connectionId?: string
  uptime: number
  reconnectAttempts: number
  lastPing?: string
}

export interface RealTimeNotificationsState {
  unreadCount: number
  notifications: NotificationData[]
  connectionStatus: ConnectionStatus
}

interface UseRealTimeNotificationsOptions {
  enableSSE?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number
  heartbeatTimeout?: number
  fallbackPollingInterval?: number
}

interface SSEMessage {
  type: 'connected' | 'ping' | 'new_notifications' | 'notification' | 'stats' | 'broadcast'
  data?: any
  count?: number
  connectionId?: string
  timestamp?: string
  uptime?: number
}

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions = {}) {
  const {
    enableSSE = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    heartbeatTimeout = 60000,
    fallbackPollingInterval = 60000
  } = options

  // 狀態管理
  const [state, setState] = useState<RealTimeNotificationsState>({
    unreadCount: 0,
    notifications: [],
    connectionStatus: {
      connected: false,
      connecting: false,
      uptime: 0,
      reconnectAttempts: 0
    }
  })

  // Refs for managing connections and timers
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionStartTime = useRef<number>(0)

  // 更新連接狀態
  const updateConnectionStatus = useCallback((updates: Partial<ConnectionStatus>) => {
    setState(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        ...updates,
        uptime: connectionStartTime.current > 0 ? Date.now() - connectionStartTime.current : 0
      }
    }))
  }, [])

  // 更新通知數據
  const updateNotifications = useCallback((updates: Partial<Pick<RealTimeNotificationsState, 'unreadCount' | 'notifications'>>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  // 獲取通知統計
  const fetchNotificationStats = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          updateNotifications({
            unreadCount: data.data.user.unread || 0
          })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
      return false
    }
  }, [updateNotifications])

  // 處理 SSE 消息
  const handleSSEMessage = useCallback((event: MessageEvent) => {
    try {
      const data: SSEMessage = JSON.parse(event.data)
      
      // 重置心跳超時
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current)
      }
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn('SSE heartbeat timeout - connection may be stale')
        updateConnectionStatus({ error: 'Heartbeat timeout' })
      }, heartbeatTimeout)

      switch (data.type) {
        case 'connected':
          console.log('✅ SSE connected:', data.connectionId)
          connectionStartTime.current = Date.now()
          updateConnectionStatus({
            connected: true,
            connecting: false,
            error: undefined,
            connectionId: data.connectionId,
            reconnectAttempts: 0,
            lastPing: data.timestamp
          })
          break

        case 'ping':
          updateConnectionStatus({
            lastPing: data.timestamp,
            uptime: data.uptime || 0
          })
          break

        case 'new_notifications':
        case 'notification':
          const count = data.count || 1
          const notifications = Array.isArray(data.data) ? data.data : [data.data]
          
          setState(prev => ({
            ...prev,
            unreadCount: prev.unreadCount + count,
            notifications: [...(prev.notifications.slice(-19)), ...notifications] // Keep last 20 notifications
          }))
          
          // 觸發自定義事件供其他組件監聽
          window.dispatchEvent(new CustomEvent('newNotification', {
            detail: { count, data: notifications }
          }))
          
          // 觸發瀏覽器通知（如果用戶允許）
          if ('Notification' in window && Notification.permission === 'granted') {
            notifications.forEach((notif: any) => {
              new Notification(notif.title || '新通知', {
                body: notif.message || '您收到了新通知',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `notification-${notif.id || Date.now()}`,
                requireInteraction: notif.priority === 'urgent'
              })
            })
          }
          break

        case 'stats':
          if (data.data?.unreadCount !== undefined) {
            updateNotifications({
              unreadCount: data.data.unreadCount
            })
          }
          break

        case 'broadcast':
          // 處理廣播消息
          console.log('Received broadcast notification')
          setState(prev => ({
            ...prev,
            unreadCount: prev.unreadCount + 1
          }))
          
          // 觸發自定義事件
          window.dispatchEvent(new CustomEvent('broadcastNotification', {
            detail: { data: data.data }
          }))
          
          fetchNotificationStats()
          break
          
        case 'notification_read':
          // 處理通知已讀事件
          const readCount = data.count || 1
          setState(prev => ({
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - readCount)
          }))
          break
      }
    } catch (error) {
      console.error('SSE message parsing error:', error)
    }
  }, [updateConnectionStatus, updateNotifications, heartbeatTimeout, fetchNotificationStats])

  // 建立 SSE 連接
  const connectSSE = useCallback(() => {
    if (!enableSSE || typeof window === 'undefined') {
      return
    }

    // 清理現有連接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    updateConnectionStatus({ connecting: true, error: undefined })

    try {
      const eventSource = new EventSource('/api/notifications/stream', {
        withCredentials: true
      })

      eventSource.onopen = () => {
        console.log('SSE connection opened')
      }

      eventSource.onmessage = handleSSEMessage

      eventSource.onerror = () => {
        console.error('SSE connection error')
        updateConnectionStatus({
          connected: false,
          connecting: false,
          error: 'Connection failed'
        })

        eventSource.close()
        
        // 嘗試重連
        setState(prev => {
          const newAttempts = prev.connectionStatus.reconnectAttempts + 1
          
          if (newAttempts <= maxReconnectAttempts) {
            const delay = Math.min(reconnectDelay * Math.pow(2, newAttempts - 1), 30000)
            console.log(`Reconnecting SSE in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`)
            
            reconnectTimeoutRef.current = setTimeout(connectSSE, delay)
            
            return {
              ...prev,
              connectionStatus: {
                ...prev.connectionStatus,
                reconnectAttempts: newAttempts
              }
            }
          } else {
            console.warn('Max SSE reconnection attempts reached. Switching to polling.')
            startPolling()
            
            return {
              ...prev,
              connectionStatus: {
                ...prev.connectionStatus,
                error: 'Max reconnection attempts reached'
              }
            }
          }
        })
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      updateConnectionStatus({
        connected: false,
        connecting: false,
        error: 'Failed to create connection'
      })
      startPolling()
    }
  }, [enableSSE, handleSSEMessage, updateConnectionStatus, maxReconnectAttempts, reconnectDelay])

  // 開始輪詢模式（SSE 失敗時的後備方案）
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    console.log('Starting notification polling mode')
    fetchNotificationStats()
    
    pollingIntervalRef.current = setInterval(fetchNotificationStats, fallbackPollingInterval)
  }, [fetchNotificationStats, fallbackPollingInterval])

  // 手動重連
  const reconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        reconnectAttempts: 0
      }
    }))
    connectSSE()
  }, [connectSSE])

  // 斷開連接
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    updateConnectionStatus({
      connected: false,
      connecting: false,
      error: undefined
    })
  }, [updateConnectionStatus])

  // 初始化和清理
  useEffect(() => {
    // 首次加載獲取統計
    fetchNotificationStats()
    
    // 建立 SSE 連接
    if (enableSSE) {
      connectSSE()
    } else {
      startPolling()
    }

    return () => {
      disconnect()
    }
  }, [enableSSE]) // 只在 enableSSE 變化時重新初始化

  // 清理 effect
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // 標記通知為已讀
  const markNotificationsAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setState(prev => ({
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - result.affectedCount)
          }))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Mark notifications as read error:', error)
      return false
    }
  }, [])

  // 請求瀏覽器通知權限
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }, [])

  return {
    // 狀態
    unreadCount: state.unreadCount,
    notifications: state.notifications,
    connectionStatus: state.connectionStatus,
    
    // 操作
    reconnect,
    disconnect,
    fetchStats: fetchNotificationStats,
    markAsRead: markNotificationsAsRead,
    requestNotificationPermission,
    
    // 工具函數
    isConnected: state.connectionStatus.connected,
    isConnecting: state.connectionStatus.connecting,
    hasError: !!state.connectionStatus.error,
    
    // 連接統計
    connectionUptime: state.connectionStatus.uptime,
    connectionId: state.connectionStatus.connectionId,
    lastPing: state.connectionStatus.lastPing
  }
}

export default useRealTimeNotifications