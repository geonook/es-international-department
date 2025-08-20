'use client'

/**
 * User List Component
 * 
 * @description User list display component with pagination, search, filtering and bulk operations
 * @features Responsive design, search/filter, role filtering, pagination navigation
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
} from 'lucide-react'
import UserCard, { UserData } from '@/components/admin/UserCard'
import { cn } from '@/lib/utils'

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

interface UserListProps {
  users?: UserData[]
  loading?: boolean
  error?: string
  onEdit?: (user: UserData) => void
  onDelete?: (userId: string) => void
  onToggleStatus?: (userId: string, isActive: boolean) => void
  onManageRoles?: (user: UserData) => void
  onApproveUser?: (userId: string) => void
  onRejectUser?: (userId: string) => void
  onAddUser?: () => void
  onSearch?: (query: string) => void
  onFilterRole?: (role: string) => void
  onPageChange?: (page: number) => void
  onRefresh?: () => void
  pagination?: PaginationInfo
  searchQuery?: string
  roleFilter?: string
  showActions?: boolean
  className?: string
}

export default function UserList({
  users = [],
  loading = false,
  error,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageRoles,
  onApproveUser,
  onRejectUser,
  onAddUser,
  onSearch,
  onFilterRole,
  onPageChange,
  onRefresh,
  pagination,
  searchQuery = '',
  roleFilter = '',
  showActions = false,
  className
}: UserListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch?.(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    onFilterRole?.(value === 'all' ? '' : value)
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
          Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalCount)} users,
          total {pagination.totalCount} users
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
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
              className={page === currentPage ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
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
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
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
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600 mb-4">
          {searchQuery || roleFilter ? 
            'No users match the current search criteria' : 
            'There are currently no users in the system'
          }
        </p>
        {onAddUser && (
          <Button onClick={onAddUser} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First User
          </Button>
        )}
      </CardContent>
    </Card>
  )

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Count active/inactive users
  const activeUsersCount = users.filter(user => user.isActive).length
  const inactiveUsersCount = users.length - activeUsersCount

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10"
            />
          </div>

          {/* Role filter */}
          <Select value={roleFilter || 'all'} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="office_member">Office Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="pending">待審核用戶</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          )}
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {onAddUser && (
            <Button size="sm" onClick={onAddUser} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsersCount}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Users</p>
                  <p className="text-2xl font-bold text-orange-600">{inactiveUsersCount}</p>
                </div>
                <UserX className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User list */}
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
        ) : users.length === 0 ? (
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
            key="users"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserCard
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onManageRoles={onManageRoles}
                  onApproveUser={onApproveUser}
                  onRejectUser={onRejectUser}
                  showActions={showActions}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination control */}
      {!loading && users.length > 0 && <PaginationControls />}
    </div>
  )
}