"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, Calendar, User, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

/**
 * 公告列表頁面組件 - KCISLK ESID Info Hub
 * Announcements List Page Component
 * 
 * @description 顯示所有已發布的公告，支援搜尋、篩選和分頁功能
 * @features 響應式設計、動畫效果、搜尋篩選、分頁瀏覽
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface Announcement {
  id: number
  title: string
  content: string
  type: string
  priority: 'high' | 'medium' | 'low'
  isImportant: boolean
  isPinned: boolean
  date: string
  author: string
  targetAudience: 'teachers' | 'parents' | 'all'
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage, searchQuery, priorityFilter, audienceFilter])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        page: currentPage.toString()
      })
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter)
      }
      if (audienceFilter !== 'all') {
        params.append('audience', audienceFilter)
      }

      const response = await fetch(`/api/public/messages?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setAnnouncements(data.data || [])
        setTotalCount(data.total || 0)
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // 重置到第一頁
  }

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value)
    setCurrentPage(1)
  }

  const handleAudienceFilter = (value: string) => {
    setAudienceFilter(value)
    setCurrentPage(1)
  }

  const getPriorityStyles = (priority: string) => {
    const styles = {
      high: "bg-red-100 text-red-700 border-red-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      low: "bg-green-100 text-green-700 border-green-300"
    }
    return styles[priority as keyof typeof styles] || styles.medium
  }

  const getAudienceStyles = (audience: string) => {
    const styles = {
      teachers: "bg-blue-100 text-blue-700",
      parents: "bg-purple-100 text-purple-700",
      all: "bg-gray-100 text-gray-700"
    }
    return styles[audience as keyof typeof styles] || styles.all
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">返回首頁</span>
              </Link>
              <div className="h-6 w-px bg-indigo-200"></div>
              <h1 className="text-2xl font-bold text-gray-900">最新公告</h1>
            </div>
            <div className="text-sm text-gray-600">
              共 {totalCount} 則公告
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜尋和篩選區域 */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 搜尋欄 */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋公告標題或內容..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 border-indigo-200 focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* 優先級篩選 */}
              <div>
                <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                    <SelectValue placeholder="選擇優先級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有優先級</SelectItem>
                    <SelectItem value="high">高優先級</SelectItem>
                    <SelectItem value="medium">中優先級</SelectItem>
                    <SelectItem value="low">低優先級</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 對象篩選 */}
              <div>
                <Select value={audienceFilter} onValueChange={handleAudienceFilter}>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                    <SelectValue placeholder="選擇對象" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有對象</SelectItem>
                    <SelectItem value="teachers">教師</SelectItem>
                    <SelectItem value="parents">家長</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 公告列表 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-indigo-100 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-indigo-100">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暫無公告</h3>
                <p className="text-gray-600">目前沒有符合條件的公告，請調整搜尋條件或稍後再試。</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  variants={itemVariants}
                  className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-indigo-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <Card className="border-0 bg-transparent">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-xl text-gray-900 leading-tight">
                            {announcement.title}
                            {announcement.isImportant && (
                              <span className="ml-2 inline-flex items-center">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              </span>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{announcement.author}</span>
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>{formatDate(announcement.date)}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <Badge className={getPriorityStyles(announcement.priority)}>
                            {announcement.priority === 'high' ? '高' : 
                             announcement.priority === 'medium' ? '中' : '低'}
                          </Badge>
                          <div>
                            <Badge variant="outline" className={getAudienceStyles(announcement.targetAudience)}>
                              {announcement.targetAudience === 'teachers' ? '教師' :
                               announcement.targetAudience === 'parents' ? '家長' : '全部'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 分頁導航 */}
        {!loading && announcements.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-indigo-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-indigo-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一頁
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={currentPage === pageNumber 
                          ? "bg-indigo-600 hover:bg-indigo-700" 
                          : "border-indigo-200"
                        }
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-indigo-200"
                >
                  下一頁
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}