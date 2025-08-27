/**
 * Responsive Table Component for KCISLK ESID Info Hub
 * 響應式表格組件 - 支援行動版和桌面版顯示
 * 
 * Features:
 * - 自動橫向滾動
 * - 行動版卡片替代方案
 * - 觸控友好的控制元素
 * - 滾動指示器
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  showScrollIndicators?: boolean
  mobileCardView?: boolean
  stickyHeader?: boolean
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isHeader?: boolean
}

interface ResponsiveTableCellProps {
  children: React.ReactNode
  className?: string
  isHeader?: boolean
  priority?: 'high' | 'medium' | 'low' // 用於決定在小螢幕的顯示優先級
  mobileLabel?: string // 行動版顯示的標籤
}

// 響應式表格滾動指示器
const ScrollIndicators = ({ 
  showLeft, 
  showRight, 
  onScrollLeft, 
  onScrollRight 
}: {
  showLeft: boolean
  showRight: boolean
  onScrollLeft: () => void
  onScrollRight: () => void
}) => (
  <>
    <AnimatePresence>
      {showLeft && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onScrollLeft}
            className="ml-2 pointer-events-auto bg-white/90 backdrop-blur-sm shadow-md hover:bg-white min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showRight && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onScrollRight}
            className="mr-2 pointer-events-auto bg-white/90 backdrop-blur-sm shadow-md hover:bg-white min-h-[44px]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  </>
)

// 主要響應式表格組件
export const ResponsiveTable = ({ 
  children, 
  className, 
  showScrollIndicators = true,
  mobileCardView = false,
  stickyHeader = false
}: ResponsiveTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftIndicator, setShowLeftIndicator] = useState(false)
  const [showRightIndicator, setShowRightIndicator] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 檢查是否為行動設備
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 檢查滾動指示器顯示狀態
  const checkScrollIndicators = () => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setShowLeftIndicator(scrollLeft > 0)
    setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    checkScrollIndicators()
    container.addEventListener('scroll', checkScrollIndicators)
    return () => container.removeEventListener('scroll', checkScrollIndicators)
  }, [])

  // 滾動控制
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
          className
        )}
        style={{ scrollbarWidth: 'thin' }}
      >
        <table className={cn(
          "w-full min-w-full",
          stickyHeader && "relative"
        )}>
          {children}
        </table>
      </div>

      {/* 滾動指示器 */}
      {showScrollIndicators && !isMobile && (
        <ScrollIndicators
          showLeft={showLeftIndicator}
          showRight={showRightIndicator}
          onScrollLeft={scrollLeft}
          onScrollRight={scrollRight}
        />
      )}
    </div>
  )
}

// 表格標題組件
export const ResponsiveTableHeader = ({ 
  children, 
  className 
}: ResponsiveTableHeaderProps) => (
  <thead className={cn(
    "bg-gray-50 border-b border-gray-200 sticky top-0 z-20",
    className
  )}>
    {children}
  </thead>
)

// 表格主體組件
export const ResponsiveTableBody = ({ 
  children, 
  className 
}: ResponsiveTableBodyProps) => (
  <tbody className={cn("divide-y divide-gray-200", className)}>
    {children}
  </tbody>
)

// 表格行組件
export const ResponsiveTableRow = ({ 
  children, 
  className, 
  onClick,
  isHeader = false
}: ResponsiveTableRowProps) => (
  <tr 
    className={cn(
      "hover:bg-gray-50 transition-colors",
      onClick && "cursor-pointer",
      isHeader && "bg-gray-50",
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
)

// 表格單元格組件
export const ResponsiveTableCell = ({ 
  children, 
  className, 
  isHeader = false,
  priority = 'medium',
  mobileLabel
}: ResponsiveTableCellProps) => {
  const cellContent = (
    <div className={cn(
      "text-sm",
      isHeader ? "font-medium text-gray-900" : "text-gray-600",
      // 行動版響應式顯示
      priority === 'low' && "hidden sm:block",
      priority === 'medium' && "hidden md:block sm:hidden",
    )}>
      {/* 行動版標籤 */}
      {mobileLabel && !isHeader && (
        <div className="block sm:hidden">
          <span className="font-medium text-gray-900 text-xs">{mobileLabel}: </span>
          <span className="text-gray-600">{children}</span>
        </div>
      )}
      
      {/* 桌面版內容 */}
      <div className={cn(mobileLabel && !isHeader && "hidden sm:block")}>
        {children}
      </div>
    </div>
  )

  const Component = isHeader ? 'th' : 'td'

  return (
    <Component 
      className={cn(
        "px-3 sm:px-6 py-3 sm:py-4 text-left",
        isHeader && "font-medium text-gray-900 uppercase tracking-wider text-xs",
        className
      )}
    >
      {cellContent}
    </Component>
  )
}

// 行動版卡片視圖組件
export const MobileCardView = ({ 
  data,
  renderCard,
  className
}: {
  data: any[]
  renderCard: (item: any, index: number) => React.ReactNode
  className?: string
}) => (
  <div className={cn("space-y-3 sm:hidden", className)}>
    {data.map((item, index) => (
      <Card key={index} className="overflow-hidden">
        <CardContent className="p-4">
          {renderCard(item, index)}
        </CardContent>
      </Card>
    ))}
  </div>
)

// 表格工具欄組件
export const TableToolbar = ({ 
  children, 
  className,
  title,
  description 
}: {
  children?: React.ReactNode
  className?: string
  title?: string
  description?: string
}) => (
  <div className={cn(
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4",
    className
  )}>
    <div className="flex-1 min-w-0">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
    
    {children && (
      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        {children}
      </div>
    )}
  </div>
)

// 表格狀態組件（空狀態、載入等）
export const TableState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center py-8 sm:py-12 text-center",
    className
  )}>
    {Icon && <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />}
    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
    )}
    {action}
  </div>
)

// 響應式分頁組件
export const ResponsivePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageInfo?: boolean
  className?: string
}) => {
  const maxVisiblePages = 5
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-3 mt-4",
      className
    )}>
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          顯示第 {currentPage} 頁，共 {totalPages} 頁
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">上一頁</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const page = startPage + i
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-h-[44px] min-w-[44px]"
              >
                {page}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="min-h-[44px]"
        >
          <span className="hidden sm:inline mr-1">下一頁</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default ResponsiveTable