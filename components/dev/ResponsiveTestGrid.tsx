'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * ResponsiveTestGrid - Development tool for testing responsive breakpoints
 * 
 * @description Visual grid overlay to test responsive design across different screen sizes
 * @features Breakpoint indicators, touch target validation, grid overlay
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 * @note Only use in development environment
 */
export default function ResponsiveTestGrid({ show = false }: { show?: boolean }) {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const [breakpoint, setBreakpoint] = useState('')

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setScreenSize({ width, height })

      // Determine current breakpoint
      if (width < 640) {
        setBreakpoint('mobile (< 640px)')
      } else if (width < 768) {
        setBreakpoint('sm (640px - 767px)')
      } else if (width < 1024) {
        setBreakpoint('md (768px - 1023px)')
      } else if (width < 1280) {
        setBreakpoint('lg (1024px - 1279px)')
      } else if (width < 1536) {
        setBreakpoint('xl (1280px - 1535px)')
      } else {
        setBreakpoint('2xl (>= 1536px)')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  if (!show || process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Breakpoint indicator */}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono">
        <div>Screen: {screenSize.width} × {screenSize.height}</div>
        <div>Breakpoint: {breakpoint}</div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20">
        {/* Vertical lines for container margins */}
        <div className="absolute top-0 bottom-0 left-4 w-px bg-red-500 sm:left-6 lg:left-8"></div>
        <div className="absolute top-0 bottom-0 right-4 w-px bg-red-500 sm:right-6 lg:right-8"></div>
        
        {/* Central container guide */}
        <div className="absolute inset-0 mx-auto max-w-7xl bg-blue-500/10 border-l border-r border-blue-500/30"></div>
        
        {/* Horizontal grid lines every 44px (touch target height) */}
        {Array.from({ length: Math.ceil(screenSize.height / 44) }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-green-500/30"
            style={{ top: i * 44 }}
          ></div>
        ))}
      </div>

      {/* Touch target validator circles */}
      <div className="absolute inset-0">
        {/* 44px minimum touch targets at common positions */}
        <div className="absolute top-4 right-4 w-11 h-11 border-2 border-yellow-500 rounded-full bg-yellow-500/10"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11 h-11 border-2 border-yellow-500 rounded-full bg-yellow-500/10"></div>
      </div>

      {/* Responsive breakpoint bars */}
      <div className="absolute bottom-4 left-4 space-y-1">
        <div className="text-xs font-mono text-white bg-black/80 px-2 py-1 rounded">
          Responsive Breakpoints:
        </div>
        <div className={cn(
          "text-xs font-mono px-2 py-1 rounded",
          screenSize.width < 640 ? "bg-red-500 text-white" : "bg-gray-500 text-white"
        )}>
          Mobile: &lt; 640px
        </div>
        <div className={cn(
          "text-xs font-mono px-2 py-1 rounded",
          screenSize.width >= 640 && screenSize.width < 768 ? "bg-red-500 text-white" : "bg-gray-500 text-white"
        )}>
          SM: 640px+
        </div>
        <div className={cn(
          "text-xs font-mono px-2 py-1 rounded",
          screenSize.width >= 768 && screenSize.width < 1024 ? "bg-red-500 text-white" : "bg-gray-500 text-white"
        )}>
          MD: 768px+
        </div>
        <div className={cn(
          "text-xs font-mono px-2 py-1 rounded",
          screenSize.width >= 1024 && screenSize.width < 1280 ? "bg-red-500 text-white" : "bg-gray-500 text-white"
        )}>
          LG: 1024px+
        </div>
        <div className={cn(
          "text-xs font-mono px-2 py-1 rounded",
          screenSize.width >= 1280 ? "bg-red-500 text-white" : "bg-gray-500 text-white"
        )}>
          XL: 1280px+
        </div>
      </div>
    </div>
  )
}

/**
 * ResponsiveTestControls - Dev controls for testing responsive features
 */
export function ResponsiveTestControls() {
  const [showGrid, setShowGrid] = useState(false)
  
  if (process.env.NODE_ENV === 'production') return null

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-[10000]">
        <div className="text-xs font-bold mb-2">DEV TOOLS</div>
        <label className="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Show Responsive Grid</span>
        </label>
        
        {/* Quick device presets */}
        <div className="mt-3 space-y-1">
          <div className="text-xs font-semibold text-gray-300">Quick Test Sizes:</div>
          <button
            onClick={() => {
              const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement
              if (viewport) {
                viewport.content = 'width=375, initial-scale=1'
                window.location.reload()
              }
            }}
            className="block w-full text-left px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            iPhone SE (375px)
          </button>
          <button
            onClick={() => {
              const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement
              if (viewport) {
                viewport.content = 'width=768, initial-scale=1'
                window.location.reload()
              }
            }}
            className="block w-full text-left px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            iPad (768px)
          </button>
          <button
            onClick={() => {
              const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement
              if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1'
                window.location.reload()
              }
            }}
            className="block w-full text-left px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded"
          >
            Reset Viewport
          </button>
        </div>
      </div>
      
      <ResponsiveTestGrid show={showGrid} />
    </>
  )
}