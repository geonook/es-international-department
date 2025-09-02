/**
 * Unified Navigation Component
 * 統一導航組件 - 對齊 Google Sites 的專業教育風格
 * 
 * Features:
 * - Responsive design (Mobile-First)
 * - Professional blue-gray theme
 * - Clean hierarchical structure
 * - Role-based navigation
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageSquare,
  Bell,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Calendar,
  BookOpen,
  Shield,
  ExternalLink
} from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { useAuth } from '@/hooks/useAuth'
import { designSystem } from '@/lib/design-system'
import { cn } from '@/lib/utils'

// 📋 Navigation Item Types
export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ElementType
  external?: boolean
  badge?: string | number
  children?: NavigationItem[]
  requiredRole?: 'viewer' | 'office_member' | 'admin'
  description?: string
}

// 🧭 Navigation Configuration (aligned with Google Sites structure)
const navigationConfig: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    description: 'Main dashboard and corner selection'
  },
  {
    id: 'feedback',
    label: 'ESID Feedback',
    href: '/feedback',
    icon: MessageCircle,
    description: 'Submit feedback and suggestions'
  },
  {
    id: 'information',
    label: 'Information Hub',
    icon: Bell,
    description: 'Communications and reminders',
    children: [
      {
        id: 'message-board',
        label: 'Message Board',
        href: '/teachers/message-board',
        icon: MessageSquare,
        description: '25-26 School Year discussions'
      },
      {
        id: 'reminders',
        label: 'Reminders',
        href: '/teachers/reminders', 
        icon: Bell,
        description: 'Important reminders and notifications'
      }
    ]
  },
  {
    id: 'documents',
    label: 'Essential Documents',
    icon: FileText,
    description: 'Important documents and resources',
    children: [
      {
        id: 'academic',
        label: 'Academic Affairs',
        href: '/documents/academic',
        icon: BookOpen,
        description: 'Academic policies and procedures'
      },
      {
        id: 'foreign',
        label: 'Foreign Affairs', 
        href: '/documents/foreign',
        icon: Users,
        description: 'International programs and exchange'
      },
      {
        id: 'classroom',
        label: 'Classroom Affairs',
        href: '/documents/classroom',
        icon: Calendar,
        description: 'Classroom management and resources'
      }
    ]
  },
  {
    id: 'parents',
    label: 'Parents\' Corner',
    href: '/parents',
    icon: Users,
    external: true,
    description: 'Resources and information for parents'
  },
  {
    id: 'admin',
    label: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
    requiredRole: 'admin',
    description: 'Administrative controls and settings'
  }
]

// 🎨 Navigation Styles
const navStyles = {
  container: cn(
    'bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20',
    'sticky top-0 z-50'
  ),
  
  desktop: cn(
    'hidden md:flex items-center justify-between',
    'container mx-auto px-4 py-3'
  ),
  
  mobile: cn(
    'md:hidden flex items-center justify-between',
    'px-4 py-3'
  ),
  
  brand: cn(
    'flex items-center gap-3 text-xl font-bold',
    'bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'
  ),
  
  menuButton: cn(
    'p-2 rounded-lg bg-blue-100 text-blue-700',
    'hover:bg-blue-200 transition-colors'
  ),
  
  navList: cn(
    'flex items-center space-x-1'
  ),
  
  navItem: cn(
    'flex items-center gap-2 px-3 py-2 rounded-lg',
    'text-gray-600 hover:text-blue-700 hover:bg-blue-50',
    'transition-all duration-200'
  ),
  
  navItemActive: cn(
    'text-blue-700 bg-blue-100 font-medium'
  ),
  
  dropdown: cn(
    'absolute top-full left-0 mt-1 py-2',
    'bg-white rounded-lg shadow-xl border border-gray-200',
    'min-w-64 z-50'
  ),
  
  dropdownItem: cn(
    'flex items-start gap-3 px-4 py-3',
    'text-gray-600 hover:text-blue-700 hover:bg-blue-50',
    'transition-colors duration-200'
  ),
  
  mobileMenu: cn(
    'absolute top-full left-0 right-0',
    'bg-white shadow-xl border-t border-gray-200',
    'max-h-screen overflow-y-auto'
  )
}

export function UnifiedNavigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  // Check if user has required role
  const hasRequiredRole = (requiredRole?: string): boolean => {
    if (!requiredRole) return true
    if (!user) return false
    
    const roleHierarchy = { viewer: 1, office_member: 2, admin: 3 }
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 999
    
    return userLevel >= requiredLevel
  }

  // Filter navigation items based on user role
  const filteredNavigation = navigationConfig.filter(item => 
    hasRequiredRole(item.requiredRole)
  )

  // Check if current path is active
  const isActive = (href?: string): boolean => {
    if (!href) return false
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  // Handle dropdown toggle
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  return (
    <header className={navStyles.container}>
      {/* Desktop Navigation */}
      <nav className={navStyles.desktop}>
        {/* Brand */}
        <Link href="/" className={navStyles.brand}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          ESID Info Hub
        </Link>

        {/* Navigation Items */}
        <div className={navStyles.navList}>
          {filteredNavigation.map((item) => (
            <div key={item.id} className="relative">
              {item.children ? (
                // Dropdown Navigation Item
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className={cn(
                    navStyles.navItem,
                    activeDropdown === item.id && 'text-blue-700 bg-blue-50'
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform',
                    activeDropdown === item.id && 'rotate-180'
                  )} />
                </button>
              ) : (
                // Regular Navigation Item
                <Link
                  href={item.href!}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    navStyles.navItem,
                    isActive(item.href) && navStyles.navItemActive
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                  {item.external && <ExternalLink className="w-3 h-3" />}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )}

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === item.id && item.children && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={navStyles.dropdown}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href!}
                        target={child.external ? '_blank' : undefined}
                        rel={child.external ? 'noopener noreferrer' : undefined}
                        className={cn(
                          navStyles.dropdownItem,
                          isActive(child.href) && 'text-blue-700 bg-blue-50'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {child.icon && (
                            <child.icon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{child.label}</span>
                            {child.external && <ExternalLink className="w-3 h-3" />}
                            {child.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {child.badge}
                              </Badge>
                            )}
                          </div>
                          {child.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {child.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.displayName || user.email}
            </span>
            <Badge variant="outline" className="text-xs">
              {user.role}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <nav className={navStyles.mobile}>
        {/* Brand */}
        <Link href="/" className={navStyles.brand}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          ESID
        </Link>

        {/* Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={navStyles.menuButton}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={navStyles.mobileMenu}
          >
            <div className="py-4">
              {filteredNavigation.map((item) => (
                <MobileNavItem key={item.id} item={item} />
              ))}
              
              {/* User Info */}
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-200 px-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.displayName || user.email}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {user.role}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// 📱 Mobile Navigation Item Component
function MobileNavItem({ item }: { item: NavigationItem }) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  const isActive = (href?: string): boolean => {
    if (!href) return false
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-600 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </div>
          <ChevronRight className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-90'
          )} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-gray-50"
            >
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.href!}
                  target={child.external ? '_blank' : undefined}
                  rel={child.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'flex items-center gap-3 pl-12 pr-4 py-3',
                    'text-gray-600 hover:text-blue-700 hover:bg-white',
                    isActive(child.href) && 'text-blue-700 bg-white'
                  )}
                >
                  {child.icon && <child.icon className="w-4 h-4" />}
                  <span>{child.label}</span>
                  {child.external && <ExternalLink className="w-3 h-3" />}
                  {child.badge && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {child.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'text-gray-600 hover:text-blue-700 hover:bg-gray-50',
        isActive(item.href) && 'text-blue-700 bg-blue-50'
      )}
    >
      {item.icon && <item.icon className="w-5 h-5" />}
      <span>{item.label}</span>
      {item.external && <ExternalLink className="w-3 h-3" />}
      {item.badge && (
        <Badge variant="secondary" className="text-xs ml-auto">
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

export default UnifiedNavigation