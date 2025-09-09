'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Calendar, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Resources', href: '/resources', icon: BookOpen }
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleNav = () => setIsOpen(!isOpen)
  const closeNav = () => setIsOpen(false)

  // 鍵盤導航支援 | Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      closeNav()
    }
  }

  // 焦點陷阱與背景滾動控制 | Focus trap and background scroll control
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any)
      document.body.style.overflow = 'hidden' // 防止背景滾動
    } else {
      document.removeEventListener('keydown', handleKeyDown as any)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* 漢堡選單按鈕 - 只在行動裝置顯示 */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden p-2"
        onClick={toggleNav}
        aria-label={isOpen ? "關閉選單" : "開啟選單"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-haspopup="true"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* 背景遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeNav}
          />
        )}
      </AnimatePresence>

      {/* Google Material Design側邊選單 */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="mobile-menu"
            role="navigation"
            aria-label="主要導航選單"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'tween',
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1] // Material Design標準easing
            }}
            className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden"
          >
            {/* 選單頭部 - 採用Material Design規範 */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-gray-800">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    ES International
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Department
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 hover:bg-purple-100 dark:hover:bg-gray-700"
                onClick={closeNav}
                aria-label="關閉選單"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 導航項目 - Material Design列表樣式 */}
            <div className="py-2">
              <nav role="menu">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      role="menuitem"
                      tabIndex={0}
                      onClick={closeNav}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          closeNav()
                          window.location.href = item.href
                        }
                      }}
                      className="flex items-center gap-4 px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none transition-colors duration-150 group"
                    >
                      <IconComponent className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* 底部品牌標識 */}
            <div className="absolute bottom-4 left-6 right-6">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                ES International Department
              </p>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
                Excellence in Education
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}