'use client'

/**
 * Resource Analytics Component - KCISLK ESID Info Hub
 * Resource Analytics Component - KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  Star,
  Users,
  Calendar,
  FileText,
  Folder,
  RefreshCw,
  FileDown,
  Filter,
  AlertTriangle,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResourceStats {
  total: number
  published: number
  draft: number
  archived: number
  featured: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byGradeLevel: Record<string, number>
  totalDownloads: number
  totalViews: number
  avgDownloadsPerResource: number
  avgViewsPerResource: number
  popularResources: {
    id: number
    title: string
    downloadCount: number
    viewCount: number
    category?: string
    resourceType: string
  }[]
  recentActivity: {
    date: string
    uploads: number
    downloads: number
    views: number
  }[]
  categoryPerformance: {
    categoryName: string
    resourceCount: number
    totalDownloads: number
    totalViews: number
    avgEngagement: number
  }[]
}

interface ResourceAnalyticsProps {
  stats: ResourceStats | null
  categories: any[]
  gradeLevels: any[]
  onRefresh: () => void
}

export default function ResourceAnalytics({
  stats,
  categories,
  gradeLevels,
  onRefresh
}: ResourceAnalyticsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [timeRange, setTimeRange] = useState('30')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('')

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedGradeLevel && { gradeLevelId: selectedGradeLevel })
      })

      const response = await fetch(`/api/admin/resources/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }
      
      // Stats will be updated in parent component
      
    } catch (error) {
      console.error('Analytics fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = () => {
    fetchAnalytics()
  }

  // Export analytics data
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedGradeLevel && { gradeLevelId: selectedGradeLevel }),
        format: 'csv'
      })

      const response = await fetch(`/api/admin/resources/analytics/export?${params}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resource-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export analytics data')
    }
  }

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: ArrowUpRight, color: 'text-green-600', direction: 'up' }
    } else if (current < previous) {
      return { icon: ArrowDownRight, color: 'text-red-600', direction: 'down' }
    } else {
      return { icon: Minus, color: 'text-gray-600', direction: 'neutral' }
    }
  }

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600 mb-4">No analytics data is currently available</p>
        <Button onClick={onRefresh} className="bg-purple-600 hover:bg-purple-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">Resource Analytics Report</h2>
          <p className="text-gray-600 mt-1">View resource usage statistics and trend analysis</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Past 7 Days</SelectItem>
              <SelectItem value="30">Past 30 Days</SelectItem>
              <SelectItem value="90">Past 90 Days</SelectItem>
              <SelectItem value="365">Past Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleFilterChange} disabled={loading}>
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="text-gray-600 mt-2">Loading analytics data...</p>
          </div>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Overview Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Downloads</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalDownloads.toLocaleString()}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    Average {stats.avgDownloadsPerResource.toFixed(1)} per resource
                  </p>
                </div>
                <Download className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-green-800">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-green-600 text-xs mt-1">
                    Average {stats.avgViewsPerResource.toFixed(1)} per resource
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Published Resources</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.published}</p>
                  <p className="text-purple-600 text-xs mt-1">
                    {((stats.published / stats.total) * 100).toFixed(1)}% of total resources
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Featured Resources</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.featured}</p>
                  <p className="text-yellow-600 text-xs mt-1">
                    Featured rate {((stats.featured / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Type Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resource Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="font-medium">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Performance */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.categoryPerformance?.slice(0, 5).map((category, index) => (
                    <div key={category.categoryName} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">#{index + 1}</span>
                        <span className="font-medium">{category.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{category.resourceCount} resources</span>
                        <span>•</span>
                        <span>{category.totalDownloads} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Popular Resources */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Popular Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularResources?.slice(0, 10).map((resource, index) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {resource.resourceType}
                          </Badge>
                          {resource.category && (
                            <Badge variant="outline" className="text-xs">
                              {resource.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {resource.downloadCount} downloads
                      </div>
                      <div className="text-xs text-gray-600">
                        {resource.viewCount} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}