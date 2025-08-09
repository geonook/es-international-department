'use client'

/**
 * Notification System Monitor - Admin Dashboard Component
 * Notification System Monitor - Administrator Dashboard Component
 * 
 * @description Provides notification system status monitoring for administrators, including SSE connection status, performance metrics, error monitoring, etc.
 * @features Real-time connection monitoring, performance metrics, notification statistics, system health status
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Users, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  WifiOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Database,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ConnectionDetail {
  id: string
  userId: string
  uptime: number
  lastPing: string
  userAgent: string
  ipAddress: string
}

interface SystemStats {
  connections: {
    active: number
    total: number
    userConnections: number
    errors: number
    reconnections: number
    details?: ConnectionDetail[]
  }
  system: {
    totalUsers: number
    totalNotifications: number
    unreadNotifications: number
    averageNotificationsPerUser: number
  }
  user: {
    total: number
    unread: number
    read: number
    recent: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  }
}

interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  uptime: number
  memoryUsage?: number
  cpuUsage?: number
}

export default function NotificationSystemMonitor() {
  // State management
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 seconds

  // Get system statistics
  const fetchSystemStats = useCallback(async () => {
    try {
      setError(null)
      const startTime = Date.now()
      
      const response = await fetch('/api/notifications/stats?includeConnectionStats=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setStats({
            connections: data.connections || {
              active: 0,
              total: 0,
              userConnections: 0,
              errors: 0,
              reconnections: 0
            },
            system: data.system || {
              totalUsers: 0,
              totalNotifications: 0,
              unreadNotifications: 0,
              averageNotificationsPerUser: 0
            },
            user: data.data?.user || {
              total: 0,
              unread: 0,
              read: 0,
              recent: 0,
              byType: {},
              byPriority: {}
            }
          })

          // Update performance metrics
          setPerformance(prev => ({
            responseTime,
            throughput: prev?.throughput || 0,
            errorRate: prev?.errorRate || 0,
            uptime: prev ? prev.uptime + (refreshInterval / 1000) : 0
          }))
          
          setLastUpdate(new Date())
        } else {
          throw new Error(data.message || 'Failed to get statistics')
        }
      } else if (response.status === 403) {
        throw new Error('Administrator privileges required to view system monitoring')
      } else {
        throw new Error(`Request failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [refreshInterval])

  // Auto refresh
  useEffect(() => {
    fetchSystemStats()
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchSystemStats, autoRefresh, refreshInterval])

  // Manual refresh
  const handleManualRefresh = () => {
    setIsLoading(true)
    fetchSystemStats()
  }

  // Calculate system health status
  const getSystemHealthStatus = () => {
    if (!stats || !performance) return 'unknown'
    
    const { connections } = stats
    const errorRate = connections.errors / Math.max(connections.total, 1)
    
    if (errorRate > 0.1 || performance.responseTime > 2000) return 'critical'
    if (errorRate > 0.05 || performance.responseTime > 1000) return 'warning'
    return 'healthy'
  }

  const systemHealth = getSystemHealthStatus()

  // Format time
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatUptime = (uptime: number) => {
    if (uptime < 60) return `${Math.floor(uptime)}s`
    if (uptime < 3600) return `${Math.floor(uptime / 60)}m`
    if (uptime < 86400) return `${Math.floor(uptime / 3600)}h`
    return `${Math.floor(uptime / 86400)}d`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title and controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification System Monitor</h2>
          <p className="text-gray-600">即時監控通知系統狀態和性能</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {lastUpdate ? `最後更新: ${lastUpdate.toLocaleTimeString()}` : '尚未更新'}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            刷新
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? '自動刷新中' : '開始自動刷新'}
          </Button>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 系統健康狀況 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {systemHealth === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {systemHealth === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
            {systemHealth === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
            {systemHealth === 'unknown' && <Activity className="w-5 h-5 text-gray-500" />}
            系統健康狀況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {systemHealth === 'healthy' && <span className="text-green-600">良好</span>}
                {systemHealth === 'warning' && <span className="text-yellow-600">警告</span>}
                {systemHealth === 'critical' && <span className="text-red-600">嚴重</span>}
                {systemHealth === 'unknown' && <span className="text-gray-600">未知</span>}
              </div>
              <div className="text-sm text-gray-600">整體狀況</div>
            </div>
            
            {performance && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold">{performance.responseTime}ms</div>
                  <div className="text-sm text-gray-600">響應時間</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatUptime(performance.uptime)}</div>
                  <div className="text-sm text-gray-600">運行時間</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(performance.errorRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">錯誤率</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 詳細監控 */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">連接狀況</TabsTrigger>
          <TabsTrigger value="notifications">通知統計</TabsTrigger>
          <TabsTrigger value="performance">性能指標</TabsTrigger>
          <TabsTrigger value="system">系統資訊</TabsTrigger>
        </TabsList>

        {/* 連接狀況 */}
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.connections.active || 0}</p>
                    <p className="text-sm text-gray-600">活躍連接</p>
                  </div>
                  <Wifi className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.connections.total || 0}</p>
                    <p className="text-sm text-gray-600">總連接數</p>
                  </div>
                  <Server className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.connections.userConnections || 0}</p>
                    <p className="text-sm text-gray-600">用戶連接</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.connections.errors || 0}</p>
                    <p className="text-sm text-gray-600">連接錯誤</p>
                  </div>
                  <WifiOff className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 連接詳情 */}
          {stats?.connections.details && stats.connections.details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>活躍連接詳情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.connections.details.map((conn) => (
                    <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{conn.userId}</div>
                        <div className="text-sm text-gray-600">
                          {conn.ipAddress} • 運行時間: {formatDuration(conn.uptime)}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(conn.lastPing).toLocaleTimeString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 通知統計 */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.system.totalNotifications || 0}</p>
                    <p className="text-sm text-gray-600">總通知數</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.system.unreadNotifications || 0}</p>
                    <p className="text-sm text-gray-600">未讀通知</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.system.totalUsers || 0}</p>
                    <p className="text-sm text-gray-600">總用戶數</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.system.averageNotificationsPerUser.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-gray-600">平均通知數</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 通知類型分布 */}
          {stats?.user.byType && Object.keys(stats.user.byType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>通知類型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.user.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={(count / Math.max(...Object.values(stats.user.byType))) * 100} 
                          className="w-32"
                        />
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 性能指標 */}
        <TabsContent value="performance" className="space-y-4">
          {performance && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{performance.responseTime}ms</p>
                      <p className="text-sm text-gray-600">平均響應時間</p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                  <Progress 
                    value={Math.min(performance.responseTime / 20, 100)} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatUptime(performance.uptime)}</p>
                      <p className="text-sm text-gray-600">系統運行時間</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {(performance.errorRate * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-600">錯誤率</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                  <Progress 
                    value={performance.errorRate * 100} 
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 系統資訊 */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系統配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">連接限制</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>每用戶最大連接數:</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>最大總連接數:</span>
                      <span>1000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>每分鐘最大連接數:</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">通知設置</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>心跳間隔:</span>
                      <span>30秒</span>
                    </div>
                    <div className="flex justify-between">
                      <span>連接超時:</span>
                      <span>5分鐘</span>
                    </div>
                    <div className="flex justify-between">
                      <span>自動刷新間隔:</span>
                      <span>{refreshInterval / 1000}秒</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}