'use client'

/**
 * AnnouncementList Component
 * 公告列表顯示組件
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Users,
  GraduationCap,
  Globe,
  Loader2,
  AlertTriangle,
  ChevronDown,
  X,
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Send,
  FileText,
  MoreHorizontal
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  AnnouncementListProps,
  AnnouncementFilters,
  SortOption,
  TARGET_AUDIENCE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  BulkAnnouncementOperation,
  BulkAnnouncementAction
} from '@/lib/types'
import AnnouncementCard from './AnnouncementCard'

export default function AnnouncementList({
  announcements = [],
  loading = false,
  error,
  onEdit,
  onDelete,
  onBulkOperation,
  onFiltersChange,
  onPageChange,
  pagination,
  filters,
  showActions = false,
  enableBulkActions = false,
  className
}: AnnouncementListProps) {
  const [localFilters, setLocalFilters] = useState<AnnouncementFilters>({
    targetAudience: 'all',
    priority: undefined,
    status: undefined,
    search: '',
    ...filters
  })
  const [searchQuery, setSearchQuery] = useState(filters?.search || '')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  // Batch operations state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [bulkAction, setBulkAction] = useState<BulkAnnouncementAction | null>(null)
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)

  // 處理搜尋
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...localFilters, search: query }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // 處理篩選變更
  const handleFilterChange = (key: keyof AnnouncementFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // 清除篩選條件
  const clearFilters = () => {
    const newFilters: AnnouncementFilters = {
      targetAudience: 'all',
      priority: undefined,
      status: undefined,
      search: ''
    }
    setLocalFilters(newFilters)
    setSearchQuery('')
    onFiltersChange?.(newFilters)
  }

  // 處理卡片展開/收合
  const handleToggleExpand = (announcementId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId)
      } else {
        newSet.add(announcementId)
      }
      return newSet
    })
  }

  // 批量選擇處理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sortedAnnouncements.map(a => a.id)
      setSelectedIds(new Set(allIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectAnnouncement = (announcementId: number, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(announcementId)
      } else {
        newSet.delete(announcementId)
      }
      return newSet
    })
  }

  // 批量操作處理
  const handleBulkOperation = async (action: BulkAnnouncementAction) => {
    if (selectedIds.size === 0) return
    
    setBulkAction(action)
    setShowBulkConfirm(true)
  }

  const confirmBulkOperation = async () => {
    if (!bulkAction || selectedIds.size === 0 || !onBulkOperation) return

    setBulkOperationLoading(true)
    try {
      const operation: BulkAnnouncementOperation = {
        action: bulkAction,
        announcementIds: Array.from(selectedIds),
        targetStatus: bulkAction === 'publish' ? 'published' : 
                     bulkAction === 'archive' ? 'archived' : 
                     bulkAction === 'draft' ? 'draft' : undefined
      }
      
      await onBulkOperation(operation)
      setSelectedIds(new Set())
      setShowBulkConfirm(false)
      setBulkAction(null)
    } catch (error) {
      console.error('批量操作失敗:', error)
    } finally {
      setBulkOperationLoading(false)
    }
  }

  const cancelBulkOperation = () => {
    setShowBulkConfirm(false)
    setBulkAction(null)
  }

  // 取得可用的批量操作
  const getAvailableBulkActions = () => {
    if (selectedIds.size === 0) return []
    
    const selectedAnnouncements = sortedAnnouncements.filter(a => selectedIds.has(a.id))
    const statuses = new Set(selectedAnnouncements.map(a => a.status))
    
    const actions: { action: BulkAnnouncementAction; label: string; icon: any; variant?: 'default' | 'destructive'; description?: string }[] = []
    
    // 如果包含草稿，可以批量發布
    if (statuses.has('draft')) {
      const draftCount = selectedAnnouncements.filter(a => a.status === 'draft').length
      actions.push({ 
        action: 'publish', 
        label: `批量發布 (${draftCount})`, 
        icon: Send,
        description: '將選中的草稿狀態公告發布給目標對象'
      })
    }
    
    // 如果包含已發布，可以批量歸檔
    if (statuses.has('published')) {
      const publishedCount = selectedAnnouncements.filter(a => a.status === 'published').length
      actions.push({ 
        action: 'archive', 
        label: `批量歸檔 (${publishedCount})`, 
        icon: Archive,
        description: '將選中的已發布公告歸檔，用戶將無法查看'
      })
    }
    
    // 如果包含已發布或已歸檔，可以轉為草稿
    if (statuses.has('published') || statuses.has('archived')) {
      const nonDraftCount = selectedAnnouncements.filter(a => a.status !== 'draft').length
      actions.push({ 
        action: 'draft', 
        label: `轉為草稿 (${nonDraftCount})`, 
        icon: FileText,
        description: '將選中的公告轉為草稿狀態，停止對用戶顯示'
      })
    }
    
    // 總是可以批量刪除
    actions.push({ 
      action: 'delete', 
      label: `批量刪除 (${selectedIds.size})`, 
      icon: Trash2, 
      variant: 'destructive',
      description: '永久刪除選中的公告，此操作無法復原'
    })
    
    return actions
  }

  // 取得批量操作確認訊息
  const getBulkActionMessage = () => {
    const count = selectedIds.size
    const selectedAnnouncements = sortedAnnouncements.filter(a => selectedIds.has(a.id))
    
    switch (bulkAction) {
      case 'publish':
        const draftCount = selectedAnnouncements.filter(a => a.status === 'draft').length
        return `確定要發布選中的 ${draftCount} 則草稿公告嗎？發布後將對目標對象可見。其他 ${count - draftCount} 則公告將保持原狀態。`
      case 'archive':
        const publishedCount = selectedAnnouncements.filter(a => a.status === 'published').length
        return `確定要歸檔選中的 ${publishedCount} 則已發布公告嗎？歸檔後將不再對用戶顯示。其他 ${count - publishedCount} 則公告將保持原狀態。`
      case 'draft':
        const nonDraftCount = selectedAnnouncements.filter(a => a.status !== 'draft').length
        return `確定要將選中的 ${nonDraftCount} 則公告轉為草稿嗎？轉為草稿後將不再對用戶顯示。其他 ${count - nonDraftCount} 則公告已是草稿狀態。`
      case 'delete':
        return `確定要永久刪除選中的 ${count} 則公告嗎？此操作不可恢復，刪除後無法找回這些公告的內容。`
      default:
        return '確定要執行此操作嗎？'
    }
  }

  // 判斷是否全選
  const isAllSelected = sortedAnnouncements.length > 0 && 
                       sortedAnnouncements.every(a => selectedIds.has(a.id))
  const isPartialSelected = selectedIds.size > 0 && 
                           sortedAnnouncements.some(a => selectedIds.has(a.id)) &&
                           !isAllSelected

  // 排序公告
  const sortedAnnouncements = useMemo(() => {
    if (!announcements.length) return []

    const sorted = [...announcements].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'title':
          comparison = a.title.localeCompare(b.title, 'zh-TW')
          break
        default:
          comparison = 0
      }

      return sortOrder === 'desc' ? comparison : -comparison
    })

    return sorted
  }, [announcements, sortBy, sortOrder])

  // 取得篩選器標籤
  const getFilterLabels = () => {
    const labels = []
    if (localFilters.targetAudience && localFilters.targetAudience !== 'all') {
      labels.push(`對象: ${TARGET_AUDIENCE_LABELS[localFilters.targetAudience]}`)
    }
    if (localFilters.priority) {
      labels.push(`優先級: ${PRIORITY_LABELS[localFilters.priority]}`)
    }
    if (localFilters.status) {
      labels.push(`狀態: ${STATUS_LABELS[localFilters.status]}`)
    }
    if (localFilters.search) {
      labels.push(`搜尋: "${localFilters.search}"`)
    }
    return labels
  }

  // 產生分頁按鈕
  const renderPaginationItems = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const items = []
    const { page, totalPages } = pagination
    const maxVisiblePages = 5

    // 計算可見頁面範圍
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 第一頁
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={() => onPageChange?.(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />)
      }
    }

    // 中間頁面
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange?.(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // 最後一頁
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />)
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange?.(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {/* 標題和操作區 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">公告管理</h2>
          <p className="text-gray-600 mt-1">
            {pagination ? `共 ${pagination.totalCount} 則公告` : `${announcements.length} 則公告`}
            {enableBulkActions && selectedIds.size > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                已選擇 {selectedIds.size} 項
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 批量操作按鈕 */}
          {enableBulkActions && selectedIds.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MoreHorizontal className="w-4 h-4" />
                  批量操作 ({selectedIds.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {getAvailableBulkActions().map((actionItem, index) => (
                  <div key={actionItem.action}>
                    {index > 0 && actionItem.action === 'delete' && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleBulkOperation(actionItem.action)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        actionItem.variant === 'destructive' && "text-red-600 focus:text-red-600"
                      )}
                      title={actionItem.description}
                    >
                      <actionItem.icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{actionItem.label}</span>
                        {actionItem.description && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {actionItem.description}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* 檢視模式切換 */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>

          {/* 排序 */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新建立</SelectItem>
              <SelectItem value="oldest">最舊建立</SelectItem>
              <SelectItem value="priority">優先級</SelectItem>
              <SelectItem value="title">標題</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-9 w-9 p-0"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 批量選擇和搜尋欄 */}
            <div className="flex-1 flex items-center gap-3">
              {/* 批量選擇複選框 */}
              {enableBulkActions && (
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAll(!isAllSelected)}
                    className="h-9 w-9 p-0 border rounded"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isPartialSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" style={{ opacity: 0.5 }} />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              )}
              
              {/* 搜尋欄 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋公告標題、內容或摘要..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 篩選按鈕 */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              篩選
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showFilters && "transform rotate-180"
              )} />
            </Button>
          </div>

          {/* 展開的篩選器 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 目標對象篩選 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目標對象
                      </label>
                      <Select
                        value={localFilters.targetAudience || 'all'}
                        onValueChange={(value) => handleFilterChange('targetAudience', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              所有對象
                            </div>
                          </SelectItem>
                          <SelectItem value="teachers">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              教師
                            </div>
                          </SelectItem>
                          <SelectItem value="parents">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              家長
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 優先級篩選 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        優先級
                      </label>
                      <Select
                        value={localFilters.priority || ''}
                        onValueChange={(value) => handleFilterChange('priority', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="所有優先級" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">所有優先級</SelectItem>
                          <SelectItem value="high">高優先級</SelectItem>
                          <SelectItem value="medium">一般</SelectItem>
                          <SelectItem value="low">低優先級</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 狀態篩選 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        狀態
                      </label>
                      <Select
                        value={localFilters.status || ''}
                        onValueChange={(value) => handleFilterChange('status', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="所有狀態" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">所有狀態</SelectItem>
                          <SelectItem value="published">已發布</SelectItem>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="archived">已封存</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 篩選標籤和清除按鈕 */}
                  {getFilterLabels().length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="text-sm text-gray-600">目前篩選:</span>
                      {getFilterLabels().map((label, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        清除
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 載入狀態 */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 公告列表 */}
      {!loading && (
        <AnimatePresence mode="wait">
          {sortedAnnouncements.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    沒有找到公告
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {getFilterLabels().length > 0 
                      ? '請試著調整篩選條件或搜尋關鍵字'
                      : '目前還沒有任何公告'}
                  </p>
                  {getFilterLabels().length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      清除所有篩選
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={containerVariants}
              className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                  : "space-y-4"
              )}
            >
              {sortedAnnouncements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  variants={itemVariants}
                  layout
                >
                  <AnnouncementCard
                    announcement={announcement}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleExpand={handleToggleExpand}
                    onSelect={enableBulkActions ? handleSelectAnnouncement : undefined}
                    isExpanded={expandedCards.has(announcement.id)}
                    isSelected={selectedIds.has(announcement.id)}
                    showActions={showActions}
                    enableSelection={enableBulkActions}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 分頁控制 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.hasPrevPage && onPageChange?.(pagination.page - 1)}
                  className={cn(
                    !pagination.hasPrevPage && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.hasNextPage && onPageChange?.(pagination.page + 1)}
                  className={cn(
                    !pagination.hasNextPage && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 批量操作確認對話框 */}
      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent aria-describedby="bulk-operation-description">
          <DialogHeader>
            <DialogTitle id="bulk-operation-title">
              確認批量操作
            </DialogTitle>
            <DialogDescription id="bulk-operation-description">
              {getBulkActionMessage()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelBulkOperation}
              disabled={bulkOperationLoading}
            >
              取消
            </Button>
            <Button
              onClick={confirmBulkOperation}
              disabled={bulkOperationLoading}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              aria-live="polite"
              aria-label={bulkOperationLoading ? "正在處理批量操作..." : "確認批量操作"}
            >
              {bulkOperationLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}