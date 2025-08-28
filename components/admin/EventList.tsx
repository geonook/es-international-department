'use client'

/**
 * Event List Component
 * Event List Component
 * 
 * @description Event list display component with pagination, sorting and batch operations support
 * @features Responsive design, status indicators, quick actions, pagination navigation
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  UserCheck,
  Plus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EventCard from '@/components/admin/EventCard'
import { 
  Event,
  EventListProps,
  PaginationInfo,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS
} from '@/lib/types'
import { cn } from '@/lib/utils'

export default function EventList({
  events = [],
  loading = false,
  error,
  onEdit,
  onDelete,
  onView,
  onManageRegistrations,
  onPageChange,
  pagination,
  showActions = false,
  className
}: EventListProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  // Handle card expand/collapse
  const handleToggleExpand = (eventId: number) => {
    setExpandedCard(expandedCard === eventId ? null : eventId)
  }

  // Pagination component
  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const pages = []
    const currentPage = pagination.page
    const totalPages = pagination.totalPages

    // Calculate displayed page range
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, currentPage + 2)

    // Adjust range to ensure always showing 5 pages (if possible)
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4)
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center text-sm text-gray-700">
          Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalCount)} items,
          total {pagination.totalCount} items
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange?.(page)}
              className={page === currentPage ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center space-x-4 mt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Empty state
  const EmptyState = () => (
    <Card>
      <CardContent className="p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
        <p className="text-gray-600 mb-4">There are currently no events that match the filter criteria</p>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </CardContent>
    </Card>
  )

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Event list */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : events.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard
                  event={event}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onManageRegistrations={onManageRegistrations}
                  showActions={showActions}
                  isExpanded={expandedCard === event.id}
                  onToggleExpand={() => handleToggleExpand(event.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination control */}
      {!loading && events.length > 0 && <PaginationControls />}
    </div>
  )
}