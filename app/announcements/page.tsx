"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Calendar, User, AlertCircle, ChevronLeft, ChevronRight, Bell, Filter, Clock, Users } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

/**
 * KCISLK ESID Announcements Page - Complete English Implementation
 * 
 * @description Display all published announcements with search, filtering, and pagination
 * @features Responsive design, smooth animations, advanced search & filtering, pagination
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 * @version 2.0 - Complete English Localization
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

interface FilterState {
  search: string
  priority: string
  audience: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
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
    setCurrentPage(1) // Reset to first page
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: 'High Priority',
      medium: 'Medium Priority', 
      low: 'Low Priority'
    }
    return labels[priority as keyof typeof labels] || 'Medium Priority'
  }

  const getAudienceLabel = (audience: string) => {
    const labels = {
      teachers: 'Teachers',
      parents: 'Parents',
      all: 'Everyone'
    }
    return labels[audience as keyof typeof labels] || 'Everyone'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-all duration-200 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-indigo-200"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Latest Announcements</h1>
                  <p className="text-sm text-gray-600">Stay updated with KCISLK ESID news</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg border border-indigo-100">
              <Users className="w-4 h-4" />
              <span className="font-medium">{totalCount}</span>
              <span>announcement{totalCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Search & Filter Announcements</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base"
                  />
                </div>
              </div>

              {/* Priority Filter */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audience Filter */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <Select value={audienceFilter} onValueChange={handleAudienceFilter}>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchQuery || priorityFilter !== 'all' || audienceFilter !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  {priorityFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Priority: {getPriorityLabel(priorityFilter)}
                    </Badge>
                  )}
                  {audienceFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Audience: {getAudienceLabel(audienceFilter)}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setPriorityFilter('all')
                      setAudienceFilter('all')
                      setCurrentPage(1)
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Announcements List */}
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
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-6 bg-gray-200 rounded w-8"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
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
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-12 shadow-lg border border-indigo-100 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Announcements Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery || priorityFilter !== 'all' || audienceFilter !== 'all'
                    ? "No announcements match your current search criteria. Try adjusting your filters or search terms."
                    : "There are currently no published announcements. Please check back later for updates."}
                </p>
                {(searchQuery || priorityFilter !== 'all' || audienceFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setPriorityFilter('all')
                      setAudienceFilter('all')
                      setCurrentPage(1)
                    }}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    Clear All Filters
                  </Button>
                )}
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
                  <Card className="border-0 bg-transparent hover:bg-white/40 transition-all duration-300">
                    <CardHeader className="pb-4 px-4 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            {announcement.isPinned && (
                              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              </div>
                            )}
                            <div className="flex-1">
                              <CardTitle className="text-lg sm:text-xl text-gray-900 leading-tight mb-2 break-words">
                                {announcement.title}
                                {announcement.isImportant && (
                                  <span className="ml-2 inline-flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  </span>
                                )}
                              </CardTitle>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">{announcement.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(announcement.date)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0 mt-2 sm:mt-0">
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityStyles(announcement.priority)} font-medium`}
                          >
                            {getPriorityLabel(announcement.priority)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`${getAudienceStyles(announcement.targetAudience)} text-xs`}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {getAudienceLabel(announcement.targetAudience)}
                          </Badge>
                          {announcement.isPinned && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                          {announcement.content}
                        </p>
                      </div>
                      
                      {/* Additional metadata */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                          <span>Type: {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}</span>
                          {announcement.isImportant && (
                            <span className="text-red-600 font-medium">⚠ Important Notice</span>
                          )}
                        </div>
                        <div className="text-gray-400">
                          ID: #{announcement.id}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Navigation */}
        {!loading && announcements.length > 0 && totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex flex-col items-center space-y-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg border border-indigo-100 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <span className="block sm:inline">Page {currentPage} of {totalPages}</span>
                  <span className="block sm:inline sm:ml-2">({totalCount} total)</span>
                </div>
                
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 px-2 sm:px-3"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(7, totalPages))].map((_, index) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 6, currentPage - 3)) + index
                      if (pageNumber > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={currentPage === pageNumber 
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white min-w-[2.5rem]" 
                            : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 min-w-[2.5rem]"
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
                    className="border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick navigation */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Quick jump:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 h-auto"
              >
                First
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 h-auto"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}