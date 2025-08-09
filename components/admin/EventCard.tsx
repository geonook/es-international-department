'use client'

/**
 * Event Card Component
 * Event Card Component
 * 
 * @description Single event information display card with expand/collapse and action buttons support
 * @features Status indicators, quick actions, registration information, responsive design
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Timer,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Event,
  EventCardProps,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS
} from '@/lib/types'
import { cn } from '@/lib/utils'

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onView,
  onManageRegistrations,
  showActions = false,
  showRegistrationInfo = true,
  isExpanded = false,
  onToggleExpand,
  className
}: EventCardProps) {
  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (time: Date | string) => {
    return new Date(time).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate event status
  const getEventStatus = () => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = event.endDate ? new Date(event.endDate) : startDate

    if (event.status === 'cancelled') return 'cancelled'
    if (event.status === 'postponed') return 'postponed'
    
    if (now < startDate) return 'upcoming'
    if (now >= startDate && now <= endDate) return 'ongoing'
    if (now > endDate) return 'completed'
    
    return event.status
  }

  // Get status icon
  const getStatusIcon = () => {
    const status = getEventStatus()
    switch (status) {
      case 'upcoming':
        return <Timer className="w-4 h-4" />
      case 'ongoing':
        return <Play className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'postponed':
        return <Pause className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  // Get status color
  const getStatusColor = () => {
    const status = getEventStatus()
    switch (status) {
      case 'upcoming':
        return 'blue'
      case 'ongoing':
        return 'green'
      case 'completed':
        return 'gray'
      case 'cancelled':
        return 'red'
      case 'postponed':
        return 'yellow'
      default:
        return EVENT_STATUS_COLORS[event.status] || 'gray'
    }
  }

  // Calculate remaining slots
  const availableSlots = event.maxParticipants && event.registrationCount 
    ? event.maxParticipants - event.registrationCount 
    : null

  // Check if registration is full
  const isRegistrationFull = availableSlots !== null && availableSlots <= 0

  return (
    <motion.div
      layout
      className={cn("w-full", className)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          {/* Title and action area */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {event.title}
                </h3>
                
                {/* Status badge */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-1",
                    `border-${getStatusColor()}-300 text-${getStatusColor()}-700 bg-${getStatusColor()}-50`
                  )}
                >
                  {getStatusIcon()}
                  {EVENT_STATUS_LABELS[event.status]}
                </Badge>

                {/* Event type badge */}
                <Badge variant="secondary">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </Badge>
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(event)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(event)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                {event.registrationRequired && onManageRegistrations && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageRegistrations(event)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView?.(event)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(event)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </DropdownMenuItem>
                    {event.registrationRequired && onManageRegistrations && (
                      <DropdownMenuItem onClick={() => onManageRegistrations(event)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Manage Registration
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(event.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Basic information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div>{formatDate(event.startDate)}</div>
                {event.endDate && event.endDate !== event.startDate && (
                  <div className="text-xs">to {formatDate(event.endDate)}</div>
                )}
              </div>
            </div>

            {/* Time */}
            {(event.startTime || event.endTime) && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <div>
                  {event.startTime && <div>{formatTime(event.startTime)}</div>}
                  {event.endTime && event.endTime !== event.startTime && (
                    <div className="text-xs">to {formatTime(event.endTime)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Participant information */}
            {showRegistrationInfo && event.registrationRequired && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <div>
                  <div>
                    {event.registrationCount || 0} registered
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </div>
                  {availableSlots !== null && (
                    <div className={cn(
                      "text-xs",
                      isRegistrationFull ? "text-red-600" : "text-green-600"
                    )}>
                      {isRegistrationFull ? "Full" : `${availableSlots} spots left`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Target grades */}
          {event.targetGrades && event.targetGrades.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Target grades:</span>
              <div className="flex flex-wrap gap-1">
                {event.targetGrades.map((grade) => (
                  <Badge key={grade} variant="outline" className="text-xs">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Expand/collapse detailed information */}
          {onToggleExpand && (
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="w-full justify-center"
              >
                {isExpanded ? (
                  <>
                    Collapse Details
                    <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Show Details
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Expanded detailed information */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="space-y-3">
                    {/* Complete description */}
                    {event.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Event Description</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* Registration information */}
                    {event.registrationRequired && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Registration Information</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {event.registrationDeadline && (
                            <div>Registration deadline: {formatDate(event.registrationDeadline)}</div>
                          )}
                          {event.maxParticipants && (
                            <div>Max participants: {event.maxParticipants} people</div>
                          )}
                          <div>
                            Currently registered: {event.registrationCount || 0} people
                            {availableSlots !== null && (
                              <span className={cn(
                                "ml-2",
                                isRegistrationFull ? "text-red-600" : "text-green-600"
                              )}>
                                ({isRegistrationFull ? "Full" : `${availableSlots} spots left`})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Creation information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Creation Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {event.creator && (
                          <div>Creator: {event.creator.displayName || event.creator.email}</div>
                        )}
                        <div>Created: {formatDate(event.createdAt)}</div>
                        <div>Last updated: {formatDate(event.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}