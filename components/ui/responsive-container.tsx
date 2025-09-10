'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * ResponsiveContainer - A flexible container component for consistent responsive layouts
 * 
 * @description Provides consistent padding, max-widths, and responsive behavior across the app
 * @features Responsive padding, multiple size variants, consistent spacing
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export default function ResponsiveContainer({
  children,
  className,
  size = 'lg',
  padding = 'md'
}: ResponsiveContainerProps) {
  
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-4 sm:px-6 lg:px-12'
  }
  
  return (
    <div className={cn(
      'mx-auto w-full',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

/**
 * ResponsiveGrid - Responsive grid component with common breakpoint patterns
 */
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12'
  }
  
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    cols.tablet && `sm:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap],
    className
  )
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

/**
 * ResponsiveText - Typography component with responsive sizing
 */
interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
}

export function ResponsiveText({
  children,
  className,
  as: Component = 'p',
  size = 'base',
  weight = 'normal'
}: ResponsiveTextProps) {
  
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
    '4xl': 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl'
  }
  
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
  
  return (
    <Component className={cn(
      sizeClasses[size],
      weightClasses[weight],
      'leading-tight',
      className
    )}>
      {children}
    </Component>
  )
}

/**
 * TouchButton - Button component optimized for touch interactions
 */
interface TouchButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}

export function TouchButton({
  children,
  className,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false
}: TouchButtonProps) {
  
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800 shadow-sm hover:shadow-md',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-sm hover:shadow-md',
    ghost: 'text-purple-600 hover:bg-purple-50'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  )
}