'use client'

/**
 * Registration Badge Component
 * Registration Badge Component
 * 
 * @description Badge component that displays registration status on calendar events
 * @features Registration count display, status indicators, quick actions
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Event } from '@/lib/types'

interface RegistrationBadgeProps {
  event: Event
  showDetails?: boolean
  onClick?: () => void
  className?: string
}

export default function RegistrationBadge({
  event,
  showDetails = false,
  onClick,
  className
}: RegistrationBadgeProps) {
  if (!event.registrationRequired) {
    return null
  }

  const registrationCount = event.registrationCount || 0
  const maxParticipants = event.maxParticipants || 0
  const hasLimit = maxParticipants > 0
  const isFull = hasLimit && registrationCount >= maxParticipants
  const isNearFull = hasLimit && registrationCount >= maxParticipants * 0.8
  
  // Calculate registration status
  const getRegistrationStatus = () => {
    if (isFull) {
      return {
        status: 'full',
        color: 'destructive',
        icon: UserX,
        label: 'Full',
        bgColor: 'bg-red-100 border-red-200',
        textColor: 'text-red-800'
      }
    } else if (isNearFull) {
      return {
        status: 'nearly_full',
        color: 'outline',
        icon: AlertTriangle,
        label: 'Nearly Full',
        bgColor: 'bg-orange-100 border-orange-200',
        textColor: 'text-orange-800'
      }
    } else {
      return {
        status: 'open',
        color: 'default',
        icon: UserCheck,
        label: 'Open for Registration',
        bgColor: 'bg-green-100 border-green-200',
        textColor: 'text-green-800'
      }
    }
  }

  const statusInfo = getRegistrationStatus()
  const IconComponent = statusInfo.icon

  // Check registration deadline
  const registrationDeadline = event.registrationDeadline
  const isDeadlinePassed = registrationDeadline && new Date(registrationDeadline) < new Date()

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
        statusInfo.bgColor,
        statusInfo.textColor,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      <IconComponent className="w-3 h-3" />
      <span>
        {hasLimit ? `${registrationCount}/${maxParticipants}` : `${registrationCount} people`}
      </span>
      
      {showDetails && (
        <>
          <span className="text-gray-400">•</span>
          <span>{statusInfo.label}</span>
        </>
      )}
      
      {isDeadlinePassed && (
        <>
          <span className="text-gray-400">•</span>
          <Clock className="w-3 h-3 text-red-500" />
          <span className="text-red-600">Closed</span>
        </>
      )}
    </motion.div>
  )

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">{statusInfo.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {hasLimit 
                  ? `${registrationCount} registered, limit ${maxParticipants} people`
                  : `${registrationCount} registered, no limit`
                }
              </div>
              {registrationDeadline && (
                <div className="text-xs text-muted-foreground mt-1">
                  Registration deadline: {new Date(registrationDeadline).toLocaleDateString()}
                </div>
              )}
              {onClick && (
                <div className="text-xs text-blue-600 mt-1">
                  Click to manage registration
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

// Quick registration status component
export function QuickRegistrationStatus({ 
  event, 
  onManage 
}: { 
  event: Event
  onManage?: () => void 
}) {
  if (!event.registrationRequired) {
    return (
      <Badge variant="secondary" className="text-xs">
        No Registration Required
      </Badge>
    )
  }

  const registrationCount = event.registrationCount || 0
  const maxParticipants = event.maxParticipants || 0
  const isFull = maxParticipants > 0 && registrationCount >= maxParticipants

  return (
    <div className="flex items-center gap-2">
      <RegistrationBadge event={event} onClick={onManage} />
      
      {onManage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onManage}
          className="h-6 px-2 text-xs"
        >
          Manage
        </Button>
      )}
    </div>
  )
}

// Registration progress bar component
export function RegistrationProgress({ 
  event, 
  showLabel = true 
}: { 
  event: Event
  showLabel?: boolean 
}) {
  if (!event.registrationRequired || !event.maxParticipants) {
    return null
  }

  const registrationCount = event.registrationCount || 0
  const maxParticipants = event.maxParticipants
  const percentage = Math.min((registrationCount / maxParticipants) * 100, 100)
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>Registration Progress</span>
          <span>{registrationCount}/{maxParticipants}</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={cn("h-2 rounded-full transition-all duration-300", getProgressColor())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {showLabel && (
        <div className="text-xs text-gray-500">
          {percentage.toFixed(0)}% Full
        </div>
      )}
    </div>
  )
}