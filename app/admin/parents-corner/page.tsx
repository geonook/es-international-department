'use client'

/**
 * Parents' Corner Unified Management Page
 * Parents' Corner 統一管理頁面
 * 
 * @description 統一管理 Events 和 Resources，提供整合性的 Parents' Corner 管理介面
 * @features Tab-based navigation, integrated dashboard, unified content management
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart3,
  Calendar,
  FileText,
  Settings,
  Users,
  TrendingUp,
  Plus,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import EventManager from '@/components/admin/EventManager'
import ResourceManager from '@/components/admin/ResourceManager'
import HomepageSettingsManager from '@/components/admin/HomepageSettingsManager'

// Tab 配置
const tabs = [
  { 
    id: 'dashboard', 
    label: '儀表板', 
    label_en: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  { 
    id: 'events', 
    label: '活動管理', 
    label_en: 'Events',
    icon: Calendar,
    description: 'Manage school events and activities'
  },
  { 
    id: 'resources', 
    label: '資源管理', 
    label_en: 'Resources',
    icon: FileText,
    description: 'Manage educational resources'
  },
  { 
    id: 'settings', 
    label: '頁面設定', 
    label_en: 'Settings',
    icon: Settings,
    description: 'Configure Parents\' Corner settings'
  }
]

interface DashboardStats {
  events: {
    total: number
    published: number
    thisMonth: number
    upcoming: number
  }
  resources: {
    total: number
    published: number
    downloads: number
    categories: number
  }
}

export default function ParentsCornerManagementPage() {
  const { user, isLoading, isAuthenticated, isAdmin, redirectToLogin } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 權限檢查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      redirectToLogin('/admin/parents-corner')
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectToLogin])

  // 載入統計數據
  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true)
      setError(null)

      // 並行載入 Events 和 Resources 統計
      const [eventsResponse, resourcesResponse] = await Promise.all([
        fetch('/api/admin/events?limit=1'),
        fetch('/api/admin/resources?limit=1')
      ])

      if (!eventsResponse.ok || !resourcesResponse.ok) {
        throw new Error('Failed to load statistics')
      }

      const eventsData = await eventsResponse.json()
      const resourcesData = await resourcesResponse.json()

      // 處理統計數據
      const stats: DashboardStats = {
        events: {
          total: eventsData.stats?.total || 0,
          published: eventsData.stats?.published || 0,
          thisMonth: Object.values(eventsData.stats?.byMonth || {}).reduce((sum: number, count: any) => sum + count, 0),
          upcoming: eventsData.stats?.in_progress || 0
        },
        resources: {
          total: resourcesData.pagination?.totalCount || 0,
          published: resourcesData.data?.filter((r: any) => r.status === 'published').length || 0,
          downloads: 0, // 需要從分析 API 獲取
          categories: 0 // 需要從分類 API 獲取
        }
      }

      setDashboardStats(stats)
    } catch (error) {
      console.error('Load dashboard stats error:', error)
      setError('Failed to load dashboard statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      loadDashboardStats()
    }
  }, [isAuthenticated, isAdmin])

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Parents' Corner Management...</p>
        </motion.div>
      </div>
    )
  }

  // 未授權狀態
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <Button onClick={() => redirectToLogin('/admin/parents-corner')}>
            Go to Login
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Parents' Corner Management</h1>
                <p className="text-sm text-gray-600">Unified Events & Resources Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardStats}
                disabled={statsLoading}
              >
                {statsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              <Button size="sm" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Site
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label_en}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardStats ? (
                    <>
                      <StatCard
                        title="Total Events"
                        value={dashboardStats.events.total}
                        subtitle={`${dashboardStats.events.published} published`}
                        icon={Calendar}
                        color="blue"
                      />
                      <StatCard
                        title="This Month Events"
                        value={dashboardStats.events.thisMonth}
                        subtitle={`${dashboardStats.events.upcoming} upcoming`}
                        icon={TrendingUp}
                        color="green"
                      />
                      <StatCard
                        title="Total Resources"
                        value={dashboardStats.resources.total}
                        subtitle={`${dashboardStats.resources.published} published`}
                        icon={FileText}
                        color="purple"
                      />
                      <StatCard
                        title="Active Users"
                        value={'-'}
                        subtitle="Coming soon"
                        icon={Users}
                        color="orange"
                      />
                    </>
                  ) : (
                    Array.from({ length: 4 }).map((_, index) => (
                      <StatCardSkeleton key={index} />
                    ))
                  )}
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setActiveTab('events')}
                      >
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <span className="font-medium">New Event</span>
                        <span className="text-xs text-gray-500">Create school event</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setActiveTab('resources')}
                      >
                        <FileText className="w-6 h-6 text-purple-600" />
                        <span className="font-medium">Add Resource</span>
                        <span className="text-xs text-gray-500">Upload new resource</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="w-6 h-6 text-green-600" />
                        <span className="font-medium">Page Settings</span>
                        <span className="text-xs text-gray-500">Configure homepage</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        asChild
                      >
                        <a href="/" target="_blank" rel="noopener noreferrer">
                          <Eye className="w-6 h-6 text-orange-600" />
                          <span className="font-medium">Preview Site</span>
                          <span className="text-xs text-gray-500">View live site</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EventManager />
              </motion.div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResourceManager />
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HomepageSettingsManager />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

// 統計卡片組件
interface StatCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg",
              colorClasses[color]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 統計卡片骨架屏
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}