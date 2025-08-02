'use client'

/**
 * Calendar View Toggle Component
 * 日曆檢視切換組件
 * 
 * @description 在列表檢視和日曆檢視之間切換的控制組件
 * @features 檢視模式切換、本地存儲記憶、動畫效果
 * @author Claude Code | Generated for ES International Department
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  List,
  Grid3X3
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ViewMode = 'list' | 'calendar' | 'grid'

interface CalendarViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

const viewConfig = {
  list: {
    icon: List,
    label: '列表檢視',
    description: '以列表形式查看活動'
  },
  calendar: {
    icon: Calendar,
    label: '日曆檢視',
    description: '以日曆形式查看活動'
  },
  grid: {
    icon: Grid3X3,
    label: '網格檢視',
    description: '以網格形式查看活動'
  }
}

export default function CalendarViewToggle({
  currentView,
  onViewChange,
  className,
  size = 'md',
  variant = 'outline'
}: CalendarViewToggleProps) {
  // 記住用戶選擇的檢視模式
  useEffect(() => {
    const savedView = localStorage.getItem('admin-events-view')
    if (savedView && savedView !== currentView) {
      onViewChange(savedView as ViewMode)
    }
  }, [])

  const handleViewChange = (view: ViewMode) => {
    onViewChange(view)
    localStorage.setItem('admin-events-view', view)
  }

  const buttonSize = {
    sm: 'sm',
    md: 'sm',
    lg: 'default'
  }[size] as 'sm' | 'default'

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size]

  return (
    <TooltipProvider>
      <div className={cn("flex items-center rounded-lg border bg-background p-1", className)}>
        {Object.entries(viewConfig).map(([view, config]) => {
          const IconComponent = config.icon
          const isActive = currentView === view
          
          return (
            <Tooltip key={view}>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size={buttonSize}
                    onClick={() => handleViewChange(view as ViewMode)}
                    className={cn(
                      "relative transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted"
                    )}
                  >
                    <IconComponent className={iconSize} />
                    {size === 'lg' && (
                      <span className="ml-2 text-sm font-medium">
                        {config.label}
                      </span>
                    )}
                    
                    {/* 活躍狀態指示器 */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-md border-2 border-primary/20"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

// Hook for managing view state
export function useCalendarView(defaultView: ViewMode = 'list') {
  const [currentView, setCurrentView] = useState<ViewMode>(defaultView)

  useEffect(() => {
    const savedView = localStorage.getItem('admin-events-view')
    if (savedView && ['list', 'calendar', 'grid'].includes(savedView)) {
      setCurrentView(savedView as ViewMode)
    }
  }, [])

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view)
    localStorage.setItem('admin-events-view', view)
  }

  return {
    currentView,
    setCurrentView: handleViewChange
  }
}