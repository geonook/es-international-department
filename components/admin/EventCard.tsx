'use client'

/**
 * Event Card Component
 * 活動卡片組件
 * 
 * @description 單一活動資訊展示卡片，支援展開/收合和操作按鈕
 * @features 狀態指示、快速操作、報名資訊、響應式設計
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
  // 格式化日期
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 格式化時間
  const formatTime = (time: Date | string) => {
    return new Date(time).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 計算活動狀態
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

  // 獲取狀態圖示
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

  // 獲取狀態顏色
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

  // 計算剩餘名額
  const availableSlots = event.maxParticipants && event.registrationCount 
    ? event.maxParticipants - event.registrationCount 
    : null

  // 判斷是否報名已滿
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
          {/* 標題和操作區域 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {event.title}
                </h3>
                
                {/* 狀態標籤 */}
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

                {/* 活動類型標籤 */}
                <Badge variant="secondary">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </Badge>
              </div>

              {/* 描述 */}
              {event.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}
            </div>

            {/* 操作按鈕 */}
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
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView?.(event)}>
                      <Eye className="w-4 h-4 mr-2" />
                      查看詳情
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(event)}>
                      <Edit className="w-4 h-4 mr-2" />
                      編輯活動
                    </DropdownMenuItem>
                    {event.registrationRequired && onManageRegistrations && (
                      <DropdownMenuItem onClick={() => onManageRegistrations(event)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        管理報名
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(event.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      刪除活動
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* 基本資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 日期 */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div>{formatDate(event.startDate)}</div>
                {event.endDate && event.endDate !== event.startDate && (
                  <div className="text-xs">至 {formatDate(event.endDate)}</div>
                )}
              </div>
            </div>

            {/* 時間 */}
            {(event.startTime || event.endTime) && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <div>
                  {event.startTime && <div>{formatTime(event.startTime)}</div>}
                  {event.endTime && event.endTime !== event.startTime && (
                    <div className="text-xs">至 {formatTime(event.endTime)}</div>
                  )}
                </div>
              </div>
            )}

            {/* 地點 */}
            {event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* 參與者資訊 */}
            {showRegistrationInfo && event.registrationRequired && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <div>
                  <div>
                    {event.registrationCount || 0} 人報名
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </div>
                  {availableSlots !== null && (
                    <div className={cn(
                      "text-xs",
                      isRegistrationFull ? "text-red-600" : "text-green-600"
                    )}>
                      {isRegistrationFull ? "名額已滿" : `剩餘 ${availableSlots} 個名額`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 目標年級 */}
          {event.targetGrades && event.targetGrades.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">目標年級:</span>
              <div className="flex flex-wrap gap-1">
                {event.targetGrades.map((grade) => (
                  <Badge key={grade} variant="outline" className="text-xs">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 展開/收合詳細資訊 */}
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
                    收合詳細資訊
                    <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    展開詳細資訊
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* 展開的詳細資訊 */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="space-y-3">
                    {/* 完整描述 */}
                    {event.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">活動描述</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* 報名資訊 */}
                    {event.registrationRequired && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">報名資訊</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {event.registrationDeadline && (
                            <div>報名截止: {formatDate(event.registrationDeadline)}</div>
                          )}
                          {event.maxParticipants && (
                            <div>人數上限: {event.maxParticipants} 人</div>
                          )}
                          <div>
                            目前報名: {event.registrationCount || 0} 人
                            {availableSlots !== null && (
                              <span className={cn(
                                "ml-2",
                                isRegistrationFull ? "text-red-600" : "text-green-600"
                              )}>
                                ({isRegistrationFull ? "已滿額" : `剩餘 ${availableSlots} 個名額`})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 建立資訊 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">建立資訊</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {event.creator && (
                          <div>建立者: {event.creator.displayName || event.creator.email}</div>
                        )}
                        <div>建立時間: {formatDate(event.createdAt)}</div>
                        <div>最後更新: {formatDate(event.updatedAt)}</div>
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