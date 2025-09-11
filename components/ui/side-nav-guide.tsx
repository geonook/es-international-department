"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, BookOpen, Trophy } from 'lucide-react'

/**
 * SideNavGuide Component
 * 
 * @description 優雅的側邊導引指示器，提供低調的頁面導航功能
 * @features 智能展開/收合、平滑滾動、當前區塊高亮、響應式隱藏
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface NavSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  offset: number // 滾動偏移量調整
}

interface SideNavGuideProps {
  /** 自定義 className */
  className?: string
}

const sections: NavSection[] = [
  { 
    id: 'id-news', 
    label: 'ID NEWS', 
    icon: Newspaper,
    offset: -80 // 考慮固定導航欄高度
  },
  { 
    id: 'pacing-guides', 
    label: 'Pacing Guides', 
    icon: BookOpen,
    offset: -80
  },
  { 
    id: 'id-squads', 
    label: 'ID Squads', 
    icon: Trophy,
    offset: -80
  }
]

export default function SideNavGuide({ className = '' }: SideNavGuideProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      // 檢查是否應該顯示導引（滾動超過首頁標題區域）
      const heroHeight = window.innerHeight * 0.8
      setIsVisible(window.scrollY > heroHeight)

      // 找出當前最接近的區塊
      let currentSection = ''
      let minDistance = Infinity

      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          const distance = Math.abs(rect.top - 100) // 100px 作為觸發區域
          
          if (distance < minDistance && rect.top < window.innerHeight * 0.7) {
            minDistance = distance
            currentSection = section.id
          }
        }
      })

      setActiveSection(currentSection)
    }

    // 使用 throttle 優化滾動性能
    const throttledHandleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 16) // ~60fps
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    handleScroll() // 初始化檢查

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const scrollToSection = (sectionId: string, offset: number) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition + offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <motion.div
        className="bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl shadow-lg overflow-hidden"
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-2">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id
            const Icon = section.icon

            return (
              <motion.div
                key={section.id}
                layout
                className={`relative mb-2 last:mb-0`}
              >
                <motion.button
                  onClick={() => scrollToSection(section.id, section.offset)}
                  className={`
                    group relative w-full flex items-center gap-3 p-3 rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                      : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Navigate to ${section.label}`}
                >
                  {/* 圖標 */}
                  <motion.div
                    className={`
                      flex-shrink-0 transition-colors duration-300
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-500'}
                    `}
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>

                  {/* 標籤文字 */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`
                          whitespace-nowrap text-sm font-medium overflow-hidden
                          ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-purple-600'}
                        `}
                      >
                        {section.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* 活動指示器 */}
                  {isActive && (
                    <motion.div
                      className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>

                {/* 連接線 */}
                {index < sections.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-4 bg-gradient-to-b from-purple-200 to-transparent" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 底部裝飾 */}
        <motion.div
          className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isExpanded ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'center' }}
        />
      </motion.div>

      {/* 提示文字 */}
      {!isExpanded && (
        <motion.div
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.7, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ delay: 2, duration: 0.3 }}
        >
          <div className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            Quick Navigation
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export type { SideNavGuideProps }