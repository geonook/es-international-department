"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * BackToTop Component
 * 
 * @description 可重用的返回頂部按鈕元件，提供平滑滾動效果和優雅的動畫
 * @features 自動顯示/隱藏、平滑滾動、響應式設計、紫色主題一致性
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

interface BackToTopProps {
  /** 觸發顯示按鈕的滾動距離（像素） */
  threshold?: number
  /** 自定義 className */
  className?: string
}

export default function BackToTop({ 
  threshold = 300, 
  className = '' 
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 加入事件監聽器
    window.addEventListener('scroll', toggleVisibility, { passive: true })

    // 清理事件監聽器
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut" 
          }}
          className={`fixed bottom-6 right-6 z-40 ${className}`}
        >
          <motion.div
            whileHover={{ 
              scale: 1.1, 
              y: -2,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              aria-label="返回頁面頂部"
              title="返回頁面頂部"
            >
              <motion.div
                animate={{ 
                  y: [-1, 1, -1] 
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ArrowUp className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

          {/* 裝飾性光環效果 */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 to-purple-600/30 blur-lg -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type { BackToTopProps }