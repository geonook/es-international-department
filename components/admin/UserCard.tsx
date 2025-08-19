'use client'

/**
 * User Card Component
 * 
 * @description Single user information display card with role management and action buttons
 * @features Role badges, status indicators, quick actions, responsive design
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  Shield,
  Clock,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  Building2,
  Calendar,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  roles: Array<{
    id: number
    name: string
    displayName: string
  }>
}

interface UserCardProps {
  user: UserData
  onEdit?: (user: UserData) => void
  onDelete?: (userId: string) => void
  onToggleStatus?: (userId: string, isActive: boolean) => void
  onManageRoles?: (user: UserData) => void
  showActions?: boolean
  className?: string
}

export default function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageRoles,
  showActions = false,
  className
}: UserCardProps) {
  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time ago
  const timeAgo = (date: Date | string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(date)
  }

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return <Crown className="w-3 h-3" />
      case 'office_member':
      case 'teacher': // Backward compatibility
        return <Building2 className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  // Get role color
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'office_member':
      case 'teacher': // Backward compatibility
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <motion.div
      layout
      className={cn("w-full", className)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* User info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* User details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'Unnamed User'}
                  </h3>
                  
                  {/* Status indicator */}
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    user.isActive ? "bg-green-400" : "bg-gray-400"
                  )} />
                  
                  {/* Email verified badge */}
                  {user.emailVerified && (
                    <UserCheck className="w-4 h-4 text-green-600" />
                  )}
                </div>

                {/* Contact info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Roles */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="outline"
                      className={cn(
                        "text-xs flex items-center gap-1",
                        getRoleColor(role.name)
                      )}
                    >
                      {getRoleIcon(role.name)}
                      {role.displayName}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      No roles assigned
                    </Badge>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last seen {timeAgo(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(user)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageRoles?.(user)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Shield className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => onEdit?.(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onManageRoles?.(user)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Roles
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus?.(user.id, !user.isActive)}
                      className={user.isActive ? "text-orange-600" : "text-green-600"}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Deactivate User
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Activate User
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(user.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}